import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { aggregatePanelScoreAndUpdateResponse } from "@/lib/assessment/panel-aggregation";

/**
 * POST /api/assessments/panel-interviews/[id]/evaluate
 * Submit panel evaluation. Body: { scores?, feedback?, recommendation?, panelMemberId? }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: panelInterviewId } = await params;
        const body = await req.json();
        const { scores, feedback, recommendation, panelMemberId } = body;

        const interview = await prisma.panelInterview.findUnique({
            where: { id: panelInterviewId },
            include: { panel: { include: { members: true } } },
        });

        if (!interview) {
            return NextResponse.json({ error: "Panel interview not found" }, { status: 404 });
        }

        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: "User id required" }, { status: 400 });
        }

        const member = panelMemberId
            ? interview.panel.members.find((m) => m.id === panelMemberId)
            : interview.panel.members.find((m) => m.userId === userId);

        const evaluation = await prisma.panelEvaluation.create({
            data: {
                panelInterviewId,
                panelistId: userId,
                panelMemberId: member?.id ?? null,
                scores: scores && typeof scores === "object" ? scores : null,
                feedback: typeof feedback === "string" ? feedback : null,
                recommendation:
                    recommendation && ["STRONG_HIRE", "HIRE", "MAYBE", "NO_HIRE"].includes(recommendation)
                        ? recommendation
                        : null,
                submittedAt: new Date(),
            },
        });

        aggregatePanelScoreAndUpdateResponse(panelInterviewId).catch((err) => {
            console.error("Panel aggregation error:", err);
        });

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error("Panel evaluate error:", error);
        return NextResponse.json({ error: "Failed to submit evaluation" }, { status: 500 });
    }
}
