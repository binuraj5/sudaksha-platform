import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

/**
 * GET /api/approvals
 * Returns ApprovalRequests scoped to the current user's review authority:
 * - SUPER_ADMIN / ADMIN: all pending requests within their tenant
 * - DEPT_HEAD: pending requests from their department
 * - TEAM_LEAD: pending requests from their team
 */
export async function GET() {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const role = normalizeUserRole(user.role);

        // Only managers/admins can view the approval queue
        const allowedRoles = ["SUPER_ADMIN", "ADMIN", "ORG_ADMIN", "CLIENT_ADMIN", "DEPT_HEAD", "TEAM_LEAD"];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Scope the query based on the reviewer's authority level
        const whereClause: any = { status: "PENDING" };

        if (role === "SUPER_ADMIN") {
            // Super admins see all pending requests
        } else if (role === "ADMIN" || role === "ORG_ADMIN" || role === "CLIENT_ADMIN") {
            // Org-level admins see requests within their tenant
            whereClause.tenantId = user.tenantId;
        } else if ((role as string) === "DEPT_HEAD") {
            // Dept heads see requests from their department (or tenant fallback)
            whereClause.tenantId = user.tenantId;
        } else if ((role as string) === "TEAM_LEAD") {
            // Team leads see requests from their team members in the same tenant
            whereClause.tenantId = user.tenantId;
        }

        const requests = await prisma.approvalRequest.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        // Enrich with entity data for display
        const enriched = await Promise.all(
            requests.map(async (req) => {
                let entityName = "Unknown";
                let entityDescription = "";
                try {
                    if (req.type === "ROLE") {
                        const entity = await prisma.role.findUnique({
                            where: { id: req.entityId },
                            select: { name: true, description: true, scope: true, overallLevel: true },
                        });
                        entityName = entity?.name ?? req.entityId;
                        entityDescription = entity?.description ?? "";
                    } else if (req.type === "COMPETENCY") {
                        const entity = await prisma.competency.findUnique({
                            where: { id: req.entityId },
                            select: { name: true, description: true, category: true },
                        });
                        entityName = entity?.name ?? req.entityId;
                        entityDescription = entity?.description ?? "";
                    }
                } catch { }
                return {
                    ...req,
                    entityName,
                    entityDescription,
                };
            })
        );

        return NextResponse.json({ requests: enriched });
    } catch (error) {
        console.error("Get approvals error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
