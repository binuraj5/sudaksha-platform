import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createCourse,
  listCourses,
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
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getTenantAndAccess(slug);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { session, tenant, role } = result;
  if (!ALLOWED_READ_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let departmentId = searchParams.get("departmentId") ?? undefined;
    const managedOrgUnitId = (session.user as { managedOrgUnitId?: string | null }).managedOrgUnitId ?? null;
    const isDeptHead = role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD";
    if (isDeptHead && managedOrgUnitId) {
      departmentId = managedOrgUnitId;
    }
    const courses = await listCourses(tenant.id, departmentId);
    return NextResponse.json(courses);
  } catch (e) {
    console.error("[org courses GET]", e);
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
    const {
      name,
      code,
      slug: bodySlug,
      departmentId,
      yearBegin,
      yearEnd,
      division,
      semesterCount,
      yearCount,
      curriculumNodeIds,
      description,
    } = body;

    if (!name || !code || !departmentId || yearBegin == null || yearEnd == null || !division) {
      return NextResponse.json(
        { error: "name, code, departmentId, yearBegin, yearEnd, division are required" },
        { status: 400 }
      );
    }

    const memberId = (session.user as { id?: string }).id;
    if (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD") {
      const canManage = await canManageCourseDepartment(tenant.id, departmentId, memberId ?? "");
      if (!canManage) {
        return NextResponse.json({ error: "You can only create courses in departments you manage" }, { status: 403 });
      }
    }

    const course = await createCourse(
      tenant.id,
      {
        name,
        code,
        slug: bodySlug,
        departmentId,
        yearBegin: Number(yearBegin),
        yearEnd: Number(yearEnd),
        division,
        semesterCount: semesterCount != null ? Number(semesterCount) : undefined,
        yearCount: yearCount != null ? Number(yearCount) : undefined,
        curriculumNodeIds,
        description,
      },
      memberId ?? "system"
    );
    return NextResponse.json(course);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    if (
      message.includes("End year") ||
      message.includes("Semester count") ||
      message.includes("Year count") ||
      message.includes("already exists")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[org courses POST]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
