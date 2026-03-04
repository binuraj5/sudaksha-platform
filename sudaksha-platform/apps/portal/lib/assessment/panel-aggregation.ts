import { prisma } from "@/lib/prisma";

/**
 * Compute aggregate score (0-100) from panel evaluations.
 * Each evaluation can have scores: { [key: string]: number }.
 * We average all numeric values per evaluation, then average across evaluations.
 */
function aggregateEvaluationScores(
    evaluations: { scores: unknown }[]
): number {
    if (evaluations.length === 0) return 0;
    const perEval: number[] = [];
    for (const ev of evaluations) {
        const s = ev.scores;
        if (s && typeof s === "object" && !Array.isArray(s)) {
            const vals = Object.values(s).filter(
                (v): v is number => typeof v === "number" && !Number.isNaN(v)
            );
            if (vals.length > 0) {
                perEval.push(vals.reduce((a, b) => a + b, 0) / vals.length);
            }
        }
    }
    if (perEval.length === 0) return 0;
    const sum = perEval.reduce((a, b) => a + b, 0);
    return Math.round((sum / perEval.length) * 100) / 100;
}

/**
 * After panel evaluations are submitted, update the stored ComponentQuestionResponse
 * with aggregated finalScore and recalc the component score.
 * Only supports B2C (MemberAssessment) path; memberAssessmentId and componentId must be set.
 */
export async function aggregatePanelScoreAndUpdateResponse(
    panelInterviewId: string
): Promise<{ updated: boolean; finalScore?: number }> {
    const interview = await prisma.panelInterview.findUnique({
        where: { id: panelInterviewId },
        include: {
            evaluations: true,
            memberAssessment: { include: { member: true } },
        },
    });

    if (!interview?.memberAssessmentId || !interview?.componentId || !interview.memberAssessment) {
        return { updated: false };
    }

    const finalScore = aggregateEvaluationScores(interview.evaluations);
    const member = interview.memberAssessment.member;
    if (!member?.email) return { updated: false };

    const user = await prisma.user.findFirst({
        where: { email: member.email },
        select: { id: true },
    });
    if (!user) return { updated: false };

    const uam = await prisma.userAssessmentModel.findFirst({
        where: {
            userId: user.id,
            modelId: interview.memberAssessment.assessmentModelId,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
    });
    if (!uam) return { updated: false };

    const userComponent = await prisma.userAssessmentComponent.findFirst({
        where: {
            userAssessmentModelId: uam.id,
            componentId: interview.componentId,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
    });
    if (!userComponent) return { updated: false };

    const responses = await prisma.componentQuestionResponse.findMany({
        where: { userComponentId: userComponent.id },
        select: { id: true, responseData: true, maxPoints: true },
    });

    const panelResponse = responses.find(
        (r) =>
            r.responseData &&
            typeof r.responseData === "object" &&
            (r.responseData as { type?: string }).type === "PANEL_INTERVIEW"
    );
    if (!panelResponse) return { updated: false };

    const existing = (panelResponse.responseData as Record<string, unknown>) ?? {};
    const newResponseData = { ...existing, finalScore };

    const maxPoints = Number(panelResponse.maxPoints) || 100;
    const pointsAwarded = Math.round((finalScore / 100) * maxPoints);

    await prisma.componentQuestionResponse.update({
        where: { id: panelResponse.id },
        data: {
            responseData: newResponseData,
            isCorrect: finalScore > 0,
            pointsAwardded: pointsAwarded,
            updatedAt: new Date(),
        },
    });

    const totalPoints = responses.reduce((s, r) => s + (Number(r.maxPoints) || 100), 0);
    const earnedPoints =
        responses.length === 1
            ? pointsAwarded
            : responses.reduce((s, r) => {
                  if (r.id === panelResponse.id) return s + pointsAwarded;
                  const data = r.responseData as { type?: string; finalScore?: number } | null;
                  if (data?.type === "PANEL_INTERVIEW" && typeof data.finalScore === "number") {
                      return s + Math.round((data.finalScore / 100) * (Number(r.maxPoints) || 100));
                  }
                  return s;
              }, 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    await prisma.userAssessmentComponent.update({
        where: { id: userComponent.id },
        data: { score: earnedPoints, percentage, updatedAt: new Date() },
    });

    return { updated: true, finalScore };
}
