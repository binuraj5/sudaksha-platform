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

    const { id: roleId } = await params;
    const body = await req.json().catch(() => ({}));
    const decision = (body.decision as string) || "REJECT"; // APPROVE | REJECT | REQUEST_CHANGES
    const notes = (body.notes as string) || "";

    const existing = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existing) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    if ((existing as any).globalSubmissionStatus !== "PENDING") {
      return NextResponse.json({ error: "Role is not pending review" }, { status: 400 });
    }

    const reviewerId = (session.user as any).id;
    const statusValue =
      decision === "APPROVE"
        ? "APPROVED"
        : decision === "REQUEST_CHANGES"
          ? "CHANGES_REQUESTED"
          : "REJECTED";

    await prisma.$transaction([
      prisma.role.update({
        where: { id: roleId },
        data:
          decision === "APPROVE"
            ? ({
              scope: "GLOBAL",
              tenantId: null,
              departmentId: null,
              teamId: null,
              globalSubmissionStatus: "APPROVED",
              globalApprovedBy: reviewerId,
              globalApprovedAt: new Date(),
              globalRejectionReason: null,
            } as any)
            : ({
              globalSubmissionStatus: statusValue,
              globalApprovedBy: reviewerId,
              globalApprovedAt: new Date(),
              globalRejectionReason: notes || null,
            } as any),
      }),
      (prisma as any).globalApprovalRequest.updateMany({
        where: {
          entityType: "ROLE",
          entityId: roleId,
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
      message: `Role ${decision === "APPROVE" ? "approved" : decision === "REQUEST_CHANGES" ? "changes requested" : "rejected"}`,
    });
  } catch (error) {
    console.error("Approve role global error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
