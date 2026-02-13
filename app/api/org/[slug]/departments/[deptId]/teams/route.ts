import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "CLIENT_ADMIN",
  "DEPARTMENT_HEAD",
  "DEPT_HEAD",
  "TEAM_LEAD",
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
  _req: Request,
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
    const teams = await prisma.organizationUnit.findMany({
      where: { tenantId: tenant.id, type: "TEAM", parentId: deptId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    });

    const list = teams.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code ?? "",
      memberCount: t._count.members,
    }));

    return NextResponse.json(list);
  } catch (e) {
    console.error("[org dept teams GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
