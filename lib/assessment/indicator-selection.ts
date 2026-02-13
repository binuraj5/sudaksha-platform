import { prisma } from "@/lib/prisma";
import { ProficiencyLevel } from "@prisma/client";

const LEVEL_HIERARCHY: Record<ProficiencyLevel, number> = {
    JUNIOR: 1,
    MIDDLE: 2,
    SENIOR: 3,
    EXPERT: 4
};

export interface SelectedIndicator {
    id: string;
    text: string;
    level: ProficiencyLevel;
    type: string;
    weight: number;
}

/**
 * Smart Indicator Selection Algorithm
 * 
 * Selects indicators for a competency based on a target proficiency level.
 * includes exact level match (1.0 weight) and lower levels (0.3 weight).
 */
export async function selectRelevantIndicators(
    competencyId: string,
    targetLevel: ProficiencyLevel
): Promise<SelectedIndicator[]> {
    // 1. Fetch all indicators for this competency
    const allIndicators = await prisma.competencyIndicator.findMany({
        where: { competencyId },
        orderBy: { order: 'asc' }
    });

    const targetHierarchyValue = LEVEL_HIERARCHY[targetLevel];

    // 2. Filter indicators based on hierarchy
    return allIndicators
        .filter(indicator => LEVEL_HIERARCHY[indicator.level] <= targetHierarchyValue)
        .map(indicator => {
            const isExactMatch = indicator.level === targetLevel;
            return {
                id: indicator.id,
                text: indicator.text,
                level: indicator.level,
                type: indicator.type,
                weight: isExactMatch ? 1.0 : 0.3
            };
        });
}
