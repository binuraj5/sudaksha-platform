import { Role, Competency } from "@prisma/client";

export interface LearningStep {
    order: number;
    competency: Competency;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    estimatedTime: string;
}

export async function generateLearningPath(
    currentRole: Role & { competencies: Competency[] },
    aspirationalRole: Role & { competencies: Competency[] }
): Promise<LearningStep[]> {
    // 1. Get competency gap
    const currentCompetencyIds = new Set(currentRole.competencies.map(c => c.id));
    const requiredCompetencies = aspirationalRole.competencies;

    const gaps = requiredCompetencies.filter(
        rc => !currentCompetencyIds.has(rc.id)
    );

    // 2. Order by difficulty (mock dependency logic for now)
    // Assuming levels might be inherent or we use a basic sort
    const orderedGaps = gaps; // Placeholder for orderByDependency logic

    // 3. Generate learning steps
    return orderedGaps.map((competency, index) => ({
        order: index + 1,
        competency,
        status: index === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        progress: 0, // Placeholder
        estimatedTime: "2 weeks", // Placeholder
    }));
}
