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

        // Scope the query for both PENDING and APPROVED (for stage 2: build model)
        const whereClause: any = {
            status: { in: ["PENDING", "APPROVED"] }
        };

        if (role === "SUPER_ADMIN") {
            // Super admins see all
        } else if (role === "ADMIN" || role === "ORG_ADMIN" || role === "CLIENT_ADMIN") {
            whereClause.tenantId = user.tenantId;
        } else if ((role as string) === "DEPT_HEAD") {
            whereClause.tenantId = user.tenantId;
        } else if ((role as string) === "TEAM_LEAD") {
            whereClause.tenantId = user.tenantId;
        }

        const requests = await prisma.approvalRequest.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        // Enrich with entity data and filter out APPROVED requests that ALREADY have models
        const enriched: any[] = [];
        for (const req of requests) {
            let entityName = "Unknown";
            let entityDescription = "";
            let needsAssessmentModel = false;

            try {
                if (req.type === "ROLE") {
                    if (req.status === "APPROVED") continue; // We only want PENDING roles

                    const entity = await prisma.role.findUnique({
                        where: { id: req.entityId },
                        select: { name: true, description: true },
                    });
                    entityName = entity?.name ?? req.entityId;
                    entityDescription = entity?.description ?? "";
                } else if (req.type === "COMPETENCY") {
                    const entity = await prisma.competency.findUnique({
                        where: { id: req.entityId },
                        select: { name: true, description: true, assessmentModelComponents: { select: { id: true } } },
                    });
                    if (!entity) continue;

                    entityName = entity.name;
                    entityDescription = entity.description || "";

                    // If it is APPROVED, check if it still needs a model
                    if (req.status === "APPROVED") {
                        const hasModels = entity.assessmentModelComponents.length > 0;
                        if (hasModels) {
                            continue; // It's approved and has a model, so it's fully complete. Do not show in queue.
                        }
                        needsAssessmentModel = true;
                    }
                }
            } catch (e) { }

            enriched.push({
                ...req,
                entityName,
                entityDescription,
                needsAssessmentModel
            });
        }

        return NextResponse.json({ requests: enriched });
    } catch (error) {
        console.error("Get approvals error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
