import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClassById, updateClass, deleteClass } from "@/lib/services/class-service";
import { canManageCourseDepartment } from "@/lib/services/course-service";

const ALLOWED_READ_ROLES = [
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
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  const { slug, classId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { tenant, role } = result;
  if (!ALLOWED_READ_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const cls = await getClassById(tenant.id, classId);
    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    return NextResponse.json(cls);
  } catch (e) {
    console.error("[org class GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  const { slug, classId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!ALLOWED_WRITE_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, tenantId: tenant.id, type: "CLASS" },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (cls.parentId && (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD" || role === "CLASS_TEACHER")) {
    const memberId = (session.user as { id?: string }).id;
    const canManage = await canManageCourseDepartment(tenant.id, cls.parentId, memberId ?? "");
    if (!canManage) {
      return NextResponse.json(
        { error: "You can only edit classes in departments you manage" },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();
    const updated = await updateClass(tenant.id, classId, {
      name: body.name,
      description: body.description,
      courseId: body.courseId,
      managerId: body.managerId,
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    if (message.includes("not found") || message.includes("same department")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[org class PATCH]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  const { slug, classId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD"].includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, tenantId: tenant.id, type: "CLASS" },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  if (cls.parentId && (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD")) {
    const memberId = (session.user as { id?: string }).id;
    const canManage = await canManageCourseDepartment(tenant.id, cls.parentId, memberId ?? "");
    if (!canManage) {
      return NextResponse.json(
        { error: "You can only delete classes in departments you manage" },
        { status: 403 }
      );
    }
  }

  try {
    const outcome = await deleteClass(tenant.id, classId);
    if (!outcome.success) {
      return NextResponse.json({ error: outcome.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[org class DELETE]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
