import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { role?: string; tenantId?: string };
        const tenantId = user.tenantId ?? null;
        const where = tenantId ? { tenantId } : {};

        const panels = await prisma.panel.findMany({
            where,
            include: { members: true, _count: { select: { members: true, interviews: true } } },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(panels);
    } catch (error) {
        console.error("Panels list error:", error);
        return NextResponse.json({ error: "Failed to list panels" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as { role?: string; tenantId?: string };
        const body = await req.json();
        const { name, description, durationMinutes } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json({ error: "name is required" }, { status: 400 });
        }

        const panel = await prisma.panel.create({
            data: {
                name: name.trim(),
                description: description?.trim() ?? null,
                durationMinutes: typeof durationMinutes === "number" ? durationMinutes : 60,
                tenantId: user.tenantId ?? null,
            },
        });

        return NextResponse.json(panel);
    } catch (error) {
        console.error("Panel create error:", error);
        return NextResponse.json({ error: "Failed to create panel" }, { status: 500 });
    }
}
