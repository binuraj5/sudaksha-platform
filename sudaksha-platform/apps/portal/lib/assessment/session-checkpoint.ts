import { prisma } from "@/lib/prisma";

/**
 * Save a checkpoint snapshot for a UserAssessmentModel.
 * Uses raw queries because the Prisma client may not be regenerated yet with new fields.
 * Once migration runs and client is regenerated, the raw queries can be replaced with typed Prisma calls.
 */
export async function saveCheckpoint(uamId: string): Promise<void> {
    try {
        // Fetch components using raw to avoid pre-migration type issues
        const components = await (prisma as any).userAssessmentComponent.findMany({
            where: { userAssessmentModelId: uamId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                componentId: true,
                status: true,
                score: true,
                percentage: true,
                completedAt: true,
            }
        });

        const completedCount = (components as any[]).filter((c: any) => c.status === "COMPLETED").length;

        await (prisma as any).userAssessmentModel.update({
            where: { id: uamId },
            data: {
                lastActivityAt: new Date(),
                checkpointData: {
                    sections: components,
                    checkpointedAt: new Date().toISOString(),
                    completedSections: completedCount,
                    totalSections: (components as any[]).length,
                },
            }
        });
    } catch (err) {
        // Non-critical — don't fail the section transition if checkpoint fails
        console.error("[SaveCheckpoint] Failed:", err);
    }
}

/**
 * Save a checkpoint for a ProjectUserAssessment (org flow).
 */
export async function saveProjectCheckpoint(projectUserAssessmentId: string): Promise<void> {
    try {
        const components = await (prisma as any).userAssessmentComponent.findMany({
            where: { projectUserAssessmentId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                componentId: true,
                status: true,
                score: true,
                percentage: true,
                completedAt: true,
            }
        });

        const existing = await (prisma as any).projectUserAssessment.findUnique({
            where: { id: projectUserAssessmentId },
            select: { metadata: true }
        });
        const existingMeta = (existing?.metadata as any) ?? {};

        await (prisma as any).projectUserAssessment.update({
            where: { id: projectUserAssessmentId },
            data: {
                metadata: {
                    ...existingMeta,
                    checkpoint: {
                        sections: components,
                        checkpointedAt: new Date().toISOString(),
                        completedSections: (components as any[]).filter((c: any) => c.status === "COMPLETED").length,
                        totalSections: (components as any[]).length,
                    }
                },
            }
        });
    } catch (err) {
        console.error("[SaveProjectCheckpoint] Failed:", err);
    }
}

export interface SectionSummary {
    id: string;
    componentId: string;
    status: string;
    score: number | null;
    percentage: number | null;
    completedAt: string | null;
    sectionError?: string | null;
    retryCount?: number;
    component?: { name: string; componentType: string; order: number };
}

export interface SectionResumeState {
    uamId: string;
    completedSections: SectionSummary[];
    inProgressSection: SectionSummary | null;
    failedSection: SectionSummary | null;
    nextPendingSection: SectionSummary | null;
    canResume: boolean;
    isComplete: boolean;
    lastActivityAt: Date | null;
}

/**
 * Get the full resume state for a UserAssessmentModel.
 */
export async function getResumeState(uamId: string): Promise<SectionResumeState | null> {
    const uam = await (prisma as any).userAssessmentModel.findUnique({
        where: { id: uamId },
        select: {
            id: true,
            lastActivityAt: true,
            componentResults: {
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    componentId: true,
                    status: true,
                    score: true,
                    percentage: true,
                    completedAt: true,
                    sectionError: true,
                    retryCount: true,
                    component: {
                        select: { name: true, componentType: true, order: true }
                    }
                }
            }
        }
    });

    if (!uam) return null;

    const all: SectionSummary[] = uam.componentResults ?? [];
    const completedSections = all.filter(c => c.status === "COMPLETED");
    const inProgressSection = all.find(c => c.status === "ACTIVE") ?? null;
    const failedSection = all.find(c => c.status === "DRAFT" && c.sectionError) ?? null;
    const nextPendingSection = all.find(c => c.status === "DRAFT" && !c.sectionError) ?? null;

    return {
        uamId: uam.id,
        completedSections,
        inProgressSection: inProgressSection ?? null,
        failedSection: failedSection ?? null,
        nextPendingSection: nextPendingSection ?? null,
        canResume: !!(inProgressSection || failedSection),
        isComplete: all.length > 0 && all.every(c => c.status === "COMPLETED"),
        lastActivityAt: uam.lastActivityAt ?? null,
    };
}
