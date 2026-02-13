import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(req: Request) {
    const session = await getApiSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { currentRoleId, aspirationalRoleId, competencies } = body;

        // Basic validation in a real app would go here

        const member = await prisma.member.update({
            where: { email: (session.user as { email?: string }).email ?? "" },
            data: {
                currentRoleId,
                aspirationalRoleId,
                selfAssignedCompetencies: competencies, // Array of competency IDs or objects
                updatedAt: new Date()
            }
        });

        // Optional: Generate initial learning path or cache recommendations immediately
        // but recommendation-engine does it on-the-fly.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ONBOARDING_COMPLETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
