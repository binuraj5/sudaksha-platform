import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    const u = session?.user as { id?: string; role?: string; userType?: string; tenantId?: string; departmentId?: string; teamId?: string; classId?: string } | undefined;

    if (!session?.user || !u?.role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const role = normalizeUserRole(u.role);
    const isSuperAdmin = role === "SUPER_ADMIN" || u.userType === "SUPER_ADMIN";

    // Scopes that can approve requests
    const isTenantAdmin = ["TENANT_ADMIN", "INSTITUTION_ADMIN", "CLIENT_ADMIN"].includes(role);
    const isDeptHead = ["DEPARTMENT_HEAD", "DEPT_HEAD_INST"].includes(role);
    const isTeamLead = ["TEAM_LEADER", "CLASS_TEACHER"].includes(role);

    if (!isSuperAdmin && !isTenantAdmin && !isDeptHead && !isTeamLead) {
        return NextResponse.json({ error: "Unauthorized to view approvals" }, { status: 403 });
    }

    let whereClause: any = {
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
    };

    if (!isSuperAdmin) {
        if (isTenantAdmin) {
            whereClause.tenantId = u.tenantId;
        } else if (isDeptHead) {
            // A department head can view approvals in their tenant
            // In a more complex scenario, we'd join with the entity to check departmentId.
            // For now, scoping to tenant id for department heads too, or checking requester's department
            whereClause.tenantId = u.tenantId;
        } else if (isTeamLead) {
            whereClause.tenantId = u.tenantId;
        }
    }

    try {
        const requests = await prisma.approvalRequest.findMany({
            where: whereClause,
            include: {
                tenant: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Enrich requests with entityName and entityDescription
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                let entityName = "Unknown Entity";
                let entityDescription = "";

                if (req.type === "ROLE") {
                    const role = await prisma.role.findUnique({
                        where: { id: req.entityId },
                        select: { name: true, description: true },
                    });
                    if (role) {
                        entityName = role.name;
                        entityDescription = role.description || "";
                    }
                } else if (req.type === "COMPETENCY") {
                    const competency = await prisma.competency.findUnique({
                        where: { id: req.entityId },
                        select: { name: true, description: true },
                    });
                    if (competency) {
                        entityName = competency.name;
                        entityDescription = competency.description || "";
                    }
                }

                return {
                    ...req,
                    entityName,
                    entityDescription,
                };
            })
        );

        return NextResponse.json({ requests: enrichedRequests });
    } catch (error) {
        console.error("[APPROVALS_GET]", error);
        return NextResponse.json({ error: "Failed to load approval requests" }, { status: 500 });
    }
}
