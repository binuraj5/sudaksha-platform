import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"];

/**
 * POST /api/assessments/admin/assign-by-email
 * Assign an assessment model to a B2C individual by email.
 * Body: { email, modelId, tenantId? }
 * Finds or does not create Member (INDIVIDUAL); creates MemberAssessment ASSIGNED.
 * If Member does not exist, returns 404 (caller can prompt to invite/register first).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getApiSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role ?? "";
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, modelId, tenantId } = body;

    if (!email || typeof email !== "string" || !modelId) {
      return NextResponse.json(
        { error: "email and modelId are required" },
        { status: 400 }
      );
    }

    const model = await prisma.assessmentModel.findFirst({
      where: { id: modelId, isActive: true },
      select: { id: true },
    });
    if (!model) {
      return NextResponse.json({ error: "Assessment model not found" }, { status: 404 });
    }

    const member = await prisma.member.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        type: "INDIVIDUAL",
        ...(tenantId ? { tenantId } : {}),
      },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "No individual member found with this email. They may need to register first." },
        { status: 404 }
      );
    }

    const existing = await prisma.memberAssessment.findFirst({
      where: {
        memberId: member.id,
        assessmentModelId: modelId,
        status: { in: ["DRAFT", "ACTIVE"] },
      },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        memberAssessmentId: existing.id,
        message: "Assessment already assigned and in progress.",
      });
    }

    const memberAssessment = await prisma.memberAssessment.create({
      data: {
        memberId: member.id,
        assessmentModelId: modelId,
        assignmentType: "ASSIGNED",
        assignedBy: session.user.id,
        status: "DRAFT",
      },
    });

    return NextResponse.json({
      success: true,
      memberAssessmentId: memberAssessment.id,
      message: "Assessment assigned to individual.",
    });
  } catch (error) {
    console.error("Assign by email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
