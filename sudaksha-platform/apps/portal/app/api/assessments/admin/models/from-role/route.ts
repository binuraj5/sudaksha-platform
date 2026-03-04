import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ProficiencyLevel } from "@sudaksha/db-core";
import { prismaAssessments } from "@sudaksha/db-assessments";

export async function POST(request: Request) {
    try {
        if (!prisma.role) {
            return NextResponse.json(
                { error: "Database not configured. Please set DATABASE_URL and run migrations." },
                { status: 503 }
            );
        }

        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId || user.clientId,
            tenantType: (user.tenant?.type as any) || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };

        const { getRoleCompetencyPermissions } = await import("@/lib/permissions/role-competency-permissions");
        const permissions = getRoleCompetencyPermissions(userContext);

        if (!permissions.canCreate) {
            return NextResponse.json({ error: "You do not have permission to create assessment models" }, { status: 403 });
        }

        const userId = user.id;
        const body = await request.json();
        const { roleId, targetLevel, name, description, competencyWeights, tenantId, requesterId, requestId } = body;

        if (!roleId || !targetLevel || !name) {
            return NextResponse.json({ error: "Missing required fields: roleId, targetLevel, name" }, { status: 400 });
        }

        let resolvedTenantId = tenantId ?? (session.user as { tenantId?: string }).tenantId ?? null;

        if (!resolvedTenantId && requesterId) {
            const requester = await prisma.user.findUnique({
                where: { id: requesterId },
                select: { clientId: true, tenantId: true }
            });
            if (requester?.tenantId) {
                resolvedTenantId = requester.tenantId;
            } else if (requester?.clientId) {
                resolvedTenantId = requester.clientId;
            }
        }

        // 1. Fetch role and its competencies
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                competencies: {
                    include: {
                        competency: true
                    }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        if (role.competencies.length === 0) {
            return NextResponse.json({ error: "Role has no competencies linked" }, { status: 400 });
        }

        // 2. Generate unique code
        const lastModel = await prisma.assessmentModel.findFirst({
            where: {
                code: {
                    startsWith: "ASM",
                },
            },
            orderBy: { createdAt: 'desc' },
            select: { code: true }
        });

        let nextCode = "ASM001";
        if (lastModel?.code?.startsWith("ASM")) {
            const lastNum = parseInt(lastModel.code.substring(3), 10);
            if (!Number.isNaN(lastNum) && lastNum >= 0) {
                nextCode = `ASM${String(lastNum + 1).padStart(3, '0')}`;
            }
        }

        // 3. Filter competencies: only create components for those in competencyWeights (model-specific selection)
        const competenciesToUse =
            competencyWeights && Object.keys(competencyWeights).length > 0
                ? role.competencies.filter((rc) => competencyWeights[rc.competencyId] != null)
                : role.competencies;

        if (competenciesToUse.length === 0) {
            return NextResponse.json(
                { error: "Select at least one competency for this model" },
                { status: 400 }
            );
        }

        // 3b. Validate weights sum to 100% (model-specific)
        if (competencyWeights && Object.keys(competencyWeights).length > 0) {
            const totalWeight = competenciesToUse.reduce(
                (sum, rc) => sum + (competencyWeights[rc.competencyId] ?? 0),
                0
            );
            if (Math.abs(totalWeight - 100) > 0.5) {
                return NextResponse.json(
                    { error: "Weights must sum to 100%" },
                    { status: 400 }
                );
            }
            const hasInvalidWeight = competenciesToUse.some((rc) => {
                const w = competencyWeights[rc.competencyId];
                return w == null || w <= 0;
            });
            if (hasInvalidWeight) {
                return NextResponse.json(
                    { error: "Each selected competency must have a weight greater than 0" },
                    { status: 400 }
                );
            }
        }

        // Build competency weights map to persist in metadata (used by builder SUGGEST step)
        const resolvedWeights: Record<string, number> = {};
        for (const rc of competenciesToUse) {
            const rawWeight = competencyWeights?.[rc.competencyId] ?? rc.weight;
            resolvedWeights[rc.competencyId] =
                typeof rawWeight === "number" && !Number.isNaN(rawWeight)
                    ? Math.max(0, Math.min(100, rawWeight))
                    : 1;
        }

        // Create the model shell only — components are created by the Assessment Builder
        // after the admin selects component types in the Component Suggestions step.
        const result = await prisma.assessmentModel.create({
            data: {
                name: String(name).trim(),
                slug: nextCode.toLowerCase(),
                description: description ? String(description).trim() : "",
                sourceType: "ROLE_BASED",
                roleId,
                targetLevel: targetLevel as ProficiencyLevel,
                tenantId: resolvedTenantId,
                createdBy: userId,
                code: nextCode,
                status: "DRAFT",
                metadata: {
                    ...(requesterId ? { autoAssignToMemberId: requesterId } : {}),
                    competencyWeights: resolvedWeights,
                },
            },
        });

        if (requestId) {
            await prismaAssessments.approvalRequest.update({
                where: { id: requestId },
                data: {
                    status: "APPROVED",
                    reviewedAt: new Date(),
                    reviewerId: userId,
                },
            }).catch(e => console.error("Failed to approve request", e));
        }

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        console.error("Create assessment from role error:", message, stack);
        return NextResponse.json(
            { error: "Internal Server Error", details: process.env.NODE_ENV === "development" ? message : undefined },
            { status: 500 }
        );
    }
}
