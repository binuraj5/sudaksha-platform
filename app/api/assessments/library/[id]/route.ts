import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/library/[id]
 * Fetch a single library component
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const component = await prisma.componentLibrary.findFirst({
            where: {
                id,
                OR: [
                    { visibility: "GLOBAL", publishedToGlobal: true },
                    ...(session.user.tenantId ? [{ visibility: "ORGANIZATION", tenantId: session.user.tenantId }] : []),
                    { visibility: "PRIVATE", createdBy: session.user.id }
                ]
            },
            include: {
                competency: true,
                creator: { select: { id: true, name: true, email: true } }
            }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        return NextResponse.json(component);
    } catch (error) {
        console.error("Library fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch component" }, { status: 500 });
    }
}

/**
 * PATCH /api/assessments/library/[id]
 * Update a library component
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const existing = await prisma.componentLibrary.findFirst({
            where: {
                id,
                OR: [
                    { visibility: "GLOBAL", publishedToGlobal: true },
                    ...(session.user.tenantId ? [{ visibility: "ORGANIZATION", tenantId: session.user.tenantId }] : []),
                    { visibility: "PRIVATE", createdBy: session.user.id }
                ]
            }
        });

        if (!existing) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        const { name, description, componentType, competencyId, targetLevel, visibility, questions } = body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (componentType !== undefined) updateData.componentType = componentType;
        if (competencyId !== undefined) updateData.competencyId = competencyId;
        if (targetLevel !== undefined) updateData.targetLevel = targetLevel;
        if (visibility !== undefined) updateData.visibility = visibility;
        if (questions !== undefined) updateData.questions = Array.isArray(questions) ? questions : existing.questions;

        const component = await prisma.componentLibrary.update({
            where: { id },
            data: updateData,
            include: {
                competency: true,
                creator: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json(component);
    } catch (error) {
        console.error("Library update error:", error);
        return NextResponse.json({ error: "Failed to update component" }, { status: 500 });
    }
}
