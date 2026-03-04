/**
 * Class service for institution hierarchy (OrganizationUnit type CLASS).
 * Handles CRUD, optional course linking via ActivityOrgUnit CONTAINS,
 * and validation for student assignment (class must be linked to course).
 */
import { prisma } from "@/lib/prisma";

/** List all classes for tenant, optionally filtered by department and/or course */
export async function listAllClasses(
  tenantId: string,
  departmentId?: string,
  courseId?: string
) {
  const where: { tenantId: string; type: "CLASS"; parentId?: string } = {
    tenantId,
    type: "CLASS",
  };
  if (departmentId) where.parentId = departmentId;

  const classes = await prisma.organizationUnit.findMany({
    where,
    include: {
      parent: { select: { id: true, name: true, code: true } },
      manager: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true } },
      scopedActivities: {
        where: { relationship: "CONTAINS" },
        include: { activity: { select: { id: true, name: true, code: true, slug: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  let list = classes;
  if (courseId) {
    list = classes.filter((c) =>
      c.scopedActivities.some((a) => a.relationship === "CONTAINS" && a.activityId === courseId)
    );
  }

  return list.map((c) => {
    const courseLink = c.scopedActivities.find((a) => a.relationship === "CONTAINS");
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      managerId: c.managerId,
      classTeacher: c.manager,
      studentCount: c._count.members,
      course: courseLink ? courseLink.activity : null,
      courseId: courseLink?.activityId ?? null,
      department: c.parent,
    };
  });
}

export async function listClassesByDepartment(
  tenantId: string,
  departmentId: string,
  courseId?: string
) {
  return listAllClasses(tenantId, departmentId, courseId);
}

export interface CreateClassInput {
  name: string;
  code: string;
  departmentId: string;
  courseId?: string;
  managerId?: string;
  description?: string;
}

export async function createClass(tenantId: string, input: CreateClassInput) {
  const { departmentId, courseId, managerId, ...rest } = input;

  const dept = await prisma.organizationUnit.findFirst({
    where: { id: departmentId, tenantId, type: "DEPARTMENT" },
  });
  if (!dept) throw new Error("Department not found");

  if (courseId) {
    const courseDept = await prisma.activityOrgUnit.findFirst({
      where: { activityId: courseId, relationship: "SCOPED_TO", orgUnitId: departmentId },
    });
    if (!courseDept) {
      throw new Error("Course must belong to the same department");
    }
  }

  const cls = await prisma.organizationUnit.create({
    data: {
      tenantId,
      type: "CLASS",
      parentId: departmentId,
      managerId: managerId ?? null,
      name: rest.name,
      code: rest.code,
      description: rest.description ?? null,
    },
  });

  if (courseId) {
    await prisma.activityOrgUnit.create({
      data: {
        activityId: courseId,
        orgUnitId: cls.id,
        relationship: "CONTAINS",
      },
    });
  }

  return cls;
}

export async function getClassById(tenantId: string, classId: string) {
  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, tenantId, type: "CLASS" },
    include: {
      parent: { select: { id: true, name: true, code: true } },
      manager: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true } },
      scopedActivities: {
        where: { relationship: "CONTAINS" },
        include: { activity: { select: { id: true, name: true, code: true, slug: true } } },
      },
    },
  });
  if (!cls) return null;

  const courseLink = cls.scopedActivities.find((a) => a.relationship === "CONTAINS");
  return {
    ...cls,
    description: cls.description ?? undefined,
    department: cls.parent,
    course: courseLink ? courseLink.activity : null,
    courseId: courseLink?.activityId ?? null,
    studentCount: cls._count.members,
    classTeacher: cls.manager,
  };
}

export interface UpdateClassInput {
  name?: string;
  description?: string;
  courseId?: string | null;
  managerId?: string | null;
}

export async function updateClass(tenantId: string, classId: string, input: UpdateClassInput) {
  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, tenantId, type: "CLASS" },
  });
  if (!cls) return null;

  if (input.courseId !== undefined) {
    const existing = await prisma.activityOrgUnit.findMany({
      where: { orgUnitId: classId, relationship: "CONTAINS" },
    });
    await prisma.activityOrgUnit.deleteMany({
      where: { orgUnitId: classId, relationship: "CONTAINS" },
    });
    if (input.courseId) {
      const course = await prisma.activity.findFirst({
        where: { id: input.courseId, tenantId, type: "COURSE", deletedAt: null },
      });
      if (!course) throw new Error("Course not found");
      if (cls.parentId) {
        const courseInDept = await prisma.activityOrgUnit.findFirst({
          where: {
            activityId: input.courseId,
            relationship: "SCOPED_TO",
            orgUnitId: cls.parentId,
          },
        });
        if (!courseInDept) throw new Error("Course must belong to the same department as the class");
      }
      await prisma.activityOrgUnit.create({
        data: {
          activityId: input.courseId,
          orgUnitId: classId,
          relationship: "CONTAINS",
        },
      });
    }
  }

  const data: Record<string, unknown> = {};
  if (input.name != null) data.name = input.name;
  if (input.description != null) data.description = input.description;
  if (input.managerId !== undefined) data.managerId = input.managerId;

  return prisma.organizationUnit.update({
    where: { id: classId },
    data,
  });
}

export async function deleteClass(tenantId: string, classId: string) {
  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, tenantId, type: "CLASS" },
    include: { _count: { select: { members: true } } },
  });
  if (!cls) return { success: false, error: "Class not found" };
  if ((cls._count?.members ?? 0) > 0) {
    return { success: false, error: "Cannot delete class with members. Move or remove members first." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityOrgUnit.deleteMany({
      where: { orgUnitId: classId },
    });
    await tx.organizationUnit.delete({
      where: { id: classId },
    });
  });
  return { success: true };
}

/**
 * Validates that a class is linked to a course before allowing student assignment.
 */
export async function validateClassForStudentAssignment(classId: string): Promise<{ ok: boolean; error?: string }> {
  const cls = await prisma.organizationUnit.findFirst({
    where: { id: classId, type: "CLASS" },
    include: {
      scopedActivities: {
        where: { relationship: "CONTAINS" },
      },
    },
  });
  if (!cls) return { ok: false, error: "Class not found" };
  if (cls.scopedActivities.length === 0) {
    return {
      ok: false,
      error:
        "This class must be linked to a course before assigning students. Please link the class to a course first.",
    };
  }
  return { ok: true };
}

/**
 * For institution students: orgUnitId must be a CLASS and class must be linked to a course.
 */
export async function validateStudentOrgUnit(tenantId: string, orgUnitId: string | null): Promise<{ ok: boolean; error?: string }> {
  if (!orgUnitId) return { ok: false, error: "orgUnitId (class) is required for students" };
  const orgUnit = await prisma.organizationUnit.findFirst({
    where: { id: orgUnitId, tenantId, type: "CLASS" },
  });
  if (!orgUnit) return { ok: false, error: "orgUnitId must be a CLASS for students" };
  return validateClassForStudentAssignment(orgUnitId);
}
