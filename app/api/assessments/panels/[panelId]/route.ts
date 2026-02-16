import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/panels/[panelId]
 * Get panel with members.
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
        const panel = await prisma.panel.findUnique({
            where: { id: panelId },
            include: { members: true },
        });

        if (!panel) {
            return NextResponse.json({ error: "Panel not found" }, { status: 404 });
        }

        return NextResponse.json(panel);
    } catch (error) {
        console.error("Panel get error:", error);
        return NextResponse.json({ error: "Failed to get panel" }, { status: 500 });
    }
}

/**
 * PATCH /api/assessments/panels/[panelId]
 * Update panel. Body: { name?, description?, durationMinutes? }
 */
export async function PATCH(
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
        const { name, description, durationMinutes } = body;

        const data: { name?: string; description?: string; durationMinutes?: number } = {};
        if (typeof name === "string" && name.trim()) data.name = name.trim();
        if (description !== undefined) data.description = description?.trim() ?? null;
        if (typeof durationMinutes === "number") data.durationMinutes = durationMinutes;

        const panel = await prisma.panel.update({
            where: { id: panelId },
            data,
        });

        return NextResponse.json(panel);
    } catch (error) {
        console.error("Panel update error:", error);
        return NextResponse.json({ error: "Failed to update panel" }, { status: 500 });
    }
}
