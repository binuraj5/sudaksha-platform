import type { Competency } from "@prisma/client";

export interface ComponentSuggestion {
    type: ComponentType;
    priority: "HIGH" | "MEDIUM" | "LOW";
    reason: string;
    estimatedQuestions: number;
    estimatedDuration: number; // minutes
}

export enum ComponentType {
    MCQ = "MCQ",
    MULTIPLE_SELECT = "MULTIPLE_SELECT",
    SITUATIONAL = "SITUATIONAL",
    CODE = "CODE",
    ESSAY = "ESSAY",
    VOICE = "VOICE",
    VIDEO = "VIDEO",
    PANEL = "PANEL",
    QUESTIONNAIRE = "QUESTIONNAIRE", // Alias for MCQ-based questionnaire
}

type CompetencyCategory = "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC";
type TargetLevel = "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";

/**
 * Component Suggestion Engine
 * Suggests optimal assessment component types based on competency category and target level.
 * REUSES existing indicator-selection logic; extends with category-based suggestions.
 */
export class ComponentSuggester {
    /**
     * Generate component suggestions based on competency and level
     */
    static suggestComponents(
        competency: Pick<Competency, "category">,
        targetLevel: TargetLevel
    ): ComponentSuggestion[] {
        const suggestions: ComponentSuggestion[] = [];

        // 1. MCQ - ALWAYS suggested for knowledge verification
        suggestions.push({
            type: ComponentType.MCQ,
            priority: "HIGH",
            reason: "Quick knowledge verification and foundational understanding",
            estimatedQuestions: this.getEstimatedQuestionCount("MCQ", targetLevel),
            estimatedDuration: this.getEstimatedDuration("MCQ", targetLevel),
        });

        // 2. Competency category-based suggestions (using existing CompetencyCategory enum)
        const category = competency.category as CompetencyCategory;

        switch (category) {
            case "TECHNICAL":
                suggestions.push(
                    {
                        type: ComponentType.CODE,
                        priority: "HIGH",
                        reason: "Hands-on technical validation - practical coding skills",
                        estimatedQuestions: this.getEstimatedQuestionCount("CODE", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("CODE", targetLevel),
                    },
                    {
                        type: ComponentType.SITUATIONAL,
                        priority: "MEDIUM",
                        reason: "Technical decision-making and problem-solving scenarios",
                        estimatedQuestions: this.getEstimatedQuestionCount("SITUATIONAL", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("SITUATIONAL", targetLevel),
                    }
                );
                break;

            case "BEHAVIORAL":
                suggestions.push(
                    {
                        type: ComponentType.SITUATIONAL,
                        priority: "HIGH",
                        reason: "Behavioral scenarios and decision-making assessment",
                        estimatedQuestions: this.getEstimatedQuestionCount("SITUATIONAL", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("SITUATIONAL", targetLevel),
                    },
                    {
                        type: ComponentType.VIDEO,
                        priority: targetLevel === "SENIOR" || targetLevel === "EXPERT" ? "HIGH" : "MEDIUM",
                        reason: "Leadership presence and communication assessment",
                        estimatedQuestions: this.getEstimatedQuestionCount("VIDEO", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("VIDEO", targetLevel),
                    },
                    {
                        type: ComponentType.PANEL,
                        priority: targetLevel === "SENIOR" || targetLevel === "EXPERT" ? "HIGH" : "LOW",
                        reason: "In-depth evaluation by expert panel",
                        estimatedQuestions: 1,
                        estimatedDuration: 45,
                    }
                );
                break;

            case "COGNITIVE":
                // Cognitive = analytical, written communication
                suggestions.push(
                    {
                        type: ComponentType.ESSAY,
                        priority: "HIGH",
                        reason: "Written communication and analytical thinking",
                        estimatedQuestions: this.getEstimatedQuestionCount("ESSAY", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("ESSAY", targetLevel),
                    },
                    {
                        type: ComponentType.SITUATIONAL,
                        priority: "MEDIUM",
                        reason: "Problem-solving and judgment assessment",
                        estimatedQuestions: this.getEstimatedQuestionCount("SITUATIONAL", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("SITUATIONAL", targetLevel),
                    }
                );
                break;

            case "DOMAIN_SPECIFIC":
            default:
                // Generic competency - suggest versatile components
                suggestions.push(
                    {
                        type: ComponentType.SITUATIONAL,
                        priority: "MEDIUM",
                        reason: "Practical application and judgment assessment",
                        estimatedQuestions: this.getEstimatedQuestionCount("SITUATIONAL", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("SITUATIONAL", targetLevel),
                    },
                    {
                        type: ComponentType.ESSAY,
                        priority: "MEDIUM",
                        reason: "In-depth understanding and analytical thinking",
                        estimatedQuestions: this.getEstimatedQuestionCount("ESSAY", targetLevel),
                        estimatedDuration: this.getEstimatedDuration("ESSAY", targetLevel),
                    }
                );
        }

        // 3. Level-specific additions
        if (targetLevel === "SENIOR" || targetLevel === "EXPERT") {
            if (!suggestions.find((s) => s.type === ComponentType.ESSAY)) {
                suggestions.push({
                    type: ComponentType.ESSAY,
                    priority: "HIGH",
                    reason: "Strategic thinking and comprehensive analysis for senior roles",
                    estimatedQuestions: this.getEstimatedQuestionCount("ESSAY", targetLevel),
                    estimatedDuration: this.getEstimatedDuration("ESSAY", targetLevel),
                });
            }
        }

        // Sort by priority
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        return suggestions.sort(
            (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }

    private static getEstimatedQuestionCount(
        type: string,
        level: string
    ): number {
        const baseCount: Record<string, number> = {
            MCQ: 10,
            MULTIPLE_SELECT: 8,
            SITUATIONAL: 5,
            CODE: 2,
            ESSAY: 2,
            VOICE: 3,
            VIDEO: 2,
            PANEL: 1,
            QUESTIONNAIRE: 10,
        };

        const levelMultiplier: Record<string, number> = {
            JUNIOR: 0.8,
            MIDDLE: 1.0,
            SENIOR: 1.2,
            EXPERT: 1.5,
        };

        const base = baseCount[type] ?? 5;
        const mult = levelMultiplier[level] ?? 1;
        return Math.round(base * mult);
    }

    private static getEstimatedDuration(
        type: string,
        level: string
    ): number {
        const baseDuration: Record<string, number> = {
            MCQ: 15,
            MULTIPLE_SELECT: 12,
            SITUATIONAL: 20,
            CODE: 45,
            ESSAY: 30,
            VOICE: 15,
            VIDEO: 20,
            PANEL: 45,
            QUESTIONNAIRE: 15,
        };

        const levelMultiplier: Record<string, number> = {
            JUNIOR: 0.8,
            MIDDLE: 1.0,
            SENIOR: 1.3,
            EXPERT: 1.5,
        };

        const base = baseDuration[type] ?? 20;
        const mult = levelMultiplier[level] ?? 1;
        return Math.round(base * mult);
    }
}
