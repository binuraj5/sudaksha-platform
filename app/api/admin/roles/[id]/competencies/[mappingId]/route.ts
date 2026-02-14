import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/roles/[id]/competencies/[mappingId]
 * Update weight or requiredLevel for a role competency mapping
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; mappingId: string }> }
) {
    try {
        const session = await getApiSession();
        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: roleId, mappingId } = await params;
        const body = await request.json();
        const { weight, requiredLevel } = body;

        const mapping = await prisma.roleCompetency.findFirst({
            where: { id: mappingId, roleId },
        });

        if (!mapping) {
            return NextResponse.json({ error: "Mapping not found" }, { status: 404 });
        }

        const updated = await prisma.roleCompetency.update({
            where: { id: mappingId },
            data: {
                ...(weight != null && { weight }),
                ...(requiredLevel && { requiredLevel }),
            },
            include: { competency: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update role competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/roles/[id]/competencies/[mappingId]
 * Remove a competency from a role
 */
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string; mappingId: string }> }
) {
    try {
        const session = await getApiSession();
        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: roleId, mappingId } = await params;

        const mapping = await prisma.roleCompetency.findFirst({
            where: { id: mappingId, roleId },
        });

        if (!mapping) {
            return NextResponse.json({ error: "Mapping not found" }, { status: 404 });
        }

        await prisma.roleCompetency.delete({
            where: { id: mappingId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete role competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
