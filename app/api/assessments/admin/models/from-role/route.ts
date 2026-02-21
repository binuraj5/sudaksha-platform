import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { selectRelevantIndicators } from "@/lib/assessment/indicator-selection";
import { ProficiencyLevel } from "@prisma/client";

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
        const { roleId, targetLevel, name, description, competencyWeights, tenantId } = body;

        if (!roleId || !targetLevel || !name) {
            return NextResponse.json({ error: "Missing required fields: roleId, targetLevel, name" }, { status: 400 });
        }

        const resolvedTenantId = tenantId ?? (session.user as { tenantId?: string }).tenantId ?? null;

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

        const result = await prisma.$transaction(async (tx) => {
            const model = await tx.assessmentModel.create({
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
                },
            });

            let order = 0;
            for (const rc of competenciesToUse) {
                const selectedIndicators = await selectRelevantIndicators(
                    rc.competencyId,
                    targetLevel as ProficiencyLevel
                );
                const indicatorIds = selectedIndicators.map((i) => i.id);

                const rawWeight = competencyWeights?.[rc.competencyId] ?? rc.weight;
                const weight =
                    typeof rawWeight === "number" && !Number.isNaN(rawWeight)
                        ? Math.max(0, Math.min(100, rawWeight))
                        : 1;

                await tx.assessmentModelComponent.create({
                    data: {
                        modelId: model.id,
                        competencyId: rc.competencyId,
                        weight,
                        targetLevel: targetLevel as ProficiencyLevel,
                        indicatorIds,
                        order: order++,
                        isRequired: true,
                        isTimed: true,
                    },
                });
            }

            return model;
        });

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
