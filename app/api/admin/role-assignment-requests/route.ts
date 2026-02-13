import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    const u = session?.user as { role?: string; userType?: string } | undefined;
    const isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";

    if (!session || !isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    try {
        const requests = await prisma.roleAssignmentRequest.findMany({
            where: { status },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        designation: true,
                        type: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("[ROLE_ASSIGNMENT_REQUESTS_GET]", error);
        return NextResponse.json(
            { error: "Failed to load role assignment requests" },
            { status: 500 }
        );
    }
}
