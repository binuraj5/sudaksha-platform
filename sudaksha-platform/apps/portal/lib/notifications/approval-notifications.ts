import { prisma } from "@/lib/prisma";

export async function notifyApprovalDecision(requestId: string) {
    try {
        const request = await prisma.approvalRequest.findUnique({
            where: { id: requestId },
            include: {
                tenant: {
                    include: {
                        members: {
                            where: { role: "TENANT_ADMIN" },
                            select: { id: true, email: true }
                        }
                    }
                }
            }
        });

        if (!request) return;

        const admins = request.tenant.members;
        const status = request.status;
        const type = request.type;

        // In a real application, we would send emails here
        console.log(`[NOTIFICATION] Sending ${status} notification to ${admins.length} admins of ${request.tenant.name}`);

        for (const admin of admins) {
            // Mocking in-app notification creation
            // await prisma.notification.create({ ... })

            if (status === "APPROVED") {
                console.log(`Email to ${admin.email}: Your ${type} request has been approved!`);
            } else if (status === "REJECTED") {
                console.log(`Email to ${admin.email}: Your ${type} request was rejected. Reason: ${request.rejectionReason}`);
            }
        }
    } catch (error) {
        console.error("[NOTIFY_APPROVAL_ERROR]", error);
    }
}
