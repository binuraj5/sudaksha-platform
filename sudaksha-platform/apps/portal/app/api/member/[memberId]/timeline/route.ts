import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

/**
 * GET /api/member/[memberId]/timeline
 * SEPL/INT/2026/IMPL-STEPS-01 Step 20
 *
 * Returns chronological career progress timeline:
 * - All COMPLETED MemberAssessment records
 * - Associated AssessmentDelta records
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { memberId } = await params;

    const requestingUser = session.user as any;
    const isSelf = requestingUser.memberId === memberId || requestingUser.id === memberId;
    const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"].includes(requestingUser.role ?? "");
    if (!isSelf && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Fetch completed assessments ordered by completedAt ascending
        const assessments = await prisma.memberAssessment.findMany({
            where: { memberId, status: "COMPLETED" },
            select: {
                id: true,
                overallScore: true,
                completedAt: true,
                assessmentModel: { select: { name: true, sourceType: true } },
            },
            orderBy: { completedAt: "asc" },
        });

        if (assessments.length === 0) {
            return NextResponse.json({ timeline: [] });
        }

        // Fetch deltas where these assessments are either baseline or followup
        const assessmentIds = assessments.map(a => a.id);
        const deltas = await prisma.assessmentDelta.findMany({
            where: {
                OR: [
                    { baselineAssessmentId: { in: assessmentIds } },
                    { followupAssessmentId: { in: assessmentIds } }
                ]
            },
            select: {
                id: true,
                baselineAssessmentId: true,
                followupAssessmentId: true,
                overallDelta: true,
            }
        });

        // Assemble the timeline events
        const timeline = assessments.map((a: any) => {
            // Check if this assessment acts as a baseline for any future assessment
            const isBaseline = deltas.some(d => d.baselineAssessmentId === a.id);
            
            // Check if this assessment has a delta recorded against a previous baseline
            const linkedDelta = deltas.find(d => d.followupAssessmentId === a.id);

            return {
                id: a.id,
                date: a.completedAt?.toISOString(),
                name: a.assessmentModel?.name ?? "Assessment",
                type: a.assessmentModel?.sourceType ?? "GENERAL",
                score: a.overallScore,
                isBaseline,
                deltaScore: linkedDelta?.overallDelta ?? null,
            };
        });

        return NextResponse.json({ timeline });
    } catch (error) {
        console.error("[TIMELINE_API]", error);
        return NextResponse.json({ timeline: [] });
    }
}
