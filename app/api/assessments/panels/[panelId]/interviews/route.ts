import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/panels/[panelId]/interviews
 * List all scheduled interviews for a specific panel.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ panelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { panelId } = await params;

        const interviews = await prisma.panelInterview.findMany({
            where: { panelId },
            include: {
                memberAssessment: {
                    include: {
                        member: { select: { id: true, name: true, email: true } }
                    }
                }
            },
            orderBy: { scheduledTime: "asc" }
        });

        // Map to flat structure expected by frontend
        const result = interviews.map(inv => ({
            id: inv.id,
            candidateId: inv.memberAssessment?.member?.id ?? inv.candidateId ?? "unknown",
            candidateName: inv.memberAssessment?.member?.name ?? "Unknown Candidate",
            memberAssessmentId: inv.memberAssessmentId,
            scheduledTime: inv.scheduledTime,
            durationMinutes: inv.durationMinutes,
            status: inv.status,
            meetingLink: inv.meetingLink
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching panel interviews:", error);
        return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
    }
}
