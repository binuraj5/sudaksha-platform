import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCourse } from "@/lib/services/course-service";
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
      const name = r.name ?? r.course_name ?? "";
      const code = r.code ?? r.course_code ?? "";
      const department_code = (r.department_code ?? "").trim();
      const year_begin = parseInt(r.year_begin ?? "0", 10);
      const year_end = parseInt(r.year_end ?? "0", 10);
      const division = (r.division ?? "BOTH").toUpperCase();
      const semester_count = r.semester_count ? parseInt(r.semester_count, 10) : undefined;
      const year_count = r.year_count ? parseInt(r.year_count, 10) : undefined;
      const description = r.description ?? "";

      if (!name || !code || !department_code || !year_begin || !year_end) {
        errors.push({ row: i + 2, error: "name, code, department_code, year_begin, year_end required" });
        continue;
      }
      if (!["SEMESTER", "YEAR", "BOTH"].includes(division)) {
        errors.push({ row: i + 2, error: "division must be SEMESTER, YEAR, or BOTH" });
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

      try {
        const course = await createCourse(
          tenant.id,
          {
            name,
            code,
            departmentId: dept.id,
            yearBegin: year_begin,
            yearEnd: year_end,
            division: division as "SEMESTER" | "YEAR" | "BOTH",
            semesterCount: semester_count,
            yearCount: year_count,
            description: description || undefined,
          },
          memberId
        );
        success.push(course);
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
    console.error("[org courses bulk]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
