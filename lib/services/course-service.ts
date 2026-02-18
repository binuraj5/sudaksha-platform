/**
 * Course service for institution hierarchy (Activity type COURSE).
 * Handles CRUD, slug generation, soft-delete, and ActivityOrgUnit relationships.
 */
import { prisma } from "@/lib/prisma";
import type { CourseDivision } from "@prisma/client";

export function generateCourseSlug(code: string, yearBegin: number): string {
  return `${code.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${yearBegin}`;
}

export interface CreateCourseInput {
  name: string;
  code: string;
  slug?: string;
  departmentId: string;
  yearBegin: number;
  yearEnd: number;
  division: "SEMESTER" | "YEAR" | "BOTH";
  semesterCount?: number;
  yearCount?: number;
  curriculumNodeIds?: string[];
  description?: string;
}

export async function createCourse(tenantId: string, input: CreateCourseInput, createdBy: string) {
  const { departmentId, division, semesterCount, yearCount, curriculumNodeIds, ...rest } = input;

  if (input.yearEnd < input.yearBegin) {
    throw new Error("End year must be after start year");
  }
  if (division === "SEMESTER" || division === "BOTH") {
    if (semesterCount == null) throw new Error("Semester count is required for semester-based courses");
  }
  if (division === "YEAR" || division === "BOTH") {
    if (yearCount == null) throw new Error("Year count is required for year-based courses");
  }

  const slug = input.slug ?? generateCourseSlug(input.code, input.yearBegin);
  const existing = await prisma.activity.findFirst({
    where: { tenantId, slug },
  });
  if (existing) throw new Error(`Course code '${input.code}' with this start year already exists`);

  const startDate = new Date(input.yearBegin, 0, 1);
  const endDate = new Date(input.yearEnd, 11, 31);

  const course = await prisma.activity.create({
    data: {
      tenantId,
      type: "COURSE",
      name: input.name,
      slug,
      code: input.code,
      description: input.description ?? null,
      status: "ACTIVE",
      startDate,
      endDate,
      createdBy,
      yearBegin: input.yearBegin,
      yearEnd: input.yearEnd,
      division: division as CourseDivision,
      semesterCount: semesterCount ?? null,
      yearCount: yearCount ?? null,
    },
  });

  await prisma.activityOrgUnit.create({
    data: {
      activityId: course.id,
      orgUnitId: departmentId,
      relationship: "SCOPED_TO",
    },
  });

  if (curriculumNodeIds?.length) {
    await prisma.activityCurriculum.createMany({
      data: curriculumNodeIds.map((curriculumNodeId) => ({
        activityId: course.id,
        curriculumNodeId,
      })),
    });
  }

  return course;
}

export async function listCourses(tenantId: string, departmentId?: string) {
  const where: { tenantId: string; type: "COURSE"; deletedAt: null } = {
    tenantId,
    type: "COURSE",
    deletedAt: null,
  };

  const activities = await prisma.activity.findMany({
    where,
    include: {
      orgUnits: {
        where: { relationship: "SCOPED_TO" },
        include: { orgUnit: { select: { id: true, name: true, code: true } } },
      },
      _count: {
        select: {
          orgUnits: true,
        },
      },
    },
    orderBy: { yearBegin: "desc" },
  });

  // Filter by department if requested (course must be SCOPED_TO this department)
  let list = activities as any[];
  if (departmentId) {
    list = activities.filter((a: any) =>
      a.orgUnits.some((ou: any) => ou.relationship === "SCOPED_TO" && ou.orgUnitId === departmentId)
    );
  }

  const courseIds = list.map((c: any) => c.id);
  const containsLinks = await prisma.activityOrgUnit.findMany({
    where: {
      activityId: { in: courseIds },
      relationship: "CONTAINS",
    },
    include: { orgUnit: { select: { id: true, _count: { select: { members: true } } } } } as any,
  }) as any[];

  const classCountByCourse = new Map<string, number>();
  const studentCountByCourse = new Map<string, number>();
  for (const link of containsLinks) {
    classCountByCourse.set(link.activityId, (classCountByCourse.get(link.activityId) ?? 0) + 1);
    const members = link.orgUnit._count?.members ?? 0;
    studentCountByCourse.set(
      link.activityId,
      (studentCountByCourse.get(link.activityId) ?? 0) + members
    );
  }

  return list.map((c: any) => {
    const deptLink = c.orgUnits.find((ou: any) => ou.relationship === "SCOPED_TO");
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      slug: c.slug,
      yearBegin: c.yearBegin,
      yearEnd: c.yearEnd,
      division: c.division,
      semesterCount: c.semesterCount,
      yearCount: c.yearCount,
      description: c.description,
      department: deptLink ? deptLink.orgUnit : null,
      classCount: classCountByCourse.get(c.id) ?? 0,
      studentCount: studentCountByCourse.get(c.id) ?? 0,
    };
  });
}

export async function getCourseById(tenantId: string, courseId: string) {
  const course = await prisma.activity.findFirst({
    where: { id: courseId, tenantId, type: "COURSE", deletedAt: null },
    include: {
      orgUnits: {
        include: {
          orgUnit: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              _count: { select: { members: true } },
              manager: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      curriculumNodes: {
        include: { curriculumNode: { select: { id: true, name: true, code: true, type: true } } },
      },
    },
  }) as any;
  if (!course) return null;

  const deptLink = course.orgUnits.find((ou: any) => ou.relationship === "SCOPED_TO");
  const classLinks = course.orgUnits.filter((ou: any) => ou.relationship === "CONTAINS");

  return {
    ...course,
    department: deptLink ? deptLink.orgUnit : null,
    classes: classLinks.map((l: any) => ({
      ...l.orgUnit,
      studentCount: l.orgUnit._count?.members ?? 0,
      classTeacher: l.orgUnit.manager,
    })),
    curriculum: course.curriculumNodes.map((cn: any) => cn.curriculumNode),
  };
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
  yearEnd?: number;
  slug?: string;
  curriculumNodeIds?: string[];
}

export async function updateCourse(tenantId: string, courseId: string, input: UpdateCourseInput) {
  const existing = await prisma.activity.findFirst({
    where: { id: courseId, tenantId, type: "COURSE", deletedAt: null },
  });
  if (!existing) return null;

  if (input.slug) {
    const conflict = await prisma.activity.findFirst({
      where: { tenantId, slug: input.slug, id: { not: courseId } },
    });
    if (conflict) throw new Error(`Slug '${input.slug}' already exists`);
  }

  const data: Record<string, unknown> = {};
  if (input.name != null) data.name = input.name;
  if (input.description != null) data.description = input.description;
  if (input.yearEnd != null) data.yearEnd = input.yearEnd;
  if (input.slug != null) data.slug = input.slug;
  if (input.yearEnd != null) data.endDate = new Date(input.yearEnd, 11, 31);

  if (input.curriculumNodeIds !== undefined) {
    await prisma.activityCurriculum.deleteMany({ where: { activityId: courseId } });
    if (input.curriculumNodeIds.length > 0) {
      await prisma.activityCurriculum.createMany({
        data: input.curriculumNodeIds.map((curriculumNodeId) => ({
          activityId: courseId,
          curriculumNodeId,
        })),
      });
    }
  }

  return prisma.activity.update({
    where: { id: courseId },
    data,
  });
}

export async function deleteCourse(tenantId: string, courseId: string, userId: string) {
  const course = await prisma.activity.findFirst({
    where: { id: courseId, tenantId, type: "COURSE" },
  });
  if (!course) return { success: false, error: "Course not found" };

  const linkedClasses = await prisma.activityOrgUnit.findMany({
    where: { activityId: courseId, relationship: "CONTAINS" },
    include: {
      orgUnit: {
        include: { _count: { select: { members: true } } },
      },
    },
  });

  const hasStudents = linkedClasses.some((l: any) => (l.orgUnit._count?.members ?? 0) > 0);
  if (hasStudents) {
    return {
      success: false,
      error:
        "Cannot delete course with enrolled students. Please move students to other classes first or archive the course.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityOrgUnit.deleteMany({
      where: { activityId: courseId, relationship: "CONTAINS" },
    });
    await tx.activity.update({
      where: { id: courseId },
      data: { deletedAt: new Date(), deletedBy: userId },
    });
  });

  return { success: true };
}

export async function canManageCourseDepartment(
  tenantId: string,
  departmentId: string,
  memberId: string
): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: { id: memberId, tenantId },
    include: { managedUnits: { where: { isActive: true }, select: { id: true } } },
  }) as any;
  if (!member) return false;
  if (member.role === "SUPER_ADMIN" || member.role === "TENANT_ADMIN") return true;
  return member.managedUnits.some((u: any) => u.id === departmentId);
}
