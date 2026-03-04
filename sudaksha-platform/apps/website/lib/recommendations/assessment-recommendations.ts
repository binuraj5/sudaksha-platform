/**
 * Enhancement #5: Intelligent Recommendations for Assessment creation
 * Returns contextual suggestions based on role, level, audience.
 */

export interface RecommendationContext {
  userRole?: string;
  targetAudience?: 'STUDENTS' | 'EMPLOYEES' | 'ALL';
  assessmentType?: string;
  competencyCategory?: string;
  roleLevel?: string;
  roleCategory?: string;
}

export interface Recommendation {
  id: string;
  category: string;
  recommendationText: string;
  rationale: string;
  autoApplyValues: Record<string, unknown> | null;
}

/**
 * Get recommendations for assessment creation (built-in rules; DB rules can be added via API).
 */
export function getAssessmentRecommendations(context: RecommendationContext): Recommendation[] {
  return getBuiltInRecommendations(context);
}

function getBuiltInRecommendations(context: RecommendationContext): Recommendation[] {
  const out: Recommendation[] = [];
  if (context.targetAudience === 'STUDENTS' && ['JUNIOR', 'MIDDLE'].includes(context.roleLevel || '')) {
    out.push({
      id: 'builtin-1',
      category: 'ASSESSMENT',
      recommendationText: 'Suggested: 40% Code Execution, 40% MCQ, 20% Voice AI for technical roles.',
      rationale: 'Technical roles require hands-on coding validation. MCQs test theoretical knowledge. Voice AI assesses communication skills critical for teamwork.',
      autoApplyValues: { code_execution_weight: 40, mcq_weight: 40, voice_ai_weight: 20 }
    });
  }
  if (context.roleLevel === 'JUNIOR') {
    out.push({
      id: 'builtin-2',
      category: 'ASSESSMENT',
      recommendationText: 'Recommended: 20 Easy, 20 Medium, 10 Hard questions for balanced assessment.',
      rationale: 'Balanced difficulty helps distinguish competency levels without overwhelming junior candidates.',
      autoApplyValues: { easyCount: 20, mediumCount: 20, hardCount: 10 }
    });
  }
  if (out.length === 0) {
    out.push({
      id: 'builtin-default',
      category: 'ASSESSMENT',
      recommendationText: 'Industry standard: 70% for junior roles, 80% for senior roles as pass threshold.',
      rationale: 'Common certification and hiring benchmarks.',
      autoApplyValues: { passingScore: context.roleLevel === 'SENIOR' || context.roleLevel === 'EXPERT' ? 80 : 70 }
    });
  }
  return out;
}
