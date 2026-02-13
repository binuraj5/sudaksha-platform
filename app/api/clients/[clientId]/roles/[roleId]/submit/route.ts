import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; roleId: string }> }
) {
    const session = await getApiSession();
    const { clientId, roleId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const role = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!role || role.tenantId !== clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (role.status === 'APPROVED' || role.status === 'PENDING') {
            return NextResponse.json({ error: "Already submitted or approved" }, { status: 400 });
        }

        // Update to Pending
        await prisma.$transaction(async (tx) => {
            await tx.role.update({
                where: { id: roleId },
                data: { status: 'PENDING' } // Using 'PENDING' from ApprovalStatus
            });

            await tx.approvalRequest.create({
                data: {
                    tenantId: clientId,
                    type: 'ROLE',
                    entityId: roleId,
                    status: 'PENDING',
                    comments: "Resubmission or Late Submission",
                    originalData: role as any
                }
            });
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
