import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/assessments/panels/[panelId]/members
 * Add a panel member. Body: { userId, role? }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ panelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { panelId } = await params;
        const body = await req.json();
        const { userId, role } = body;

        if (!userId || typeof userId !== "string") {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        const panel = await prisma.panel.findUnique({ where: { id: panelId } });
        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 });
        }

        const member = await prisma.panelMember.create({
            data: {
                panelId,
                userId,
                role: role?.trim() ?? null,
            },
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error("Panel member add error:", error);
        return NextResponse.json({ error: "Failed to add panel member" }, { status: 500 });
    }
}
