import { prisma } from '@/lib/prisma';
import { computeCareerFitScores } from './computeCareerFitScores';

/**
 * Computes SCIP dimension scores from component responses
 * SEPL/INT/2026/IMPL-STEPS-01 Step 23
 */
export async function computeSCIPScores(memberAssessmentId: string) {
    const assessment = await prisma.memberAssessment.findUnique({
        where: { id: memberAssessmentId },
        include: {
            member: true,
            assessmentModel: true,
        }
    });

    if (!assessment) throw new Error("MemberAssessment not found");

    // Need to find the UserAssessmentModel to get the responses
    const uam = await prisma.userAssessmentModel.findFirst({
        where: { userId: assessment.member.id, modelId: assessment.assessmentModelId },
        orderBy: { createdAt: "desc" },
        include: {
            componentResults: {
                include: {
                    component: true,
                    questionResponses: true
                }
            }
        }
    });

    if (!uam) throw new Error("UserAssessmentModel not found");

    const scores: Record<string, { totalScore: number; maxScore: number }> = {};
    const subScores: Record<string, Record<string, any>> = {};

    for (const uac of uam.componentResults) {
        const code = (uac.component as any).code || (uac.component as any).libraryComponent?.code || uac.component.id;
        if (!code) continue;

        let totalScore = 0;
        let maxScore = 0;

        for (const resp of uac.questionResponses) {
            totalScore += resp.pointsAwardded ?? 0;
            maxScore += resp.maxPoints ?? 1;
        }

        let dimension = "";
        if (code.includes('SCIP-COG')) dimension = "COG";
        else if (code.includes('SCIP-OCEAN')) dimension = "OCEAN";
        else if (code.includes('SCIP-RIASEC')) dimension = "RIASEC";
        else if (code.includes('SCIP-EI')) dimension = "EI";
        else if (code.includes('SCIP-VALUES')) dimension = "VALUES";

        if (dimension) {
            if (!scores[dimension]) scores[dimension] = { totalScore: 0, maxScore: 0 };
            scores[dimension].totalScore += totalScore;
            scores[dimension].maxScore += maxScore;
            subScores[dimension] = { componentCode: code }; // In real app, calculate actual subscores
        }
    }

    // Upsert SCIPDimensionScore records
    for (const [dimension, data] of Object.entries(scores)) {
        const rawScore = data.maxScore > 0 ? (data.totalScore / data.maxScore) * 100 : 0;
        
        await prisma.sCIPDimensionScore.upsert({
            where: {
                memberAssessmentId_dimension: {
                    memberAssessmentId,
                    dimension
                }
            },
            update: {
                rawScore,
                subScores: subScores[dimension]
            },
            create: {
                memberAssessmentId,
                dimension,
                rawScore,
                subScores: subScores[dimension]
            }
        });
    }

    // After computing SCIP scores, compute Career Fit Scores
    await computeCareerFitScores(assessment.memberId).catch((e: any) => console.error("[SCIPScore] CareerFit computation failed", e));
}
