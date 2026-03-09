import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// JUNIOR=0, MIDDLE=1, SENIOR=2, EXPERT=3 — matches schema ProficiencyLevel enum
const LEVEL_INT: Record<string, number> = {
    JUNIOR: 0,
    MIDDLE: 1,
    SENIOR: 2,
    EXPERT: 3,
};

/** Convert a 0–100 percentage score to a 0–3 proficiency integer */
function percentageToLevelInt(pct: number): number {
    if (pct >= 75) return 3; // EXPERT
    if (pct >= 50) return 2; // SENIOR
    if (pct >= 25) return 1; // MIDDLE
    return 0;                // JUNIOR
}

function levelIntToLabel(n: number): string {
    return ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"][n] ?? "JUNIOR";
}

/** Gap priority per FSD spec */
function gapPriority(gap: number): "HIGH" | "MEDIUM" | "NONE" | "EXCEEDS" {
    if (gap >= 2) return "HIGH";
    if (gap === 1) return "MEDIUM";
    if (gap === 0) return "NONE";
    return "EXCEEDS"; // gap < 0
}

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

        // ── Path 1: ProjectUserAssessment (org-project flow) ─────────────────
        const projectAssessment = await prisma.projectUserAssessment.findUnique({
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
                    include: { component: true }
                }
            }
        });

        if (projectAssessment) {
            const role = projectAssessment.user.assignedRole;
            if (!role) {
                return NextResponse.json({
                    error: "No role assigned to user. Gap analysis requires a target role framework."
                }, { status: 400 });
            }

            const competencyScores = buildCompetencyScores(projectAssessment.componentResults);
            const analysis = buildAnalysis(role.competencies, competencyScores, role.name, projectAssessment.user.name ?? "");

            return NextResponse.json(analysis);
        }

        // ── Path 2: MemberAssessment (B2B org-member flow) ───────────────────
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: {
                id: true,
                name: true,
                currentRole: {
                    include: {
                        competencies: {
                            include: { competency: true }
                        }
                    }
                }
            }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const memberAssessment = await prisma.memberAssessment.findFirst({
            where: { id, memberId: member.id },
            select: { assessmentModelId: true }
        });

        if (!memberAssessment) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: session.user.email ?? "", mode: "insensitive" } },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User record not found" }, { status: 404 });
        }

        const uam = await prisma.userAssessmentModel.findFirst({
            where: { userId: user.id, modelId: memberAssessment.assessmentModelId },
            orderBy: { createdAt: "desc" },
            include: {
                componentResults: {
                    include: { component: true }
                }
            }
        });

        if (!uam) {
            return NextResponse.json({ error: "No assessment session found" }, { status: 404 });
        }

        const role = (member as any).currentRole;
        if (!role) {
            return NextResponse.json({
                error: "No role assigned. Gap analysis requires a current role."
            }, { status: 400 });
        }

        const competencyScores = buildCompetencyScores(uam.componentResults);
        const analysis = buildAnalysis(role.competencies, competencyScores, role.name, member.name ?? "");

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Gap analysis error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function buildCompetencyScores(componentResults: any[]): Record<string, { total: number; count: number }> {
    const scores: Record<string, { total: number; count: number }> = {};
    componentResults.forEach((res) => {
        const compId = (res.component as { competencyId?: string | null }).competencyId;
        if (!compId) return;
        const pct = res.percentage ?? (res.maxScore > 0 ? ((res.score ?? 0) / res.maxScore) * 100 : 0);
        if (!scores[compId]) scores[compId] = { total: 0, count: 0 };
        scores[compId].total += pct;
        scores[compId].count += 1;
    });
    return scores;
}

function buildAnalysis(
    roleCompetencies: any[],
    competencyScores: Record<string, { total: number; count: number }>,
    roleName: string,
    userName: string
) {
    const analysis = roleCompetencies.map(rc => {
        const compId = rc.competencyId;
        const avgPct = competencyScores[compId]
            ? competencyScores[compId].total / competencyScores[compId].count
            : 0;

        const requiredLevelInt = LEVEL_INT[rc.requiredLevel] ?? 0;
        const achievedLevelInt = percentageToLevelInt(avgPct);
        const gap = requiredLevelInt - achievedLevelInt;

        return {
            competencyId: compId,
            name: rc.competency.name,
            category: rc.competency.category,
            // Legacy percentage fields (preserved for existing UI)
            actualScore: Math.round(avgPct),
            requiredScore: requiredLevelInt * 25 + 12, // midpoint of band for display
            // New integer-level fields
            requiredLevel: rc.requiredLevel as string,
            requiredLevelInt,
            achievedLevel: levelIntToLabel(achievedLevelInt),
            achievedLevelInt,
            gap,
            priority: gapPriority(gap),
            isMet: gap <= 0,
        };
    });

    return {
        roleName,
        userName,
        analysis,
        overallFitness: Math.round(
            analysis.filter(a => a.isMet).length / Math.max(analysis.length, 1) * 100
        ),
    };
}
