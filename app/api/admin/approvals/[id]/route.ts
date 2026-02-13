import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { ApprovalStatus } from "@prisma/client";
import { notifyApprovalDecision } from "@/lib/notifications/approval-notifications";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }>}
) {
    const session = await getApiSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { decision, reason } = body;

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
        return new NextResponse("Invalid decision", { status: 400 });
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

        // Atomic transaction to update both the request and the entity
        const result = await prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.approvalRequest.update({
                where: { id },
                data: {
                    status: decision as ApprovalStatus,
                    rejectionReason: decision === "REJECTED" ? reason : null,
                    reviewerId: session.user!.id,
                    reviewedAt: new Date(),
                },
            });

            if (decision === "APPROVED") {
                if (request.type === "ROLE") {
                    await tx.role.update({
                        where: { id: request.entityId },
                        data: {
                            ...request.modifiedData as any,
                            status: "APPROVED",
                            approvedBy: session.user!.name,
                            approvedAt: new Date(),
                        },
                    });
                } else if (request.type === "COMPETENCY") {
                    await tx.competency.update({
                        where: { id: request.entityId },
                        data: {
                            ...request.modifiedData as any,
                            status: "APPROVED",
                        },
                    });

                    // If modifiedData contains indicators, they should be updated too
                    // Note: In a real scenario, this would need a more complex diff/sync 
                    // for nested indicators. For now, we assume basic fields or a separate
                    // indicator approval flow if they are complex.
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
