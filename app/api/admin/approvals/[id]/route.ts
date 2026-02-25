import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { ApprovalStatus } from "@prisma/client";
import { notifyApprovalDecision } from "@/lib/notifications/approval-notifications";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();

    const u = session?.user as { id?: string; role?: string; userType?: string; tenantId?: string; name?: string } | undefined;
    if (!session?.user || !u?.role) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = normalizeUserRole(u.role);
    const isSuperAdmin = role === "SUPER_ADMIN" || u.userType === "SUPER_ADMIN";

    const isTenantAdmin = ["TENANT_ADMIN", "INSTITUTION_ADMIN", "CLIENT_ADMIN"].includes(role);
    const isDeptHead = ["DEPARTMENT_HEAD", "DEPT_HEAD_INST"].includes(role);
    const isTeamLead = ["TEAM_LEADER", "CLASS_TEACHER"].includes(role);

    if (!isSuperAdmin && !isTenantAdmin && !isDeptHead && !isTeamLead) {
        return new NextResponse("Unauthorized to perform reviews", { status: 403 });
    }

    const body = await req.json();
    const { decision, reason } = body;

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
        return new NextResponse("Invalid decision", { status: 400 });
    }

    if (decision === "REJECTED" && (!reason || reason.trim() === "")) {
        return new NextResponse("Rejection reason is required", { status: 400 });
    }

    const { id } = await params;
    try {
        const request = await prisma.approvalRequest.findUnique({
            where: { id },
            include: { tenant: true },
        });

        if (!request) {
            return new NextResponse("Request not found", { status: 404 });
        }

        if (request.status !== "PENDING") {
            return new NextResponse("Request already processed", { status: 400 });
        }

        if (!isSuperAdmin && request.tenantId !== u.tenantId) {
            return new NextResponse("Unauthorized to review this tenant's request", { status: 403 });
        }

        // Atomic transaction to update both the request and the entity
        const result = await prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.approvalRequest.update({
                where: { id },
                data: {
                    status: decision as ApprovalStatus,
                    rejectionReason: decision === "REJECTED" ? reason : null,
                    reviewerId: u.id,
                    reviewedAt: new Date(),
                },
            });

            if (decision === "APPROVED") {
                if (request.type === "ROLE") {
                    await tx.role.update({
                        where: { id: request.entityId },
                        data: {
                            ...(request.modifiedData ? (request.modifiedData as any) : {}),
                            status: "APPROVED",
                            approvedBy: u.name,
                            approvedAt: new Date(),
                        },
                    });
                } else if (request.type === "COMPETENCY") {
                    await tx.competency.update({
                        where: { id: request.entityId },
                        data: {
                            ...(request.modifiedData ? (request.modifiedData as any) : {}),
                            status: "APPROVED",
                        },
                    });
                }
            } else if (decision === "REJECTED") {
                if (request.type === "ROLE") {
                    await tx.role.update({
                        where: { id: request.entityId },
                        data: {
                            globalSubmissionStatus: "REJECTED",
                            globalRejectionReason: reason,
                        }
                    });
                } else if (request.type === "COMPETENCY") {
                    await tx.competency.update({
                        where: { id: request.entityId },
                        data: {
                            globalSubmissionStatus: "REJECTED",
                            globalRejectionReason: reason,
                        }
                    });
                }
            }

            return updatedRequest;
        });

        // Background notification
        notifyApprovalDecision(id).catch(console.error);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[APPROVALS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
