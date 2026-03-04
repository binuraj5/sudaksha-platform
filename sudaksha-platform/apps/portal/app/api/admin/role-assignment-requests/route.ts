import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    const u = session?.user as { role?: string; userType?: string; accountType?: string; tenantId?: string } | undefined;
    const isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN" || u?.accountType === "SYSTEM_ADMIN";
    const isOrgAdmin = u?.accountType === "CLIENT_USER" || u?.role === "TENANT_ADMIN";

    if (!session || (!isSuperAdmin && !isOrgAdmin)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const tenantId = searchParams.get("tenantId") || undefined;

    try {
        const whereClause: any = { status };

        // SuperAdmin can filter by tenantId, OrgAdmin is forced to their own tenantId
        if (!isSuperAdmin && u?.tenantId) {
            whereClause.tenantId = u.tenantId;
        } else if (isSuperAdmin && tenantId) {
            whereClause.tenantId = tenantId;
        }

        const requests = await prisma.roleAssignmentRequest.findMany({
            where: whereClause,
            include: {
                assignedRole: { select: { id: true, name: true } },
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
                department: { select: { id: true, name: true } },
                industry: { select: { id: true, name: true } },
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
