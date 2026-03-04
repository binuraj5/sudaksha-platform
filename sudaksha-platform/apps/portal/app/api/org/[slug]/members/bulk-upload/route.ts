import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { validateStudentOrgUnit } from "@/lib/services/class-service";
import { canManageCourseDepartment } from "@/lib/services/course-service";

const ALLOWED_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD", "CLASS_TEACHER"];

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
  if (!ALLOWED_ROLES.includes(role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const rows = body.rows ?? body.students ?? body.employees ?? [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    const success: { id: string; email: string; enrollmentNumber?: string }[] = [];
    const errors: { row: number; email?: string; class_code?: string; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firstName = row.firstName ?? row.first_name ?? "";
      const lastName = row.lastName ?? row.last_name ?? "";
      const email = (row.email ?? "").trim().toLowerCase();
      const enrollmentNumber = (row.enrollmentNumber ?? row.enrollment_number ?? "").trim();
      const classCode = (row.class_code ?? row.classCode ?? "").trim();

      if (!email || !firstName) {
        errors.push({ row: i + 1, email: email || undefined, error: "First name and email are required" });
        continue;
      }
      if (!classCode) {
        errors.push({ row: i + 1, email, error: "class_code is required for students" });
        continue;
      }

      const orgUnit = await prisma.organizationUnit.findFirst({
        where: { tenantId: tenant.id, type: "CLASS", code: classCode },
      });
      if (!orgUnit) {
        errors.push({ row: i + 1, email, class_code: classCode, error: `Class with code '${classCode}' not found` });
        continue;
      }

      const validation = await validateStudentOrgUnit(tenant.id, orgUnit.id);
      if (!validation.ok) {
        errors.push({ row: i + 1, email, class_code: classCode, error: validation.error ?? "Class not linked to course" });
        continue;
      }

      if (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD" || role === "CLASS_TEACHER") {
        const memberId = (session.user as { id?: string }).id;
        const canManage = await canManageCourseDepartment(tenant.id, orgUnit.parentId ?? "", memberId ?? "");
        if (!canManage) {
          errors.push({ row: i + 1, email, class_code: classCode, error: "You cannot add students to this class" });
          continue;
        }
      }

      const existingEmail = await prisma.member.findUnique({ where: { email } });
      if (existingEmail) {
        errors.push({ row: i + 1, email, error: "Email already exists" });
        continue;
      }

      const finalEnrollmentNumber = enrollmentNumber || `STU${Date.now().toString(36)}${i}`;
      const dupEnrollment = await prisma.member.findFirst({
        where: { tenantId: tenant.id, enrollmentNumber: finalEnrollmentNumber },
      });
      if (dupEnrollment) {
        errors.push({ row: i + 1, email, error: `Enrollment number ${finalEnrollmentNumber} already exists` });
        continue;
      }

      try {
        const hashedPassword = await hash(Math.random().toString(36).slice(-8), 10);
        const newMember = await prisma.member.create({
          data: {
            tenantId: tenant.id,
            type: "STUDENT",
            role: "ASSESSOR",
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            email,
            enrollmentNumber: finalEnrollmentNumber,
            memberCode: finalEnrollmentNumber,
            password: hashedPassword,
            orgUnitId: orgUnit.id,
            isActive: true,
            status: "PENDING",
          },
        });
        success.push({ id: newMember.id, email, enrollmentNumber: finalEnrollmentNumber });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Create failed";
        errors.push({ row: i + 1, email, error: msg });
      }
    }

    return NextResponse.json({
      success: true,
      count: success.length,
      failed: errors.length,
      errors,
      successList: success,
    });
  } catch (e) {
    console.error("[org members bulk-upload]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
