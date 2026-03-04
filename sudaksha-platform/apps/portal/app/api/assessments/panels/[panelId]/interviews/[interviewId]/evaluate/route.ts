import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/assessments/panels/[panelId]/interviews/[interviewId]/evaluate
 * Submit an evaluation for a panel interview.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ panelId: string; interviewId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { id?: string, email?: string };
        const { interviewId } = await params;
        const body = await req.json();
        const { score, feedback, recommendation } = body;

        if (score === undefined || typeof score !== "number") {
            return NextResponse.json({ error: "Numeric score is required" }, { status: 400 });
        }

        // 1. Get member ID for the evaluator
        const evaluatorMember = await prisma.member.findFirst({
            where: { email: user.email ?? "" },
            select: { id: true }
        });

        // 2. See if panel member exists, if not, we can just save it with panelistId
        const panelistId = evaluatorMember?.id ?? user.id ?? "unknown";

        // Create PanelEvaluation
        const evaluation = await prisma.panelEvaluation.create({
            data: {
                panelInterviewId: interviewId,
                panelistId: panelistId,
                scores: { overall: score },
                feedback,
                recommendation,
                submittedAt: new Date()
            }
        });

        // Update Interview status
        await prisma.panelInterview.update({
            where: { id: interviewId },
            data: {
                status: "COMPLETED",
                completedAt: new Date()
            }
        });

        // Optional: If this completes the component, we could update UserAssessmentComponent here

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error("Error evaluating panel interview:", error);
        return NextResponse.json({ error: "Failed to submit evaluation" }, { status: 500 });
    }
}
