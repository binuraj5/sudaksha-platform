import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const user = session?.user as { id?: string; role?: string; tenantId?: string; clientId?: string } | undefined;

    if (!session?.user || !user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (user.tenantId ?? user.clientId) as string | undefined;
    const { clientId } = await params;
    if (user.role !== "SUPER_ADMIN" && tenantId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const requests = await prisma.approvalRequest.findMany({
            where: {
                tenantId: clientId,
                type: "ROLE",
                requesterId: user.id,
            },
            include: {
                tenant: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const withRoleName = await Promise.all(
            requests.map(async (r) => {
                const role = await prisma.role.findUnique({
                    where: { id: r.entityId },
                    select: { name: true, description: true },
                });
                const original = (r.originalData as { requestedName?: string }) || {};
                return {
                    id: r.id,
                    status: r.status,
                    requestedName: original.requestedName || role?.name,
                    roleName: role?.name,
                    createdAt: r.createdAt,
                    reviewedAt: r.reviewedAt,
                    rejectionReason: r.rejectionReason,
                    tenantName: r.tenant?.name,
                };
            })
        );

        return NextResponse.json({ requests: withRoleName });
    } catch (error) {
        console.error("[ROLES_MY_REQUESTS_GET]", error);
        return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
    }
}
