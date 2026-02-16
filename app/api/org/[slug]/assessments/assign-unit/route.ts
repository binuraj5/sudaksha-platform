import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignToOrgUnit } from "@/lib/assessment-engine";

const ALLOWED_ASSIGN_ROLES = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "CLIENT_ADMIN",
  "DEPARTMENT_HEAD",
  "DEPT_HEAD",
  "CLASS_TEACHER",
];

/**
 * POST /api/org/[slug]/assessments/assign-unit
 * Assign an assessment model to an org unit (class, department, etc.).
 * Body: { orgUnitId, modelId }
 * Creates MemberAssessment (ASSIGNED) for each member in the unit (and children).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role ?? "";
    if (!ALLOWED_ASSIGN_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const userSlug = (session.user as { tenantSlug?: string }).tenantSlug;
    if (role !== "SUPER_ADMIN" && userSlug !== slug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { orgUnitId, modelId } = body;

    if (!orgUnitId || !modelId) {
      return NextResponse.json(
        { error: "orgUnitId and modelId are required" },
        { status: 400 }
      );
    }

    const unit = await prisma.organizationUnit.findFirst({
      where: { id: orgUnitId, tenantId: tenant.id },
      select: { id: true },
    });
    if (!unit) {
      return NextResponse.json({ error: "Org unit not found" }, { status: 404 });
    }

    const model = await prisma.assessmentModel.findFirst({
      where: { id: modelId, isActive: true },
      select: { id: true },
    });
    if (!model) {
      return NextResponse.json({ error: "Assessment model not found" }, { status: 404 });
    }

    const { assignments, skippedStudentCount } = await assignToOrgUnit(
      orgUnitId,
      modelId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      assignedCount: assignments.length,
      skippedStudentCount,
      message: `Assessment assigned to ${assignments.length} member(s)${skippedStudentCount > 0 ? `; ${skippedStudentCount} student(s) skipped (model level)` : ""}.`,
    });
  } catch (error) {
    console.error("Assign to org unit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
