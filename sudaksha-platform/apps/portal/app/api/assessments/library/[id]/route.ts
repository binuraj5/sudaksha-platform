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
        const user = session?.user as { id?: string; role?: string; userType?: string; tenantId?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";

        const whereClause = isSuperAdmin
            ? { id }
            : {
                  id,
                  OR: [
                      { visibility: "GLOBAL" as const, publishedToGlobal: true },
                      ...(user?.tenantId ? [{ visibility: "ORGANIZATION" as const, tenantId: user.tenantId }] : []),
                      { visibility: "PRIVATE" as const, createdBy: user?.id }
                  ]
              };

        const component = await prisma.componentLibrary.findFirst({
            where: whereClause,
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
        const user = session?.user as { id?: string; role?: string; userType?: string; tenantId?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";

        const whereClause = isSuperAdmin
            ? { id }
            : {
                  id,
                  OR: [
                      { visibility: "GLOBAL" as const, publishedToGlobal: true },
                      ...(user?.tenantId ? [{ visibility: "ORGANIZATION" as const, tenantId: user.tenantId }] : []),
                      { visibility: "PRIVATE" as const, createdBy: user?.id }
                  ]
              };

        const existing = await prisma.componentLibrary.findFirst({
            where: whereClause
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
