/**
 * Enhancement #5: Intelligent Recommendations for Report generation
 * Returns contextual suggestions based on reporting scenario/needs.
 */

export interface ReportRecommendationContext {
    scenario?: string;
    role?: string;
}

export interface Recommendation {
    id: string;
    category: string;
    recommendationText: string;
    rationale: string;
    autoApplyValues: Record<string, unknown> | null;
}

export function getReportRecommendations(context: ReportRecommendationContext): Recommendation[] {
    const out: Recommendation[] = [];
    const scenario = (context.scenario || '').toLowerCase();

    if (scenario.includes('struggling') || scenario.includes('class') || scenario.includes('intervention')) {
        out.push({
            id: 'report-rec-1',
            category: 'REPORT',
            recommendationText: 'Student Performance by Topic + Bottom 20% Intervention Report.',
            rationale: 'Quickly identifying bottom-quartile students enables timely pedagogical interventions.',
            autoApplyValues: {
                name: 'Class Intervention & Support Report',
                filters: { 'focus': 'Bottom 20%' }
            }
        });
    }

    if (scenario.includes('hiring') || scenario.includes('candidate') || scenario.includes('compare')) {
        out.push({
            id: 'report-rec-2',
            category: 'REPORT',
            recommendationText: 'Candidate Comparison Matrix with Competency Heatmap.',
            rationale: 'A heatmap reveals strength disparities instantly versus standard list views.',
            autoApplyValues: {
                name: 'Hiring Comparison Heatmap',
                filters: { 'sortBy': 'Top Scorers First' }
            }
        });
    }

    if (scenario.includes('progress') || scenario.includes('review') || scenario.includes('team')) {
        out.push({
            id: 'report-rec-3',
            category: 'REPORT',
            recommendationText: 'Team Competency Growth Trend + Gap Analysis Dashboard.',
            rationale: 'Growth trends combined with gap analysis drives focused employee training.',
            autoApplyValues: {
                name: 'Quarterly Team Maturity Report',
                filters: { 'timeframe': 'Last 90 Days' }
            }
        });
    }

    if (out.length === 0) {
        out.push({
            id: 'report-rec-default',
            category: 'REPORT',
            recommendationText: 'Run a High-Level Summary with drill-down options.',
            rationale: 'Summaries are better for executive distribution, with deep analysis reserved for individual performance tracking.',
            autoApplyValues: null
        });
    }

    return out;
}
