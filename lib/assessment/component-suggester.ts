import type { Competency } from "@prisma/client";

export interface ComponentSuggestion {
    type: ComponentType;
    priority: "HIGH" | "MEDIUM" | "LOW";
    reason: string;
    estimatedQuestions: number;
    estimatedDuration: number; // minutes
    icon: string;
}

export enum ComponentType {
    MCQ = "MCQ",
    SHORT_ANSWER = "SHORT_ANSWER",
    ESSAY = "ESSAY",
    SITUATIONAL = "SITUATIONAL",
    VOICE = "VOICE",
    VIDEO = "VIDEO",
    CODE = "CODE",
    ADAPTIVE_AI = "ADAPTIVE_AI",
    PANEL = "PANEL",
    // Legacy aliases for backward compatibility
    MULTIPLE_SELECT = "MULTIPLE_SELECT",
    QUESTIONNAIRE = "QUESTIONNAIRE",
    ADAPTIVE_QUESTIONNAIRE = "ADAPTIVE_QUESTIONNAIRE",
}

type CompetencyCategory = "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC";
type TargetLevel = "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";

const COMPONENT_ICONS: Record<string, string> = {
    MCQ: "📝",
    SHORT_ANSWER: "✍️",
    ESSAY: "📄",
    SITUATIONAL: "📋",
    VOICE: "🎙️",
    VIDEO: "🎥",
    CODE: "💻",
    ADAPTIVE_AI: "🤖",
    PANEL: "👥",
};

/**
 * Component Suggestion Engine
 * Suggests optimal assessment component types based on competency category and target level.
 * Per MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md - all 9 component types.
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
        const category = (competency.category as string) || "DOMAIN_SPECIFIC";

        const add = (type: ComponentType, priority: "HIGH" | "MEDIUM" | "LOW", reason: string, q: number, d: number) => {
            suggestions.push({
                type,
                priority,
                reason,
                estimatedQuestions: q,
                estimatedDuration: d,
                icon: COMPONENT_ICONS[type] ?? "📝",
            });
        };

        // 1. MCQ - ALWAYS suggested (universal)
        add(
            ComponentType.MCQ,
            "HIGH",
            "Quick knowledge verification",
            this.getEstimatedQuestionCount("MCQ", targetLevel),
            this.getEstimatedDuration("MCQ", targetLevel)
        );

        // 2. ADAPTIVE_AI - ALWAYS suggested (intelligent alternative to static MCQ)
        add(
            ComponentType.ADAPTIVE_AI,
            "HIGH",
            "AI adapts difficulty in real-time for precise measurement",
            12,
            20
        );

        // 3. Category-specific suggestions
        switch (category) {
            case "TECHNICAL":
                add(ComponentType.CODE, "HIGH", "Hands-on technical validation", 2, 45);
                add(ComponentType.SITUATIONAL, "MEDIUM", "Technical decision-making scenarios", 3, 15);
                break;

            case "BEHAVIORAL":
            case "LEADERSHIP":
                add(ComponentType.SITUATIONAL, "HIGH", "Behavioral scenarios and judgment", 5, 20);
                add(
                    ComponentType.VIDEO,
                    targetLevel === "SENIOR" || targetLevel === "EXPERT" ? "HIGH" : "MEDIUM",
                    "Assess leadership presence and communication",
                    2,
                    15
                );
                add(ComponentType.VOICE, "MEDIUM", "Conversational assessment of behavioral competencies", 3, 10);
                add(
                    ComponentType.PANEL,
                    targetLevel === "SENIOR" || targetLevel === "EXPERT" ? "HIGH" : "LOW",
                    "Live interview for leadership roles",
                    1,
                    45
                );
                break;

            case "COMMUNICATION":
                add(ComponentType.ESSAY, "HIGH", "Written communication assessment (Versant-style)", 2, 30);
                add(ComponentType.SHORT_ANSWER, "MEDIUM", "Concise written responses", 5, 15);
                add(ComponentType.VOICE, "HIGH", "Verbal communication fluency (Versant-style)", 4, 12);
                add(ComponentType.VIDEO, "MEDIUM", "Presentation and articulation skills", 2, 10);
                break;

            case "COGNITIVE":
            case "ANALYTICAL":
                add(ComponentType.ESSAY, "HIGH", "Critical thinking and analysis", 2, 30);
                add(ComponentType.SITUATIONAL, "MEDIUM", "Problem-solving scenarios", 4, 18);
                add(ComponentType.VOICE, "MEDIUM", "Verbal reasoning assessment", 3, 10);
                break;

            case "DOMAIN_SPECIFIC":
            default:
                add(ComponentType.SITUATIONAL, "MEDIUM", "Scenario-based assessment", 4, 18);
                if (!suggestions.some((s) => s.type === ComponentType.ESSAY)) {
                    add(ComponentType.ESSAY, "MEDIUM", "In-depth understanding and analytical thinking", 2, 30);
                }
                break;
        }

        // 4. Level-specific: Essay for senior roles
        if ((targetLevel === "SENIOR" || targetLevel === "EXPERT") && !suggestions.some((s) => s.type === ComponentType.ESSAY)) {
            add(ComponentType.ESSAY, "HIGH", "Strategic thinking and comprehensive analysis for senior roles", 2, 30);
        }

        // Sort by priority
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    private static getEstimatedQuestionCount(type: string, level: string): number {
        const baseCount: Record<string, number> = {
            MCQ: 10,
            SHORT_ANSWER: 5,
            ESSAY: 2,
            SITUATIONAL: 5,
            CODE: 2,
            VOICE: 3,
            VIDEO: 2,
            ADAPTIVE_AI: 12,
            PANEL: 1,
            MULTIPLE_SELECT: 8,
            QUESTIONNAIRE: 10,
            ADAPTIVE_QUESTIONNAIRE: 12,
        };
        const levelMultiplier: Record<string, number> = {
            JUNIOR: 0.8,
            MIDDLE: 1.0,
            SENIOR: 1.2,
            EXPERT: 1.5,
        };
        return Math.round((baseCount[type] ?? 10) * (levelMultiplier[level] ?? 1));
    }

    private static getEstimatedDuration(type: string, level: string): number {
        const baseDuration: Record<string, number> = {
            MCQ: 15,
            SHORT_ANSWER: 15,
            ESSAY: 30,
            SITUATIONAL: 20,
            CODE: 45,
            VOICE: 10,
            VIDEO: 15,
            ADAPTIVE_AI: 20,
            PANEL: 45,
            MULTIPLE_SELECT: 12,
            QUESTIONNAIRE: 15,
            ADAPTIVE_QUESTIONNAIRE: 20,
        };
        const levelMultiplier: Record<string, number> = {
            JUNIOR: 0.8,
            MIDDLE: 1.0,
            SENIOR: 1.3,
            EXPERT: 1.5,
        };
        return Math.round((baseDuration[type] ?? 20) * (levelMultiplier[level] ?? 1));
    }
}
