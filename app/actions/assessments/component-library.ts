"use server";

import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { ProficiencyLevel } from "@prisma/client";

export async function getComponentLibrary(tenantId?: string) {
    const session = await getApiSession();
    if (!session) return { error: "Unauthorized" };

    const user = session.user as any;
    const userTenantId = tenantId || user.tenantId || user.clientId;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    try {
        const data = await prisma.componentLibrary.findMany({
            where: isSuperAdmin && !tenantId ? {} : {
                OR: [
                    { publishedToGlobal: true },
                    ...(userTenantId ? [{ tenantId: userTenantId }] : [])
                ]
            },
            include: {
                competency: { select: { name: true } },
                creator: { select: { name: true } }
            },
            orderBy: [
                { publishedToGlobal: 'desc' },
                { name: 'asc' }
            ]
        });

        return { data };
    } catch (error: any) {
        console.error("Failed to fetch component library", error);
        return { error: "Failed to fetch component library" };
    }
}

export async function createAssessmentFromComponents(data: {
    name: string;
    description: string;
    clientId: string;
    targetLevel: string;
    components: { id: string; weight: number }[];
}) {
    const session = await getApiSession();
    if (!session) return { error: "Unauthorized" };

    // Fallback: use session tenant if clientId not explicitly provided
    const user = session.user as any;
    const resolvedClientId = data.clientId || user.clientId || user.tenantId || null;
    // Normalize empty strings to null to avoid FK constraint violations
    const safeClientId = resolvedClientId && resolvedClientId.trim() !== "" ? resolvedClientId : null;

    try {
        const hash = Math.random().toString(36).substr(2, 6).toLowerCase();
        const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${hash}`;
        const code = `CBL-${hash.toUpperCase()}`;

        const model = await prisma.$transaction(async (tx) => {
            const newModel = await tx.assessmentModel.create({
                data: {
                    name: data.name,
                    slug: slug,
                    code: code,
                    description: data.description || null,
                    sourceType: 'CUSTOM',
                    status: 'DRAFT',
                    visibility: 'PRIVATE',
                    tenantId: safeClientId,
                    clientId: safeClientId,
                    createdBy: session.user.id,
                    targetLevel: (data.targetLevel || "MIDDLE") as ProficiencyLevel,
                    isActive: true,
                }
            });

            let order = 1;
            for (const comp of data.components) {
                const libComp = await tx.componentLibrary.findUnique({ where: { id: comp.id } });
                if (!libComp) continue;

                await tx.assessmentModelComponent.create({
                    data: {
                        modelId: newModel.id,
                        competencyId: libComp.competencyId,
                        order: order++,
                        weight: comp.weight || 1.0,
                        targetLevel: libComp.targetLevel as ProficiencyLevel,
                        componentType: libComp.componentType,
                        status: "DRAFT",
                        isRequired: true,
                        isTimed: true,
                        isFromLibrary: true,
                        libraryComponentId: libComp.id
                    }
                });

                // Update usage count metric
                await tx.componentLibrary.update({
                    where: { id: libComp.id },
                    data: { usageCount: { increment: 1 } }
                });
            }

            return newModel;
        });

        return { data: model };
    } catch (error: any) {
        console.error("Create Component Assessment Error:", error);
        return { error: error.message || "Failed to create assessment" };
    }
}
