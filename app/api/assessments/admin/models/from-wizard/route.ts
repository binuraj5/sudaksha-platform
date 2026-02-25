import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { selectRelevantIndicators } from "@/lib/assessment/indicator-selection";
import { ProficiencyLevel } from "@prisma/client";
import { getRoleCompetencyPermissions } from "@/lib/permissions/role-competency-permissions";

/**
 * EXTENDS from-role: Creates model with multiple components per competency
 * based on wizard selection (e.g. MCQ + CODE for one Technical competency).
 */
export async function POST(request: Request) {
    try {
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
        const permissions = getRoleCompetencyPermissions(userContext);

        if (!permissions.canCreate) {
            return NextResponse.json({ error: "You do not have permission to create assessment models" }, { status: 403 });
        }

        const body = await request.json();
        let { roleId, targetLevel, name, components, competencyWeights, requesterId } = body;

        if (!targetLevel || !name || !Array.isArray(components) || components.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields: targetLevel, name, components" },
                { status: 400 }
            );
        }

        if (permissions.isInstitution) {
            targetLevel = "JUNIOR";
        }

        const tenantId = userContext.tenantId ?? null;

        let role = null;
        if (roleId) {
            role = await prisma.role.findUnique({
                where: { id: roleId },
                include: {
                    competencies: {
                        include: { competency: true },
                    },
                },
            });

            if (!role) {
                return NextResponse.json({ error: "Role not found" }, { status: 404 });
            }
        }

        // Validate competencyWeights if provided (must sum to 100%)
        if (competencyWeights && Object.keys(competencyWeights).length > 0) {
            const competencyIdsInComponents = Array.from(
                new Set((components as { competencyId: string }[]).map((c) => c.competencyId))
            );
            const totalWeight = competencyIdsInComponents.reduce(
                (sum, id) => sum + (competencyWeights[id] ?? 0),
                0
            );
            if (Math.abs(totalWeight - 100) > 0.5) {
                return NextResponse.json(
                    { error: "Weights must sum to 100%" },
                    { status: 400 }
                );
            }
        }

        const lastModel = await prisma.assessmentModel.findFirst({
            where: {
                code: {
                    startsWith: "ASM",
                },
            },
            orderBy: { createdAt: "desc" },
            select: { code: true },
        });

        let nextCode = "ASM001";
        if (lastModel?.code?.startsWith("ASM")) {
            const lastNum = parseInt(lastModel.code.substring(3), 10);
            if (!Number.isNaN(lastNum) && lastNum >= 0) {
                nextCode = `ASM${String(lastNum + 1).padStart(3, "0")}`;
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const model = await tx.assessmentModel.create({
                data: {
                    name: String(name).trim(),
                    slug: nextCode.toLowerCase() + "-" + Math.random().toString(36).substr(2, 4),
                    description: role ? `Assessment built from ${role.name} via wizard.` : `Custom Competency Assessment built via wizard.`,
                    sourceType: role ? "ROLE_BASED" : "COMPETENCY_BASED",
                    roleId: roleId || null,
                    targetLevel: targetLevel as ProficiencyLevel,
                    tenantId,
                    createdBy: userContext.id,
                    code: nextCode,
                    status: "DRAFT",
                    metadata: requesterId ? { autoAssignToMemberId: requesterId } : undefined,
                },
            });

            let order = 0;
            for (const c of components as { competencyId: string; componentType: string }[]) {
                const rc = role?.competencies.find((x: any) => x.competencyId === c.competencyId);
                const rawWeight =
                    competencyWeights?.[c.competencyId] ??
                    (rc ? (rc.weight <= 1 && rc.weight > 0 ? rc.weight * 100 : rc.weight) : 100);
                const weight =
                    typeof rawWeight === "number" && !Number.isNaN(rawWeight)
                        ? Math.max(0, Math.min(100, rawWeight))
                        : 1;
                const indicators = await selectRelevantIndicators(
                    c.competencyId,
                    targetLevel as ProficiencyLevel
                );
                const indicatorIds = indicators.map((i) => i.id);

                await tx.assessmentModelComponent.create({
                    data: {
                        modelId: model.id,
                        competencyId: c.competencyId,
                        weight,
                        targetLevel: targetLevel as ProficiencyLevel,
                        indicatorIds: indicatorIds,
                        order: order++,
                        isRequired: true,
                        isTimed: true,
                        componentType: c.componentType || "QUESTIONNAIRE",
                        status: "DRAFT",
                    },
                });
            }

            return model;
        });

        return NextResponse.json(result);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("from-wizard error:", msg);
        return NextResponse.json(
            { error: "Internal Server Error", details: process.env.NODE_ENV === "development" ? msg : undefined },
            { status: 500 }
        );
    }
}
