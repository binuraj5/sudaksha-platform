import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/** Score a single response against the question; returns { isCorrect, pointsAwarded }. */
function scoreResponse(
    responseData: unknown,
    question: { questionType: string; correctAnswer?: string | null; options?: unknown; points?: number }
): { isCorrect: boolean; pointsAwarded: number } {
    const points = question.points ?? 1;
    if (!responseData && responseData !== false && responseData !== 0) {
        return { isCorrect: false, pointsAwarded: 0 };
    }
    const type = (question.questionType || "").toUpperCase();
    if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE" || type === "SCENARIO_BASED") {
        const answer = typeof responseData === "string" ? responseData : (responseData as { transcript?: string })?.transcript ?? String(responseData);
        if (question.correctAnswer != null && question.correctAnswer !== "") {
            const correct = answer.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
            return { isCorrect: correct, pointsAwarded: correct ? points : 0 };
        }
        const opts = Array.isArray(question.options) ? question.options as { text?: string; isCorrect?: boolean }[] : [];
        const chosen = opts.find((o: { text?: string }) => String(o?.text).trim() === String(answer).trim());
        const isCorrect = chosen ? !!chosen.isCorrect : false;
        return { isCorrect, pointsAwarded: isCorrect ? points : 0 };
    }
    if (type === "CODING_CHALLENGE") {
        const data = responseData as { runResult?: { allPassed?: boolean } };
        const allPassed = data?.runResult?.allPassed === true;
        return { isCorrect: allPassed, pointsAwarded: allPassed ? points : 0 };
    }
    if (
        type === "VOICE_RESPONSE" ||
        type === "VIDEO_RESPONSE" ||
        (responseData && typeof responseData === "object" && ((responseData as { type?: string }).type === "VOICE_INTERVIEW" || (responseData as { type?: string }).type === "VIDEO_INTERVIEW"))
    ) {
        const data = responseData as { overall_score?: number };
        const score = typeof data?.overall_score === "number" ? data.overall_score : 0;
        const pointsAwarded = Math.round((score / 100) * points);
        return { isCorrect: pointsAwarded > 0, pointsAwarded };
    }
    return { isCorrect: false, pointsAwarded: 0 };
}

/** For ADAPTIVE_AI: get score from AdaptiveSession and update UserAssessmentComponent. */
async function computeAdaptiveComponentScore(
    userComponentId: string,
    assessmentId: string,
    componentId: string,
    maxScore: number
): Promise<boolean> {
    const adaptiveSession = await prisma.adaptiveSession.findFirst({
        where: { memberAssessmentId: assessmentId, componentId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
    });
    if (!adaptiveSession?.finalScore) return false;
    const percentage = Number(adaptiveSession.finalScore);
    const score = Math.round((percentage / 100) * maxScore);
    await prisma.userAssessmentComponent.update({
        where: { id: userComponentId },
        data: { score, percentage },
    });
    return true;
}

/** Compute component score from question responses and update UserAssessmentComponent + ComponentQuestionResponse. */
async function computeAndSaveComponentScore(userComponentId: string) {
    const responses = await prisma.componentQuestionResponse.findMany({
        where: { userComponentId },
        include: { question: true },
    });
    let totalPoints = 0;
    let earnedPoints = 0;
    for (const res of responses) {
        const q = res.question;
        const maxP = res.maxPoints ?? q.points ?? 1;
        totalPoints += maxP;
        const { isCorrect, pointsAwarded } = scoreResponse(res.responseData, {
            questionType: q.questionType,
            correctAnswer: q.correctAnswer,
            options: q.options,
            points: q.points ?? 1,
        });
        earnedPoints += pointsAwarded;
        await prisma.componentQuestionResponse.update({
            where: { id: res.id },
            data: { isCorrect, pointsAwardded: pointsAwarded },
        });
    }
    const score = earnedPoints;
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    await prisma.userAssessmentComponent.update({
        where: { id: userComponentId },
        data: { score, percentage },
    });
}

/**
 * POST /api/assessments/runner/[id]/component/[componentId]/complete
 * Marks the UserAssessmentComponent as completed and updates assessment progress.
 */
export async function POST(
    _req: NextRequest,
    ctx: { params: Promise<{ id: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: assessmentId, componentId } = await ctx.params;

        // 1. Org flow: ProjectUserAssessment
        const projectAssessment = await prisma.projectUserAssessment.findFirst({
            where: { id: assessmentId, userId: (session.user as { id: string }).id },
            include: {
                projectAssignment: { include: { model: { include: { components: { orderBy: { order: "asc" } } } } } },
                componentResults: true,
            },
        });

        if (projectAssessment) {
            const userComponent = await prisma.userAssessmentComponent.findFirst({
                where: { projectUserAssessmentId: assessmentId, componentId },
                orderBy: { createdAt: "desc" },
            });
            if (!userComponent) {
                return NextResponse.json({ error: "Component not started" }, { status: 400 });
            }

            const startedAt = userComponent.startedAt ? new Date(userComponent.startedAt).getTime() : Date.now();
            const timeSpent = Math.floor((Date.now() - startedAt) / 1000);

            await prisma.userAssessmentComponent.update({
                where: { id: userComponent.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    timeSpent,
                    timeLimitUsed: timeSpent,
                },
            });
            await computeAndSaveComponentScore(userComponent.id).catch(() => {});

            const components = projectAssessment.projectAssignment?.model?.components ?? [];
            const nextIndex = components.findIndex((c: { id: string }) => c.id === componentId) + 1;
            const nextComponent = nextIndex < components.length ? components[nextIndex] : null;
            const completedCount = projectAssessment.componentResults.filter(
                (r: { status: string }) => r.status === "COMPLETED"
            ).length;
            const totalComponents = components.length;
            const completionPercentage = totalComponents > 0 ? Math.round(((completedCount + 1) / totalComponents) * 100) : 100;

            const isLastSection = !nextComponent;
            let overallScore: number | null = null;
            let passed: boolean | null = null;
            if (isLastSection) {
                const allResults = await prisma.userAssessmentComponent.findMany({
                    where: { projectUserAssessmentId: assessmentId, status: "COMPLETED" },
                });
                const totalMax = allResults.reduce((s, r) => s + r.maxScore, 0);
                const totalScore = allResults.reduce((s, r) => s + (r.score ?? (r.percentage != null ? (r.percentage / 100) * r.maxScore : 0)), 0);
                overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
                const model = projectAssessment.projectAssignment?.model as { passingScore?: number } | undefined;
                passed = model?.passingScore != null ? overallScore >= model.passingScore : null;
                const totalTimeSpent = allResults.reduce((s, r) => s + (r.timeSpent ?? 0), 0);
                const nextId = nextComponent != null && "id" in nextComponent ? (nextComponent as { id: string }).id : null;
                await prisma.projectUserAssessment.update({
                    where: { id: assessmentId },
                    data: {
                        currentComponentId: nextId,
                        completionPercentage,
                        status: "COMPLETED" as const,
                        completedAt: new Date(),
                        submittedAt: new Date(),
                        overallScore: overallScore ?? undefined,
                        passed: passed ?? undefined,
                        totalTimeSpent,
                    },
                });
            } else {
                const nextId = nextComponent != null && "id" in nextComponent ? (nextComponent as { id: string }).id : null;
                await prisma.projectUserAssessment.update({
                    where: { id: assessmentId },
                    data: {
                        currentComponentId: nextId,
                        completionPercentage,
                    },
                });
            }

            return NextResponse.json({
                ok: true,
                completionPercentage,
                isLastSection,
                nextComponentId: nextComponent?.id ?? null,
            });
        }

        // 2. B2C: MemberAssessment (Member has email, not userId)
        const member = await prisma.member.findFirst({
            where: { email: (session.user as { email?: string }).email ?? "", type: "INDIVIDUAL" },
            select: { id: true },
        });
        if (member) {
            const memberAssessment = await prisma.memberAssessment.findFirst({
                where: { id: assessmentId, memberId: member.id },
                include: { assessmentModel: { include: { components: { orderBy: { order: "asc" } } } } },
            });
            if (memberAssessment) {
                const uam = await prisma.userAssessmentModel.findFirst({
                    where: { userId: session.user.id!, modelId: memberAssessment.assessmentModelId },
                    orderBy: { createdAt: "desc" },
                });
                if (!uam) return NextResponse.json({ error: "Assessment not started" }, { status: 400 });

                const userComponent = await prisma.userAssessmentComponent.findFirst({
                    where: { userAssessmentModelId: uam.id, componentId },
                    orderBy: { createdAt: "desc" },
                });
                if (!userComponent) {
                    return NextResponse.json({ error: "Component not started" }, { status: 400 });
                }

                const startedAt = userComponent.startedAt ? new Date(userComponent.startedAt).getTime() : Date.now();
                const timeSpent = Math.floor((Date.now() - startedAt) / 1000);

                await prisma.userAssessmentComponent.update({
                    where: { id: userComponent.id },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                        timeSpent,
                        timeLimitUsed: timeSpent,
                    },
                });
                const comp = (memberAssessment.assessmentModel?.components ?? []).find((c: { id: string }) => c.id === componentId) as { componentType?: string } | undefined;
                const isAdaptive = comp?.componentType === "ADAPTIVE_AI";
                if (isAdaptive) {
                    await computeAdaptiveComponentScore(userComponent.id, assessmentId, componentId, userComponent.maxScore).catch(() => {});
                } else {
                    await computeAndSaveComponentScore(userComponent.id).catch(() => {});
                }

                const components = memberAssessment.assessmentModel?.components ?? [];
                const nextIndex = components.findIndex((c: { id: string }) => c.id === componentId) + 1;
                const nextComponent = nextIndex < components.length ? components[nextIndex] : null;
                const allComponents = await prisma.userAssessmentComponent.findMany({
                    where: { userAssessmentModelId: uam.id },
                });
                const completedCount = allComponents.filter((r) => r.status === "COMPLETED").length;
                const totalComponents = components.length;
                const completionPercentage = totalComponents > 0 ? Math.round((completedCount / totalComponents) * 100) : 100;

                const isLastSection = !nextComponent;
                let overallScore: number | null = null;
                let passed: boolean | null = null;
                if (isLastSection) {
                    const completedComponents = await prisma.userAssessmentComponent.findMany({
                        where: { userAssessmentModelId: uam.id, status: "COMPLETED" },
                    });
                    const totalMax = completedComponents.reduce((s, r) => s + r.maxScore, 0);
                    const totalScore = completedComponents.reduce((s, r) => s + (r.score ?? (r.percentage != null ? (r.percentage / 100) * r.maxScore : 0)), 0);
                    overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
                    const model = memberAssessment.assessmentModel as { passingScore?: number } | undefined;
                    passed = model?.passingScore != null ? overallScore >= model.passingScore : null;
                    await prisma.memberAssessment.update({
                        where: { id: assessmentId },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                            submittedAt: new Date(),
                            overallScore: overallScore ?? undefined,
                            passed: passed ?? undefined,
                        },
                    });
                }

                return NextResponse.json({
                    ok: true,
                    completionPercentage,
                    isLastSection,
                    nextComponentId: nextComponent?.id ?? null,
                });
            }
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    } catch (error) {
        console.error("Runner complete component error:", error);
        return NextResponse.json({ error: "Failed to complete component" }, { status: 500 });
    }
}
