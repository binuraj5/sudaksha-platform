import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClass, listAllClasses } from "@/lib/services/class-service";
import { canManageCourseDepartment } from "@/lib/services/course-service";

const ALLOWED_WRITE_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "CLASS_TEACHER"];

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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  const { searchParams } = new URL(req.url);
  let departmentId = searchParams.get("departmentId") ?? undefined;
  const managedOrgUnitId = (session.user as { managedOrgUnitId?: string | null }).managedOrgUnitId ?? null;
  const isDeptHead = role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD";
  if (isDeptHead && managedOrgUnitId) {
    departmentId = managedOrgUnitId;
  }
  const courseId = searchParams.get("courseId") ?? undefined;
  try {
    const list = await listAllClasses(tenant.id, departmentId, courseId);
    return NextResponse.json(list);
  } catch (e) {
    console.error("[org classes GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!ALLOWED_WRITE_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, code, departmentId, courseId, managerId, description } = body;

    if (!name || !code || !departmentId) {
      return NextResponse.json(
        { error: "name, code, departmentId are required" },
        { status: 400 }
      );
    }

    if (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD" || role === "CLASS_TEACHER") {
      const memberId = (session.user as { id?: string }).id;
      const canManage = await canManageCourseDepartment(tenant.id, departmentId, memberId ?? "");
      if (!canManage) {
        return NextResponse.json(
          { error: "You can only create classes in departments you manage" },
          { status: 403 }
        );
      }
    }

    const cls = await createClass(tenant.id, {
      name,
      code,
      departmentId,
      courseId: courseId ?? undefined,
      managerId: managerId ?? undefined,
      description,
    });
    return NextResponse.json(cls);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    if (message.includes("not found") || message.includes("same department")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[org classes POST]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
