/**
 * Adaptive Engine – difficulty calculation and stopping logic (M9-5, Master doc).
 * Linear conversion: ability 1–10 → score 0–100 (e.g. 7.5/10 = 75/100).
 */

export interface AdaptiveConfig {
    min_questions: number;
    max_questions: number;
    starting_difficulty: number;
    allowed_question_types: string[];
    difficulty_adaptation_enabled: boolean;
    context_aware_followups: boolean;
    stopping_criteria: "MAX_QUESTIONS" | "HIGH_CONFIDENCE" | "BOTH";
}

export interface AdaptiveState {
    sessionId: string;
    currentAbility: number;
    questionsAsked: number;
    questionsCorrect: number;
    config: AdaptiveConfig;
}

export class AdaptiveEngine {
    public state: AdaptiveState;

    constructor(state: AdaptiveState) {
        this.state = { ...state };
    }

    /**
     * Next question difficulty from recent performance (M9-5).
     */
    calculateNextDifficulty(): number {
        if (!this.state.config.difficulty_adaptation_enabled) {
            return this.state.config.starting_difficulty;
        }
        if (this.state.questionsAsked === 0) {
            return this.state.config.starting_difficulty;
        }
        const accuracy = this.state.questionsCorrect / this.state.questionsAsked;
        let newAbility = this.state.currentAbility;
        if (accuracy >= 0.75) newAbility += 0.5;
        else if (accuracy <= 0.4) newAbility -= 0.5;
        newAbility = Math.max(1, Math.min(10, newAbility));
        this.state.currentAbility = newAbility;
        return Math.min(10, newAbility + 0.3);
    }

    /**
     * Whether to ask another question (min/max and stopping criteria).
     */
    shouldContinue(): boolean {
        const { min_questions, max_questions, stopping_criteria } = this.state.config;
        if (this.state.questionsAsked < min_questions) return true;
        if (this.state.questionsAsked >= max_questions) return false;
        if (stopping_criteria === "MAX_QUESTIONS") return true;
        if (stopping_criteria === "HIGH_CONFIDENCE" || stopping_criteria === "BOTH") {
            return !this.hasHighConfidence();
        }
        return true;
    }

    private hasHighConfidence(): boolean {
        if (this.state.questionsAsked < 8) return false;
        const accuracy = this.state.questionsCorrect / this.state.questionsAsked;
        if (accuracy >= 0.9 || accuracy <= 0.2) return true;
        if (this.state.questionsAsked >= 12 && (accuracy >= 0.7 || accuracy <= 0.3)) return true;
        return false;
    }

    /**
     * Final score: linear conversion ability 1–10 → 0–100 (M9-5).
     */
    calculateFinalScore(): { percentage: number; ability: number; accuracy: number } {
        const ability = this.state.currentAbility;
        const percentage = (ability - 1) / 9 * 90 + 10;
        const accuracy =
            this.state.questionsAsked > 0
                ? (this.state.questionsCorrect / this.state.questionsAsked) * 100
                : 0;
        return {
            percentage: Math.round(percentage * 100) / 100,
            ability: Math.round(ability * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100,
        };
    }

    static getBaselineAbility(targetLevel: string): number {
        const baselines: Record<string, number> = {
            JUNIOR: 3,
            MIDDLE: 5,
            SENIOR: 7,
            EXPERT: 9,
        };
        return baselines[targetLevel] ?? 5;
    }

    estimateRemainingQuestions(): string {
        const asked = this.state.questionsAsked;
        const { min_questions, max_questions } = this.state.config;
        if (asked < min_questions) return `${min_questions - asked}-${max_questions - asked}`;
        if (this.hasHighConfidence()) return "1-2";
        return `2-${max_questions - asked}`;
    }
}
