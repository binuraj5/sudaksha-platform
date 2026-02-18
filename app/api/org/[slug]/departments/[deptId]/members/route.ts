import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
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
    select: { id: true, type: true },
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
  const { session, tenant, role } = result;
  if (!ALLOWED_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dept = await prisma.organizationUnit.findFirst({
    where: { id: deptId, tenantId: tenant.id, type: "DEPARTMENT" },
  });
  if (!dept) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  if (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD" || role === "CLASS_TEACHER") {
    const memberId = (session.user as { id?: string }).id;
    const canManage = await canManageCourseDepartment(tenant.id, deptId, memberId ?? "");
    if (!canManage) {
      return NextResponse.json({ error: "You can only view members in departments you manage" }, { status: 403 });
    }
  }

  const tenantType = (tenant.type as "CORPORATE" | "INSTITUTION") || "CORPORATE";

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role") ?? undefined;
    const classIdFilter = searchParams.get("classId") ?? undefined;
    const courseIdFilter = searchParams.get("courseId") ?? undefined;
    const teamIdFilter = searchParams.get("teamId") ?? undefined;

    if (tenantType === "CORPORATE") {
      // Corporate: department + teams (children of type TEAM)
      const teamIds = await prisma.organizationUnit.findMany({
        where: { tenantId: tenant.id, type: "TEAM", parentId: deptId },
        select: { id: true },
      });
      const teamIdList = teamIds.map((t) => t.id);
      const orgUnitIds = [deptId, ...teamIdList];

      let memberWhere: any = {
        tenantId: tenant.id,
        type: "EMPLOYEE",
        orgUnitId: { in: teamIdFilter ? [teamIdFilter] : orgUnitIds },
      };

      if (roleFilter && roleFilter !== "all") {
        memberWhere.role = roleFilter;
      }

      const members = await prisma.member.findMany({
        where: memberWhere,
        include: {
          orgUnit: {
            select: { id: true, name: true, code: true, type: true },
          },
        },
        orderBy: { name: "asc" },
      }) as any[];

      const list = members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        enrollmentNumber: null,
        memberCode: m.memberCode,
        type: m.type,
        role: m.role,
        orgUnitId: m.orgUnitId,
        orgUnit: m.orgUnit ? { id: m.orgUnit.id, name: m.orgUnit.name, code: m.orgUnit.code, type: m.orgUnit.type } : null,
        course: null,
        createdAt: m.createdAt,
      }));

      return NextResponse.json(list);
    }

    // Institution: department + classes (children of type CLASS)
    const classIds = await prisma.organizationUnit.findMany({
      where: { tenantId: tenant.id, type: "CLASS", parentId: deptId },
      select: { id: true },
    });
    const classIdList = classIds.map((c) => c.id);
    const orgUnitIds = [deptId, ...classIdList];

    let memberWhere: any = {
      tenantId: tenant.id,
      orgUnitId: { in: orgUnitIds },
    };

    if (roleFilter === "STUDENT" || roleFilter === "student") {
      memberWhere.type = "STUDENT";
    } else if (roleFilter === "EMPLOYEE" || roleFilter === "Faculty" || roleFilter === "faculty") {
      memberWhere.type = "EMPLOYEE";
    }

    if (classIdFilter) {
      memberWhere.orgUnitId = { in: [classIdFilter] };
    }

    const members = await prisma.member.findMany({
      where: memberWhere,
      include: {
        orgUnit: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            parentId: true,
            scopedActivities: {
              where: { relationship: "CONTAINS" },
              include: { activity: { select: { id: true, name: true, code: true } } },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }) as any[];

    let list = members.map((m) => {
      const course = m.orgUnit?.type === "CLASS"
        ? m.orgUnit.scopedActivities?.[0]?.activity ?? null
        : null;
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        enrollmentNumber: m.enrollmentNumber ?? null,
        memberCode: m.memberCode,
        type: m.type,
        role: m.role,
        orgUnitId: m.orgUnitId,
        orgUnit: m.orgUnit ? { id: m.orgUnit.id, name: m.orgUnit.name, code: m.orgUnit.code, type: m.orgUnit.type } : null,
        course: course ? { id: course.id, name: course.name, code: course.code } : null,
        createdAt: m.createdAt,
      };
    });

    if (courseIdFilter) {
      list = list.filter((m) => m.course?.id === courseIdFilter);
    }

    return NextResponse.json(list);
  } catch (e) {
    console.error("[org dept members GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
