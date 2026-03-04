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
            include: { tenant: { select: { name: true } } }
        });

        // Enrich with entity data and filter out APPROVED requests that ALREADY have models
        const enriched: any[] = [];
        for (const req of requests) {
            let entityName = "Unknown";
            let entityDescription = "";
            let needsAssessmentModel = false;
            let requesterName = "Unknown";
            let requesterEmail = "";
            let tenantName = req.tenant?.name || "Unknown Org";

            if (req.requesterId) {
                try {
                    const rUser = await prisma.user.findUnique({
                        where: { id: req.requesterId },
                        select: { name: true, email: true }
                    });
                    if (rUser) {
                        requesterName = rUser.name;
                        requesterEmail = rUser.email;
                    }
                } catch (e) { }
            }

            try {
                if (req.type === "ROLE") {
                    if (req.status === "APPROVED") continue; // Only PENDING roles in queue

                    const entity = await prisma.role.findUnique({
                        where: { id: req.entityId },
                        select: { name: true, description: true },
                    });
                    entityName = entity?.name ?? req.entityId;
                    entityDescription = entity?.description ?? "";
                } else if (req.type === "COMPETENCY") {
                    if (req.status === "PENDING") {
                        // entityId is a CompetencyDevelopmentRequest id (skill dev request from an employee)
                        const devReq = await prisma.competencyDevelopmentRequest.findUnique({
                            where: { id: req.entityId },
                            select: { name: true, description: true },
                        });
                        if (!devReq) continue; // stale / deleted

                        entityName = devReq.name;
                        entityDescription = devReq.description ?? "";
                    } else if (req.status === "APPROVED") {
                        // entityId is a Competency id — check if it still needs an assessment model
                        const entity = await prisma.competency.findUnique({
                            where: { id: req.entityId },
                            select: { name: true, description: true, assessmentModelComponents: { select: { id: true } } },
                        });
                        if (!entity) continue;

                        entityName = entity.name;
                        entityDescription = entity.description || "";

                        const hasModels = entity.assessmentModelComponents.length > 0;
                        if (hasModels) continue; // Fully complete — don't show in queue
                        needsAssessmentModel = true;
                    }
                }
            } catch (e) { }

            enriched.push({
                ...req,
                entityName,
                entityDescription,
                needsAssessmentModel,
                requesterName,
                requesterEmail,
                tenantName
            });
        }

        return NextResponse.json({ requests: enriched });
    } catch (error) {
        console.error("Get approvals error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
