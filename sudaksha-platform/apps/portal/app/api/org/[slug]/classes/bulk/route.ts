import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClass } from "@/lib/services/class-service";
import { canManageCourseDepartment } from "@/lib/services/course-service";

const ALLOWED_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN", "DEPARTMENT_HEAD", "DEPT_HEAD"];

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

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 });
    }

    const memberId = (session.user as { id?: string }).id ?? "system";
    const success: unknown[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = r.name ?? r.class_name ?? "";
      const code = r.code ?? r.class_code ?? "";
      const department_code = (r.department_code ?? "").trim();
      const course_code = (r.course_code ?? r.course_slug ?? "").trim();

      if (!name || !code || !department_code) {
        errors.push({ row: i + 2, error: "name, code, department_code required" });
        continue;
      }

      const dept = await prisma.organizationUnit.findFirst({
        where: { tenantId: tenant.id, type: "DEPARTMENT", code: department_code },
      });
      if (!dept) {
        errors.push({ row: i + 2, error: `Department code '${department_code}' not found` });
        continue;
      }

      if (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD") {
        const canManage = await canManageCourseDepartment(tenant.id, dept.id, memberId);
        if (!canManage) {
          errors.push({ row: i + 2, error: "No permission for this department" });
          continue;
        }
      }

      let courseId: string | undefined;
      if (course_code) {
        const course = await prisma.activity.findFirst({
          where: {
            tenantId: tenant.id,
            type: "COURSE",
            deletedAt: null,
            OR: [{ slug: course_code }, { code: course_code }],
          },
        });
        if (course) courseId = course.id;
      }

      try {
        const cls = await createClass(tenant.id, {
          name,
          code,
          departmentId: dept.id,
          courseId,
        });
        success.push(cls);
      } catch (e) {
        errors.push({ row: i + 2, error: e instanceof Error ? e.message : "Create failed" });
      }
    }

    return NextResponse.json({
      success: success.length,
      errors: errors.length,
      created: success.length,
      details: errors.length ? errors : undefined,
    });
  } catch (e) {
    console.error("[org classes bulk]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
