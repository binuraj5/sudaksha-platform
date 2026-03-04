/**
 * Enhancement #5: Intelligent Recommendations for Survey creation
 * Returns contextual suggestions based on survey purpose/target.
 */

export interface SurveyRecommendationContext {
    purpose?: string;
    targetAudience?: string;
    tenantType?: string;
}

export interface Recommendation {
    id: string;
    category: string;
    recommendationText: string;
    rationale: string;
    autoApplyValues: Record<string, unknown> | null;
}

export function getSurveyRecommendations(context: SurveyRecommendationContext): Recommendation[] {
    const out: Recommendation[] = [];
    const purpose = (context.purpose || '').toLowerCase();

    if (purpose.includes('engagement') || purpose.includes('satisfaction') || purpose.includes('employee')) {
        out.push({
            id: 'survey-rec-1',
            category: 'SURVEY',
            recommendationText: 'Use Employee Satisfaction Template with Likert scale + open feedback.',
            rationale: 'Likert scales provide quantifiable metrics over time, while open text allows for qualitative insights.',
            autoApplyValues: {
                name: 'Employee Engagement Survey',
                description: 'Quarterly pulse check on employee satisfaction and engagement.',
                scoringEnabled: false,
            }
        });
    }

    if (purpose.includes('course') || purpose.includes('training') || purpose.includes('class')) {
        out.push({
            id: 'survey-rec-2',
            category: 'SURVEY',
            recommendationText: 'Use Course Evaluation Template with teaching effectiveness metrics.',
            rationale: 'Evaluating instructor effectiveness and material clarity is critical for curriculum improvement.',
            autoApplyValues: {
                name: 'Post-Training Evaluation',
                description: 'Feedback on course content, delivery, and applicability.',
                scoringEnabled: false,
            }
        });
    }

    if (out.length === 0) {
        out.push({
            id: 'survey-rec-default',
            category: 'SURVEY',
            recommendationText: 'Keep surveys under 10 questions to maximize completion rates.',
            rationale: 'Survey fatigue significantly drops response quality after 10 questions.',
            autoApplyValues: null
        });
    }

    return out;
}
