import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    const user = session?.user as { id?: string; role?: string; tenantId?: string; clientId?: string } | undefined;

    if (!session?.user || !user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_USER"];
    if (!allowedRoles.includes(user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const tenantId = (user.tenantId ?? user.clientId) as string | undefined;
        let whereClause: any = { status };

        if (user.role !== "SUPER_ADMIN" && tenantId) {
            whereClause.tenantId = tenantId;
        }

        const requests = await prisma.competencyDevelopmentRequest.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, email: true } },
                tenant: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("[COMPETENCY_REQUEST_ADMIN_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
