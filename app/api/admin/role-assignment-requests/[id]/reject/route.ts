import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();
    const u = session?.user as { id?: string; role?: string; userType?: string } | undefined;
    const isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";

    if (!session || !isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json().catch(() => ({}));
        const rejectionReason = body.rejectionReason || body.reason || null;

        const request = await prisma.roleAssignmentRequest.findUnique({
            where: { id },
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.status !== "PENDING") {
            return NextResponse.json(
                { error: "Request has already been processed" },
                { status: 400 }
            );
        }

        await prisma.roleAssignmentRequest.update({
            where: { id },
            data: {
                status: "REJECTED",
                rejectionReason,
                processedBy: u?.id,
                processedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Request rejected",
        });
    } catch (error) {
        console.error("[ROLE_ASSIGNMENT_REJECT]", error);
        return NextResponse.json(
            { error: "Failed to reject request" },
            { status: 500 }
        );
    }
}
