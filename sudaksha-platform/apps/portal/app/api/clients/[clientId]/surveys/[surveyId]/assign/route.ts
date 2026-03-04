import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ clientId: string, surveyId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, surveyId } = await params;

        const user = session?.user as any;
        if (!session || !user || (user.role !== "SUPER_ADMIN" && user.clientId !== clientId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { targetType, targetId, dueDate, reminderSettings } = body;

        const assignment = await prisma.surveyAssignment.create({
            data: {
                surveyId,
                targetType,
                targetId,
                dueDate: dueDate ? new Date(dueDate) : null,
                reminderSettings
            }
        });

        // In a real scenario, this might trigger notifications/emails

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Assign survey error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
