import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ clientId: string; roleId: string }> };

// Helper: check if the requester can modify this role
async function checkAccess(session: any, clientId: string, roleId: string) {
    const role = (session?.user as any)?.role as string | undefined;
    const userTenantId = (session?.user as any)?.tenantId as string | undefined;

    const isSuperAdmin = role === "SUPER_ADMIN" || role === "TENANT_ADMIN";
    const isClientAdminOwner = role === "CLIENT_ADMIN" && userTenantId === clientId;

    if (!session || (!isSuperAdmin && !isClientAdminOwner)) return null;

    const dbRole = await prisma.role.findFirst({
        where: {
            id: roleId,
            // Allow SUPER/TENANT_ADMIN to manage any role; CLIENT_ADMIN restricted to own tenant
            ...(isSuperAdmin ? {} : { tenantId: clientId }),
        },
    });
    return dbRole;
}

export async function GET(
    req: NextRequest,
    { params }: Params
) {
    const session = await getApiSession();
    const { clientId, roleId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const role = await prisma.role.findFirst({
            where: {
                id: roleId,
                OR: [{ tenantId: clientId }, { visibility: "UNIVERSAL" }],
            },
            include: {
                competencies: {
                    include: { competency: true },
                    orderBy: { competency: { name: "asc" } },
                },
                tenant: { select: { id: true, name: true } },
                _count: { select: { competencies: true, assessmentModels: true } },
            },
        });

        if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });
        return NextResponse.json(role);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: Params
) {
    const session = await getApiSession();
    const { clientId, roleId } = await params;

    const dbRole = await checkAccess(session, clientId, roleId);
    if (!dbRole) return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 });

    try {
        const body = await req.json();
        const { name, description, overallLevel } = body;

        const updated = await prisma.role.update({
            where: { id: roleId },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(overallLevel && { overallLevel }),
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: Params
) {
    const session = await getApiSession();
    const { clientId, roleId } = await params;

    const dbRole = await checkAccess(session, clientId, roleId);
    if (!dbRole) return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 });

    try {
        // Soft delete
        await prisma.role.update({
            where: { id: roleId },
            data: { isActive: false },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
