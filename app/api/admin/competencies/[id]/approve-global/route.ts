import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = normalizeUserRole((session.user as any).role);
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
    }

    const { id: competencyId } = await params;
    const body = await req.json().catch(() => ({}));
    const decision = (body.decision as string) || "REJECT";
    const notes = (body.notes as string) || "";

    const existing = await prisma.competency.findUnique({ where: { id: competencyId } });
    if (!existing) {
      return NextResponse.json({ error: "Competency not found" }, { status: 404 });
    }
    if (existing.globalSubmissionStatus !== "PENDING") {
      return NextResponse.json({ error: "Competency is not pending review" }, { status: 400 });
    }

    const reviewerId = (session.user as any).id;
    const statusValue =
      decision === "APPROVE"
        ? "APPROVED"
        : decision === "REQUEST_CHANGES"
          ? "CHANGES_REQUESTED"
          : "REJECTED";

    await prisma.$transaction([
      prisma.competency.update({
        where: { id: competencyId },
        data:
          decision === "APPROVE"
            ? {
                scope: "GLOBAL",
                tenantId: null,
                departmentId: null,
                teamId: null,
                globalSubmissionStatus: "APPROVED",
                globalApprovedBy: reviewerId,
                globalApprovedAt: new Date(),
                globalRejectionReason: null,
              }
            : {
                globalSubmissionStatus: statusValue,
                globalApprovedBy: reviewerId,
                globalApprovedAt: new Date(),
                globalRejectionReason: notes || null,
              },
      }),
      prisma.globalApprovalRequest.updateMany({
        where: {
          entityType: "COMPETENCY",
          entityId: competencyId,
          status: "PENDING",
        },
        data: {
          status: statusValue,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      }),
    ]);

    return NextResponse.json({
      message: `Competency ${decision === "APPROVE" ? "approved" : decision === "REQUEST_CHANGES" ? "changes requested" : "rejected"}`,
    });
  } catch (error) {
    console.error("Approve competency global error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
