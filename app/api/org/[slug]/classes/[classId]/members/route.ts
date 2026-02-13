import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canManageCourseDepartment } from "@/lib/services/course-service";

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "CLIENT_ADMIN",
  "DEPARTMENT_HEAD",
  "DEPT_HEAD",
  "TEAM_LEAD",
  "CLASS_TEACHER",
];

async function getTenantAndAccess(slug: string) {
  const session = await getApiSession();
  if (!session) return { error: "Unauthorized", status: 401 as const };
  const userSlug = (session.user as { tenantSlug?: string }).tenantSlug;
  const role = (session.user as { role?: string }).role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  if (!isSuperAdmin && userSlug !== slug) {
    return { error: "Forbidden", status: 403 as const };
  }
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tenant) return { error: "Tenant not found", status: 404 as const };
  return { session, tenant, role };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  const { slug, classId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!ALLOWED_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, tenantId: tenant.id, type: "CLASS" },
    select: { id: true, parentId: true },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (cls.parentId && (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD" || role === "CLASS_TEACHER")) {
    const memberId = (session.user as { id?: string }).id;
    const canManage = await canManageCourseDepartment(tenant.id, cls.parentId, memberId ?? "");
    if (!canManage) {
      return NextResponse.json({ error: "You cannot view members of this class" }, { status: 403 });
    }
  }

  const members = await prisma.member.findMany({
    where: { tenantId: tenant.id, orgUnitId: classId, type: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      enrollmentNumber: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(members);
}
