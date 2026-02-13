import { prisma } from "@/lib/prisma";
import { ProficiencyLevel } from "@prisma/client";

export interface DevelopmentAction {
    type: "LEARNING" | "PRACTICE" | "MENTORSHIP" | "ASSESSMENT";
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface CompetencyGap {
    competencyId: string;
    name: string;
    currentLevel: ProficiencyLevel | "NONE";
    targetLevel: ProficiencyLevel;
    priority: "HIGH" | "MEDIUM" | "LOW";
    actions: DevelopmentAction[];
}

export interface DevelopmentPlan {
    memberId: string;
    generatedAt: string;
    aspirationalRoleId: string;
    aspirationalRoleName: string;
    gaps: CompetencyGap[];
}

const levelRank: Record<string, number> = {
    "NONE": 0,
    "JUNIOR": 1,
    "MIDDLE": 2, // Assuming MIDDLE is roughly equivalent to INTERMEDIATE or MID_LEVEL based on schema enums
    "SENIOR": 3,
    "EXPERT": 4
};

export async function generateDevelopmentPlan(memberId: string): Promise<DevelopmentPlan | null> {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
            currentRole: {
                include: {
                    competencies: {
                        include: { competency: true }
                    }
                }
            },
            aspirationalRole: {
                include: {
                    competencies: {
                        include: { competency: true }
                    }
                }
            }
        }
    });

    if (!member || !member.aspirationalRole) {
        return null;
    }

    const currentCompMap = new Map<string, ProficiencyLevel>();
    member.currentRole?.competencies.forEach(rc => {
        currentCompMap.set(rc.competencyId, rc.requiredLevel);
    });

    const gaps: CompetencyGap[] = [];

    for (const targetRc of member.aspirationalRole.competencies) {
        const currentLevel = currentCompMap.get(targetRc.competencyId) || "NONE";
        const currentRank = levelRank[currentLevel] || 0;
        const targetRank = levelRank[targetRc.requiredLevel] || 1;

        if (currentRank < targetRank) {
            const gap: CompetencyGap = {
                competencyId: targetRc.competencyId,
                name: targetRc.competency.name,
                currentLevel: currentLevel as any,
                targetLevel: targetRc.requiredLevel,
                priority: targetRc.isCritical ? "HIGH" : (targetRank - currentRank >= 2 ? "MEDIUM" : "LOW"),
                actions: []
            };

            // Generate basic actions based on competency name and levels
            gap.actions = generateActions(gap);
            gaps.push(gap);
        }
    }

    return {
        memberId: member.id,
        generatedAt: new Date().toISOString(),
        aspirationalRoleId: member.aspirationalRole.id,
        aspirationalRoleName: member.aspirationalRole.name,
        gaps: gaps.sort((a, b) => {
            const priorityScore = { "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
            return priorityScore[b.priority] - priorityScore[a.priority];
        })
    };
}

function generateActions(gap: CompetencyGap): DevelopmentAction[] {
    const actions: DevelopmentAction[] = [];

    // 1. Learning Action
    actions.push({
        type: "LEARNING",
        title: `Comprehensive Course: ${gap.name}`,
        description: `Enroll in a structured course targeting ${gap.targetLevel} level proficiency in ${gap.name}. Focus on core concepts and advanced patterns.`,
        priority: gap.priority,
        status: "NOT_STARTED"
    });

    // 2. Practice/Project Action
    actions.push({
        type: "PRACTICE",
        title: `Practical Application: ${gap.name}`,
        description: `Implement ${gap.name} in a real-world project or sandbox environment. Aim to complete at least 2 significant tasks requiring ${gap.targetLevel} skills.`,
        priority: gap.priority,
        status: "NOT_STARTED"
    });

    // 3. Optional Mentorship if High Priority
    if (gap.priority === "HIGH") {
        actions.push({
            type: "MENTORSHIP",
            title: `Mentorship/Peer Review for ${gap.name}`,
            description: `Connect with a ${gap.targetLevel}+ level expert in ${gap.name} for weekly reviews of your progress and code/output.`,
            priority: "MEDIUM",
            status: "NOT_STARTED"
        });
    }

    return actions;
}
