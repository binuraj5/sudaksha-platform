import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/assessments/panels/schedule
 * Create a panel interview. Body: { panelId, memberAssessmentId, componentId, scheduledTime, durationMinutes?, meetingLink? }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { panelId, memberAssessmentId, componentId, scheduledTime, durationMinutes, meetingLink } = body;

        if (!panelId || !memberAssessmentId || !componentId || !scheduledTime) {
            return NextResponse.json(
                { error: "panelId, memberAssessmentId, componentId, and scheduledTime are required" },
                { status: 400 }
            );
        }

        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "", type: "INDIVIDUAL" },
            select: { id: true },
        });
        const candidateId = member?.id ?? (session.user as { id?: string }).id ?? null;

        const panel = await prisma.panel.findUnique({ where: { id: panelId } });
        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 });
        }

        const interview = await prisma.panelInterview.create({
            data: {
                panelId,
                memberAssessmentId,
                componentId,
                candidateId,
                scheduledTime: new Date(scheduledTime),
                durationMinutes: typeof durationMinutes === "number" ? durationMinutes : panel.durationMinutes,
                meetingLink: meetingLink?.trim() ?? null,
                status: "SCHEDULED",
            },
        });

        return NextResponse.json(interview);
    } catch (error) {
        console.error("Panel schedule error:", error);
        return NextResponse.json({ error: "Failed to schedule panel interview" }, { status: 500 });
    }
}
