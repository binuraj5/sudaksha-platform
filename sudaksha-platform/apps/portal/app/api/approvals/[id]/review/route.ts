import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

/**
 * POST /api/approvals/[id]/review
 * Body: { decision: "APPROVED" | "REJECTED", notes?: string }
 *
 * Approves or rejects a pending ApprovalRequest and updates the linked Role/Competency status.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const role = normalizeUserRole(user.role);

        const allowedRoles = ["SUPER_ADMIN", "ADMIN", "ORG_ADMIN", "CLIENT_ADMIN", "DEPT_HEAD", "TEAM_LEAD"];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const decision = (body.decision as string) || "REJECTED"; // "APPROVED" | "REJECTED"
        const notes = (body.notes as string) || "";

        const approvalRequest = await prisma.approvalRequest.findUnique({
            where: { id },
        });

        if (!approvalRequest) {
            return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
        }

        if (approvalRequest.status !== "PENDING") {
            return NextResponse.json({ error: "This request has already been reviewed" }, { status: 400 });
        }

        // Ensure reviewer has authority (same tenant for non-super-admin)
        if (role !== "SUPER_ADMIN" && approvalRequest.tenantId !== user.tenantId) {
            return NextResponse.json({ error: "Forbidden - not in your scope" }, { status: 403 });
        }

        const newStatus = decision === "APPROVED" ? "APPROVED" : "REJECTED";

        await prisma.$transaction(async (tx) => {
            // Update the ApprovalRequest record
            await tx.approvalRequest.update({
                where: { id },
                data: {
                    status: newStatus as any,
                    reviewerId: user.id,
                    reviewedAt: new Date(),
                    comments: notes || null,
                    rejectionReason: decision === "REJECTED" ? (notes || "Rejected by reviewer") : null,
                },
            });

            // Record in approval history
            await tx.approvalHistory.create({
                data: {
                    entityType: approvalRequest.type,
                    entityId: approvalRequest.entityId,
                    approverRole: role,
                    approverUserId: user.id,
                    action: decision,
                    comments: notes || null,
                },
            });

            // Cascade decision to the linked entity
            if (approvalRequest.type === "ROLE") {
                await tx.role.update({
                    where: { id: approvalRequest.entityId },
                    data: {
                        status: newStatus as any,
                        ...(decision === "APPROVED" && {
                            isActive: true,
                            approvedAt: new Date(),
                            approvedBy: user.id,
                            rejectionReason: null,
                        }),
                        ...(decision === "REJECTED" && {
                            isActive: false,
                            rejectionReason: notes || "Rejected by reviewer",
                        }),
                    },
                });
            } else if (approvalRequest.type === "COMPETENCY") {
                await tx.competency.update({
                    where: { id: approvalRequest.entityId },
                    data: {
                        status: newStatus as any,
                    },
                });
            }
        });

        return NextResponse.json({
            message: `Request ${decision === "APPROVED" ? "approved" : "rejected"} successfully`,
            decision,
        });
    } catch (error) {
        console.error("Review approval error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
