import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  canManageCourseDepartment,
} from "@/lib/services/course-service";

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
const ALLOWED_WRITE_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD"];

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
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  const { slug, courseId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { tenant, role } = result;
  if (!ALLOWED_READ_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const course = await getCourseById(tenant.id, courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (e) {
    console.error("[org course GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  const { slug, courseId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!ALLOWED_WRITE_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await prisma.activity.findFirst({
    where: { id: courseId, tenantId: tenant.id, type: "COURSE", deletedAt: null },
    include: {
      orgUnits: {
        where: { relationship: "SCOPED_TO" },
        select: { orgUnitId: true },
      },
    },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const departmentId = course.orgUnits[0]?.orgUnitId;
  if (departmentId && (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD")) {
    const memberId = (session.user as { id?: string }).id;
    const canManage = await canManageCourseDepartment(tenant.id, departmentId, memberId ?? "");
    if (!canManage) {
      return NextResponse.json({ error: "You can only edit courses in departments you manage" }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    const updated = await updateCourse(tenant.id, courseId, {
      name: body.name,
      description: body.description,
      yearEnd: body.yearEnd != null ? Number(body.yearEnd) : undefined,
      slug: body.slug,
      curriculumNodeIds: Array.isArray(body.curriculumNodeIds) ? body.curriculumNodeIds : undefined,
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    if (message.includes("already exists")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[org course PATCH]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  const { slug, courseId } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!ALLOWED_WRITE_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await prisma.activity.findFirst({
    where: { id: courseId, tenantId: tenant.id, type: "COURSE" },
    include: {
      orgUnits: {
        where: { relationship: "SCOPED_TO" },
        select: { orgUnitId: true },
      },
    },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const departmentId = course.orgUnits[0]?.orgUnitId;
  if (departmentId && (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD")) {
    const memberId = (session.user as { id?: string }).id;
    const canManage = await canManageCourseDepartment(tenant.id, departmentId, memberId ?? "");
    if (!canManage) {
      return NextResponse.json({ error: "You can only delete courses in departments you manage" }, { status: 403 });
    }
  }

  try {
    const outcome = await deleteCourse(tenant.id, courseId, (session.user as { id?: string }).id ?? "system");
    if (!outcome.success) {
      return NextResponse.json({ error: outcome.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (e) {
    console.error("[org course DELETE]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
