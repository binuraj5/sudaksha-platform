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

        const competencies = await prisma.roleCompetency.findMany({
            where: { roleId: id },
            include: { competency: true },
            orderBy: { competency: { name: 'asc' } }
        });

        return NextResponse.json(competencies);
    } catch (error) {
        console.error("Fetch role competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const role = await prisma.role.findUnique({ where: { id } });
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        const u = session.user as Record<string, any>;
        const userRole = normalizeUserRole(u.role || "MEMBER");
        const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

        if (!isSuperAdmin) {
            const canModify = canUserModifyRole(
                { id: u.id, role: userRole, tenantId: u.tenantId || "", tenantType: "CORPORATE", departmentId: u.departmentId, teamId: u.teamId, classId: u.classId },
                { scope: role.scope as any, tenantId: role.tenantId ?? undefined, departmentId: role.departmentId ?? undefined, teamId: role.teamId ?? undefined, createdByUserId: role.createdByUserId ?? undefined }
            );
            if (!canModify) {
                return NextResponse.json({ error: "You do not have permission to modify this role" }, { status: 403 });
            }
        }

        const body = await request.json();
        const { competencyId, requiredLevel, weight } = body;

        if (!competencyId) {
            return NextResponse.json({ error: "Competency is required" }, { status: 400 });
        }

        const mapping = await prisma.roleCompetency.create({
            data: {
                roleId: id,
                competencyId,
                requiredLevel: (requiredLevel as any) || 'MIDDLE',
                weight: weight || 1.0
            },
            include: { competency: true }
        });

        return NextResponse.json(mapping);
    } catch (error) {
        console.error("Link competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
