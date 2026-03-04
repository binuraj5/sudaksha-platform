import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listClassesByDepartment } from "@/lib/services/class-service";

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "CLIENT_ADMIN",
  "DEPARTMENT_HEAD",
  "DEPT_HEAD",
  "TEAM_LEAD",
  "CLASS_TEACHER",
  "MANAGER",
  "ASSESSOR",
  "EMPLOYEE",
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
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; deptId: string }> }
) {
  const { slug, deptId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { tenant, role } = result;
  if (!ALLOWED_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dept = await prisma.organizationUnit.findFirst({
    where: { id: deptId, tenantId: tenant.id, type: "DEPARTMENT" },
  });
  if (!dept) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") ?? undefined;
    const classes = await listClassesByDepartment(tenant.id, deptId, courseId);
    return NextResponse.json(classes);
  } catch (e) {
    console.error("[org dept classes GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
