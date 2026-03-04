import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaAssessments } from "@sudaksha/db-assessments";
import { getApiSession } from "@/lib/get-session";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    const u = session?.user as { id?: string; role?: string; userType?: string; tenantId?: string; clientId?: string; departmentId?: string; teamId?: string; classId?: string } | undefined;

    if (!session?.user || !u?.role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const role = normalizeUserRole(u.role);
    const isSuperAdmin = role === "SUPER_ADMIN" || u.userType === "SUPER_ADMIN";

    const isTenantAdmin = ["TENANT_ADMIN", "INSTITUTION_ADMIN", "CLIENT_ADMIN"].includes(role);
    const isDeptHead = ["DEPARTMENT_HEAD", "DEPT_HEAD_INST"].includes(role);
    const isTeamLead = ["TEAM_LEADER", "CLASS_TEACHER"].includes(role);

    if (!isSuperAdmin && !isTenantAdmin && !isDeptHead && !isTeamLead) {
        return NextResponse.json({ error: "Unauthorized to view approvals" }, { status: 403 });
    }

    let whereClause: any = {
        ...(status ? { status: status as any } : {}),
    };

    const userTenantId = u.tenantId || u.clientId;

    if (!isSuperAdmin) {
        if (!userTenantId) {
            return NextResponse.json({ error: "Tenant ID required" }, { status: 403 });
        }
        whereClause.tenantId = userTenantId;
    }

    try {
        let requests: any[] = [];

        // Fetch ROLE and COMPETENCY from db-core
        if (!type || type === "ROLE" || type === "COMPETENCY") {
            const coreTypeFilter = type ? { type: type as any } : { type: { in: ["ROLE", "COMPETENCY"] as any[] } };
            const coreRequests = await prisma.approvalRequest.findMany({
                where: { ...whereClause, ...coreTypeFilter },
                include: {
                    tenant: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
            });
            requests = [...requests, ...coreRequests];
        }

        // Fetch ASSESSMENT_REQUEST from db-assessments
        if (!type || type === "ASSESSMENT_REQUEST") {
            const assessTypeFilter = { type: "ASSESSMENT_REQUEST" as any };
            const assessRequests = await prismaAssessments.approvalRequest.findMany({
                where: { ...whereClause, ...assessTypeFilter },
                orderBy: { createdAt: "desc" },
            });
            requests = [...requests, ...assessRequests];
        }

        // Sort combined requests by createdAt descending
        requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Batch-fetch all unique requester User records in one query from db-core
        const requesterIds = [...new Set(requests.map(r => r.requesterId).filter(Boolean))] as string[];
        const requesterMap: Record<string, { name: string | null; email: string | null }> = {};
        if (requesterIds.length > 0) {
            const users = await prisma.user.findMany({
                where: { id: { in: requesterIds } },
                select: { id: true, name: true, email: true },
            });
            for (const user of users) {
                requesterMap[user.id] = { name: user.name, email: user.email };
            }
        }

        // Batch-fetch tenants for db-assessment requests (since they don't have the include)
        const assessTenantIds = [...new Set(requests.filter(r => !r.tenant && r.tenantId).map(r => r.tenantId))] as string[];
        const tenantMap: Record<string, string> = {};
        if (assessTenantIds.length > 0) {
            const tenants = await prisma.tenant.findMany({
                where: { id: { in: assessTenantIds } },
                select: { id: true, name: true }
            });
            for (const tenant of tenants) {
                tenantMap[tenant.id] = tenant.name;
            }
        }

        // Enrich requests with entityName, entityDescription, requesterName, tenantName
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                let entityName = "Unknown Entity";
                let entityDescription = "";
                const originalData = req.originalData as any;

                if (req.type === "ROLE") {
                    // New role requests use a placeholder entityId — extract name from stored originalData
                    if (req.entityId?.startsWith("NEW_ROLE_REQUEST_")) {
                        entityName = originalData?.roleData?.name || originalData?.name || "Untitled Role Request";
                        entityDescription = originalData?.roleData?.description || originalData?.description || "";
                    } else {
                        const roleRecord = await prisma.role.findUnique({
                            where: { id: req.entityId },
                            select: { name: true, description: true },
                        });
                        if (roleRecord) {
                            entityName = roleRecord.name;
                            entityDescription = roleRecord.description || "";
                        } else if (originalData?.roleData?.name) {
                            entityName = originalData.roleData.name;
                            entityDescription = originalData.roleData.description || "";
                        }
                    }
                } else if (req.type === "COMPETENCY") {
                    const competency = await prisma.competency.findUnique({
                        where: { id: req.entityId },
                        select: { name: true, description: true },
                    });
                    if (competency) {
                        entityName = competency.name;
                        entityDescription = competency.description || "";
                    } else if (originalData?.name) {
                        entityName = originalData.name;
                        entityDescription = originalData.description || "";
                    }
                } else if ((req.type as string) === "ASSESSMENT_REQUEST") {
                    // Assessment requests store everything in modifiedData
                    const modData = req.modifiedData as any;
                    entityName = modData?.competencyName || req.entityId;
                    entityDescription = modData?.note || "";
                }

                const requester = req.requesterId ? requesterMap[req.requesterId] : null;
                const tenantName = req.tenant?.name || (req.tenantId ? tenantMap[req.tenantId] : null) || null;

                return {
                    ...req,
                    entityName,
                    entityDescription,
                    modifiedData: req.modifiedData ?? null,
                    requesterName: (req.modifiedData as any)?.memberName || requester?.name || requester?.email || null,
                    requesterEmail: requester?.email || null,
                    tenantName,
                };
            })
        );

        return NextResponse.json({ requests: enrichedRequests });
    } catch (error) {
        console.error("[APPROVALS_GET]", error);
        return NextResponse.json({ error: "Failed to load approval requests" }, { status: 500 });
    }
}
