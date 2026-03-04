import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { saveCheckpoint, saveProjectCheckpoint } from "@/lib/assessment/session-checkpoint";

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
    if (responseData && typeof responseData === "object" && (responseData as { type?: string }).type === "ADAPTIVE_INTERVIEW") {
        const data = responseData as { finalScore?: number };
        const score = typeof data?.finalScore === "number" ? data.finalScore : 0;
        const pointsAwarded = Math.round((score / 100) * points);
        return { isCorrect: pointsAwarded > 0, pointsAwarded };
    }
    if (responseData && typeof responseData === "object" && (responseData as { type?: string }).type === "PANEL_INTERVIEW") {
        const data = responseData as { finalScore?: number };
        const score = typeof data?.finalScore === "number" ? data.finalScore : 0;
        const pointsAwarded = Math.round((score / 100) * points);
        return { isCorrect: pointsAwarded > 0, pointsAwarded };
    }
    return { isCorrect: false, pointsAwarded: 0 };
}

/** Compute component score from question responses and update UserAssessmentComponent + ComponentQuestionResponse. */
async function computeAndSaveComponentScore(userComponentId: string) {
    const responses = await prisma.componentQuestionResponse.findMany({
        where: { userComponentId },
        include: { question: true },
    });

    const userComponent = await prisma.userAssessmentComponent.findUnique({
        where: { id: userComponentId },
        include: { component: true }
    });

    if (!userComponent) return;

    const componentType = (userComponent.component as any)?.componentType;
    const isAIComponent = ["VOICE", "VIDEO", "ADAPTIVE_AI", "ADAPTIVE_QUESTIONNAIRE", "PANEL"].includes(componentType || "");

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const res of responses) {
        const q = res.question;
        // For AI Components, the single response represents the entire component score (100)
        let maxP = res.maxPoints ?? q?.points ?? 1;
        if (isAIComponent) {
            maxP = userComponent.maxScore > 0 ? userComponent.maxScore : 100;
        }

        totalPoints += maxP;

        const { isCorrect, pointsAwarded } = scoreResponse(res.responseData, {
            questionType: q?.questionType || "",
            correctAnswer: q?.correctAnswer,
            options: q?.options,
            points: maxP,
        });

        earnedPoints += pointsAwarded;
        await prisma.componentQuestionResponse.update({
            where: { id: res.id },
            data: { isCorrect, pointsAwardded: pointsAwarded, maxPoints: maxP },
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
            let sessionTimeMs = Date.now() - startedAt;
            if (sessionTimeMs < 0) sessionTimeMs = 0;
            // Cap at 4 hours (14400000 ms) to prevent astronomical times if user left tab open/paused for days
            if (sessionTimeMs > 14400000) sessionTimeMs = 14400000;

            const newTimeSpent = Math.floor(sessionTimeMs / 1000);
            const timeSpent = (userComponent.timeSpent || 0) + newTimeSpent;

            await prisma.userAssessmentComponent.update({
                where: { id: userComponent.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    timeSpent,
                    timeLimitUsed: timeSpent,
                },
            });
            await computeAndSaveComponentScore(userComponent.id).catch(() => { });

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
                    include: {
                        component: {
                            include: { competency: { select: { id: true, name: true } } },
                        },
                    },
                });
                const totalMax = allResults.reduce((s, r) => s + r.maxScore, 0);
                const totalScore = allResults.reduce((s, r) => s + (r.score ?? (r.percentage != null ? (r.percentage / 100) * r.maxScore : 0)), 0);
                overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
                const model = projectAssessment.projectAssignment?.model as { passingScore?: number } | undefined;
                passed = model?.passingScore != null ? overallScore >= model.passingScore : null;
                const passingScore = (model as any)?.passingScore ?? 50;
                const totalTimeSpent = allResults.reduce((s, r) => s + (r.timeSpent ?? 0), 0);

                // ── Per-competency breakdown ───────────────────────────────────
                const componentScores = allResults.map((r) => {
                    const compMax = r.maxScore;
                    const compEarned = r.score ?? (r.percentage != null ? (r.percentage / 100) * compMax : 0);
                    const compPct = compMax > 0 ? Math.round((compEarned / compMax) * 100) : 0;
                    return {
                        competencyId: (r.component as any)?.competency?.id ?? r.componentId,
                        competencyName: (r.component as any)?.competency?.name ?? "Unknown",
                        score: compPct,
                        passed: compPct >= passingScore,
                    };
                });

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
                        metadata: { componentScores } as any,
                    },
                });

                // ── Auto-flag training needs in member.careerFormData ──────────
                const failedComponents = componentScores.filter((c) => !c.passed);
                if (failedComponents.length > 0) {
                    try {
                        const sessionUser = session.user as { id: string; email?: string };
                        const memberRecord = await prisma.member.findFirst({
                            where: { email: sessionUser.email ?? "" },
                            select: { id: true, careerFormData: true },
                        });
                        if (memberRecord) {
                            const cfd = (memberRecord.careerFormData as any) ?? {};
                            const existingNeeds: any[] = Array.isArray(cfd.trainingNeeds) ? cfd.trainingNeeds : [];
                            const needsMap = new Map(existingNeeds.map((n: any) => [n.competencyId, n]));
                            for (const fc of failedComponents) {
                                needsMap.set(fc.competencyId, {
                                    competencyId: fc.competencyId,
                                    competencyName: fc.competencyName,
                                    score: fc.score,
                                    assessmentDate: new Date().toISOString(),
                                });
                            }
                            await prisma.member.update({
                                where: { id: memberRecord.id },
                                data: { careerFormData: { ...cfd, trainingNeeds: Array.from(needsMap.values()) } },
                            });
                        }
                    } catch (_e) {
                        // Non-critical — don't fail the assessment submission
                    }
                }
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
            where: { email: (session.user as { email?: string }).email ?? "" },
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
                let sessionTimeMs = Date.now() - startedAt;
                if (sessionTimeMs < 0) sessionTimeMs = 0;
                // Cap at 4 hours (14400000 ms) to prevent astronomical times if user left tab open/paused for days
                if (sessionTimeMs > 14400000) sessionTimeMs = 14400000;

                const newTimeSpent = Math.floor(sessionTimeMs / 1000);
                const timeSpent = (userComponent.timeSpent || 0) + newTimeSpent;

                await prisma.userAssessmentComponent.update({
                    where: { id: userComponent.id },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                        timeSpent,
                        timeLimitUsed: timeSpent,
                    },
                });
                await computeAndSaveComponentScore(userComponent.id).catch(() => { });

                // ── Persist session checkpoint ─────────────────────────────
                await saveCheckpoint(uam.id).catch(() => { });

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
