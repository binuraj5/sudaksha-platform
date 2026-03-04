import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/assessments/panels/[panelId]/interviews/[interviewId]
 * Update a panel interview (like meeting link).
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ panelId: string; interviewId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { interviewId } = await params;
        const body = await req.json();

        // Admin/evaluator permission check should go here in a real app
        // For now, assuming any authorized user who reaches here can update link.

        const updated = await prisma.panelInterview.update({
            where: { id: interviewId },
            data: {
                meetingLink: body.meetingLink !== undefined ? body.meetingLink : undefined,
                status: body.status !== undefined ? body.status : undefined,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating panel interview:", error);
        return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
    }
}
