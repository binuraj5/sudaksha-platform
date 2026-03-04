import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canUserModifyRole, normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

const ALLOWED_ROLES = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER"
];

function getUserFromSession(session: any) {
    const u = session?.user as Record<string, unknown> | undefined;
    if (!u) return null;
    const role = normalizeUserRole((u.role as string) || "MEMBER");
    return {
        id: u.id as string,
        role,
        userType: u.userType as string | undefined,
        tenantId: (u.tenantId ?? u.clientId) as string | undefined,
        departmentId: u.departmentId as string | undefined,
        teamId: u.teamId as string | undefined,
        classId: u.classId as string | undefined,
    };
}

function hasAccess(session: any): boolean {
    const u = session?.user as { role?: string; userType?: string } | undefined;
    if (!u) return false;
    if (u.userType === "SUPER_ADMIN") return true;
    return !!u.role && ALLOWED_ROLES.includes(u.role);
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                competencies: {
                    include: { competency: true }
                },
                _count: {
                    select: {
                        competencies: true,
                        assessmentModels: true
                    }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        return NextResponse.json(role);
    } catch (error) {
        console.error("Fetch role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existingRole = await prisma.role.findUnique({ where: { id } });
        if (!existingRole) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        const user = getUserFromSession(session);
        if (user) {
            const canModify = canUserModifyRole(
                { id: user.id, role: user.role, tenantId: user.tenantId || "", tenantType: "CORPORATE", departmentId: user.departmentId, teamId: user.teamId, classId: user.classId },
                { scope: (existingRole as any).scope, tenantId: existingRole.tenantId ?? undefined, departmentId: (existingRole as any).departmentId ?? undefined, teamId: (existingRole as any).teamId ?? undefined, createdByUserId: (existingRole as any).createdByUserId ?? undefined }
            );
            if (!canModify) {
                return NextResponse.json({ error: "You do not have permission to edit this role" }, { status: 403 });
            }
        }

        const body = await request.json();
        const { name, description, department, overallLevel, isActive, keyResponsibilities } = body;

        const role = await prisma.role.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(department !== undefined && { department }),
                ...(overallLevel && { overallLevel }),
                ...(isActive !== undefined && { isActive }),
                ...(keyResponsibilities !== undefined && { keyResponsibilities })
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error("Update role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        competencies: true,
                        assessmentModels: true,
                        users: true
                    }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        const user = getUserFromSession(session);
        if (user) {
            const canModify = canUserModifyRole(
                { id: user.id, role: user.role, tenantId: user.tenantId || "", tenantType: "CORPORATE", departmentId: user.departmentId, teamId: user.teamId, classId: user.classId },
                { scope: (role as any).scope, tenantId: role.tenantId ?? undefined, departmentId: (role as any).departmentId ?? undefined, teamId: (role as any).teamId ?? undefined, createdByUserId: (role as any).createdByUserId ?? undefined }
            );
            if (!canModify) {
                return NextResponse.json({ error: "You do not have permission to delete this role" }, { status: 403 });
            }
        }

        if (role._count.users > 0) {
            return NextResponse.json(
                { error: `Cannot delete role. ${role._count.users} user(s) are assigned to this role.` },
                { status: 400 }
            );
        }

        if (role._count.assessmentModels > 0) {
            return NextResponse.json(
                { error: `Cannot delete role. ${role._count.assessmentModels} assessment model(s) are linked to this role.` },
                { status: 400 }
            );
        }

        await prisma.roleCompetency.deleteMany({
            where: { roleId: id }
        });

        await prisma.role.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
        console.error("Delete role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
