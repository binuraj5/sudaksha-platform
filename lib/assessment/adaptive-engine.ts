/**
 * Adaptive Assessment Engine
 * Based on M9-5_ADAPTIVE_AI_COMPONENT_IMPLEMENTATION.md
 * - Difficulty calculation based on performance
 * - Stopping criteria (min/max questions, high confidence)
 * - Linear conversion scoring: ability 1-10 → 10-100
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
    private _state: AdaptiveState;

    constructor(state: AdaptiveState) {
        this._state = { ...state };
    }

    get state(): AdaptiveState {
        return { ...this._state };
    }

    /**
     * Calculate next question difficulty based on performance
     */
    calculateNextDifficulty(): number {
        if (!this._state.config.difficulty_adaptation_enabled) {
            return this._state.config.starting_difficulty;
        }

        if (this._state.questionsAsked === 0) {
            return this._state.config.starting_difficulty;
        }

        const accuracy = this._state.questionsCorrect / this._state.questionsAsked;
        let newAbility = this._state.currentAbility;

        if (accuracy >= 0.75) {
            newAbility += 0.5;
        } else if (accuracy <= 0.4) {
            newAbility -= 0.5;
        }

        newAbility = Math.max(1, Math.min(10, newAbility));
        this._state.currentAbility = newAbility;

        return Math.min(10, newAbility + 0.3);
    }

    /**
     * Determine if assessment should continue
     */
    shouldContinue(): boolean {
        const { min_questions, max_questions, stopping_criteria } = this._state.config;

        if (this._state.questionsAsked < min_questions) return true;
        if (this._state.questionsAsked >= max_questions) return false;

        if (stopping_criteria === "MAX_QUESTIONS") return true;
        if (stopping_criteria === "HIGH_CONFIDENCE" || stopping_criteria === "BOTH") {
            return !this.hasHighConfidence();
        }
        return true;
    }

    private hasHighConfidence(): boolean {
        if (this._state.questionsAsked < 8) return false;

        const accuracy = this._state.questionsCorrect / this._state.questionsAsked;
        if (accuracy >= 0.9 || accuracy <= 0.2) return true;
        if (this._state.questionsAsked >= 12 && (accuracy >= 0.7 || accuracy <= 0.3)) return true;
        return false;
    }

    /**
     * Calculate final score (linear conversion: ability 1-10 → 10-100)
     */
    calculateFinalScore(): { percentage: number; ability: number; accuracy: number } {
        const percentage = ((this._state.currentAbility - 1) / 9) * 90 + 10;
        const accuracy =
            this._state.questionsAsked > 0
                ? (this._state.questionsCorrect / this._state.questionsAsked) * 100
                : 0;

        return {
            percentage: Math.round(percentage * 100) / 100,
            ability: Math.round(this.state.currentAbility * 100) / 100,
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
        return baselines[targetLevel?.toUpperCase()] ?? 5;
    }

    estimateRemainingQuestions(): string {
        const asked = this._state.questionsAsked;
        const min = this._state.config.min_questions;
        const max = this._state.config.max_questions;

        if (asked < min) return `${min - asked}-${max - asked}`;
        if (this.hasHighConfidence()) return "1-2";
        return `2-${max - asked}`;
    }
}
