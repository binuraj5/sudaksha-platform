"use server";

import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { buildCompetencyVisibilityFilter } from "@/lib/permissions/role-competency-permissions";
import { ProficiencyLevel } from "@prisma/client";

export async function getAccessibleCompetencies(tenantId?: string) {
    const session = await getApiSession();
    if (!session) return { error: "Unauthorized" };

    const userCtx = {
        id: session.user.id,
        role: session.user.role,
        tenantId: tenantId || session.user.tenantId || (session.user as any).clientId,
        tenantType: (session.user as any).tenantType || "CORPORATE",
        departmentId: (session.user as any).departmentId,
        teamId: (session.user as any).teamId,
    };

    try {
        const whereClause = buildCompetencyVisibilityFilter(userCtx);
        const data = await prisma.competency.findMany({
            where: whereClause as any,
            include: {
                indicators: {
                    select: { id: true, level: true, text: true, type: true }
                },
                tenant: { select: { name: true } }
            },
            orderBy: [
                { name: 'asc' }
            ] as any
        });

        // Stringify BigInt / Decimal if there are any issues, otherwise return directly.
        // It's safe to return primitives over server actions.
        return { data };
    } catch (error: any) {
        console.error("Failed to fetch competencies", error);
        return { error: "Failed to fetch accessible competencies" };
    }
}

export async function createCompetencyBasedAssessment(data: {
    name: string;
    description: string;
    targetLevel: string;
    clientId: string;
    competencyIds: string[];
    competencyWeights: Record<string, number>;
}) {
    const session = await getApiSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const hash = Math.random().toString(36).substr(2, 6).toLowerCase();
        const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${hash}`;
        const code = `CPT-${hash.toUpperCase()}`;

        const model = await prisma.$transaction(async (tx) => {
            const newModel = await tx.assessmentModel.create({
                data: {
                    name: data.name,
                    slug: slug,
                    code: code,
                    description: data.description || null,
                    sourceType: 'COMPETENCY_BASED',
                    status: 'DRAFT',
                    visibility: 'PRIVATE',
                    tenantId: data.clientId,
                    clientId: data.clientId,
                    createdBy: session.user.id,
                    targetLevel: (data.targetLevel || "MIDDLE") as ProficiencyLevel,
                    isActive: true,
                }
            });

            let order = 1;
            for (const compId of data.competencyIds) {
                await tx.assessmentModelComponent.create({
                    data: {
                        modelId: newModel.id,
                        competencyId: compId,
                        order: order++,
                        weight: data.competencyWeights[compId] || 1.0,
                        targetLevel: data.targetLevel as ProficiencyLevel,
                        componentType: "QUESTIONNAIRE",
                        status: "DRAFT",
                        isRequired: true,
                        isTimed: true
                    }
                });
            }

            return newModel;
        });

        return { data: model };
    } catch (error: any) {
        console.error("Create Competency Assessment Error:", error);
        return { error: error.message || "Failed to create assessment" };
    }
}
