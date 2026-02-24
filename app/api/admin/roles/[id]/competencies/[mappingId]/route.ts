import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canUserModifyRole, normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

const ALLOWED_ROLES = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"
];

function hasAccess(session: any): boolean {
    const u = session?.user as { role?: string; userType?: string } | undefined;
    if (!u) return false;
    if (u.userType === "SUPER_ADMIN") return true;
    return !!u.role && ALLOWED_ROLES.includes(u.role);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; mappingId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: roleId, mappingId } = await params;

        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        const u = session.user as Record<string, any>;
        const userRole = normalizeUserRole(u.role || "MEMBER");
        const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

        if (!isSuperAdmin) {
            const canModify = canUserModifyRole(
                { id: u.id, role: userRole, tenantId: u.tenantId || "", tenantType: "CORPORATE", departmentId: u.departmentId, teamId: u.teamId, classId: u.classId },
                { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }
            );
            if (!canModify) {
                return NextResponse.json({ error: "You do not have permission to modify this role" }, { status: 403 });
            }
        }

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

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string; mappingId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: roleId, mappingId } = await params;

        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        const u = session.user as Record<string, any>;
        const userRole = normalizeUserRole(u.role || "MEMBER");
        const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

        if (!isSuperAdmin) {
            const canModify = canUserModifyRole(
                { id: u.id, role: userRole, tenantId: u.tenantId || "", tenantType: "CORPORATE", departmentId: u.departmentId, teamId: u.teamId, classId: u.classId },
                { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }
            );
            if (!canModify) {
                return NextResponse.json({ error: "You do not have permission to modify this role" }, { status: 403 });
            }
        }

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
