import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEVEL_MAP: Record<string, number> = {
    'BEGINNER': 25,
    'INTERMEDIATE': 50,
    'ADVANCED': 75,
    'EXPERT': 100
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch User's Assessment and their assigned role's requirements
        const assessment = await prisma.projectUserAssessment.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        assignedRole: {
                            include: {
                                competencies: {
                                    include: { competency: true }
                                }
                            }
                        }
                    }
                },
                componentResults: {
                    include: {
                        component: true
                    }
                }
            }
        });

        if (!assessment) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        const role = assessment.user.assignedRole;
        if (!role) {
            return NextResponse.json({
                error: "No role assigned to user. Gap analysis requires a target role framework."
            }, { status: 400 });
        }

        // Calculate actual scores per competency (AssessmentModelComponent uses competencyId)
        const competencyScores: Record<string, { total: number; count: number }> = {};

        assessment.componentResults.forEach((res) => {
            const compId = (res.component as { competencyId?: string | null }).competencyId;
            if (!compId) return;
            const scorePct = res.percentage ?? (res.maxScore > 0 ? ((res.score ?? 0) / res.maxScore) * 100 : 0);
            if (!competencyScores[compId]) {
                competencyScores[compId] = { total: 0, count: 0 };
            }
            competencyScores[compId].total += scorePct;
            competencyScores[compId].count += 1;
        });

        // Compare Actual vs Required
        const analysis = role.competencies.map(rc => {
            const compId = rc.competencyId;
            const actualScore = competencyScores[compId]
                ? (competencyScores[compId].total / competencyScores[compId].count)
                : 0;

            const requiredLevelScore = LEVEL_MAP[rc.requiredLevel] || 50;
            const gap = actualScore - requiredLevelScore;

            return {
                competencyId: compId,
                name: rc.competency.name,
                category: rc.competency.category,
                actualScore: Math.round(actualScore),
                requiredScore: requiredLevelScore,
                requiredLevel: rc.requiredLevel,
                gap: Math.round(gap),
                isMet: gap >= 0
            };
        });

        return NextResponse.json({
            roleName: role.name,
            userName: assessment.user.name,
            analysis,
            overallFitness: Math.round(
                analysis.reduce((acc, curr) => acc + (curr.isMet ? 1 : 0), 0) / analysis.length * 100
            ) || 0
        });

    } catch (error) {
        console.error("Gap analysis error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
