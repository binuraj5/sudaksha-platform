import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

/**
 * GET /api/career/fit/[memberId]
 * SEPL/INT/2026/IMPL-STEPS-01 Step 19
 *
 * Returns top career role matches for a member, ranked by fit score.
 * Queries the CareerFitScore model.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { memberId } = await params;

    // Security: only the member themselves or an admin may request
    const requestingUser = session.user as any;
    const isSelf = requestingUser.memberId === memberId || requestingUser.id === memberId;
    const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"].includes(requestingUser.role ?? "");
    if (!isSelf && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const scores = await prisma.careerFitScore.findMany({
            where: { memberId },
            include: { role: { select: { name: true } } },
            orderBy: { fitScore: "desc" },
            take: 5
        });

        const matches = scores.map((s: any) => {
            let gapCount = 0;
            if (s.gapAnalysis && typeof s.gapAnalysis === 'object') {
                if (Array.isArray(s.gapAnalysis)) {
                    gapCount = s.gapAnalysis.length;
                } else if ('gaps' in s.gapAnalysis && Array.isArray(s.gapAnalysis.gaps)) {
                    gapCount = s.gapAnalysis.gaps.length;
                } else {
                    gapCount = Object.keys(s.gapAnalysis).length;
                }
            }

            return {
                roleId: s.roleId,
                roleName: s.role?.name ?? "Unknown Role",
                fitScore: s.fitScore,
                gapCount,
            };
        });

        const scipScores = await prisma.sCIPDimensionScore.findMany({
            where: { memberAssessment: { memberId } },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        const riasecScore = scipScores.find(s => s.dimension === 'RIASEC');
        const riasecCluster = riasecScore ? (riasecScore.subScores as any)?.hollandCode : null;

        return NextResponse.json({ matches, riasecCluster });
    } catch (error) {
        console.error("[CAREER_FIT]", error);
        // Always return empty array — never break the dashboard
        return NextResponse.json({ matches: [] });
    }
}
