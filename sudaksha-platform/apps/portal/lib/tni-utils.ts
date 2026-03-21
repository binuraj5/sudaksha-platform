export type GapBand = 'EXCEEDS' | 'MET' | 'NEAR_TARGET' | 'MODERATE_GAP' | 'SIGNIFICANT_GAP' | 'CRITICAL_GAP';

export const REQUIRED_LEVEL_PCT: Record<string, number> = {
  EXPERT: 75,
  SENIOR: 50,
  MIDDLE: 25,
  JUNIOR: 0,
};

export function getGapBand(achievedPct: number, requiredLevel: string): GapBand {
  const requiredPct = REQUIRED_LEVEL_PCT[requiredLevel] ?? 0;
  const gap = requiredPct - achievedPct;

  if (gap <= 0)   return 'EXCEEDS';      // met or exceeded
  if (gap <= 10)  return 'NEAR_TARGET';  // within 10%
  if (gap <= 25)  return 'MODERATE_GAP'; // 11–25%
  if (gap <= 50)  return 'SIGNIFICANT_GAP'; // 26–50%
  return 'CRITICAL_GAP';                 // >50%
}

export const GAP_BAND_LABEL: Record<GapBand, string> = {
  EXCEEDS:          'Exceeds Requirement',
  MET:              'Met',
  NEAR_TARGET:      'Near Target',
  MODERATE_GAP:     'Moderate Gap',
  SIGNIFICANT_GAP:  'Significant Gap',
  CRITICAL_GAP:     'Critical Gap',
};

export const GAP_BAND_PRIORITY: Record<GapBand, 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'> = {
  EXCEEDS:          'NONE',
  MET:              'NONE',
  NEAR_TARGET:      'LOW',
  MODERATE_GAP:     'MEDIUM',
  SIGNIFICANT_GAP:  'HIGH',
  CRITICAL_GAP:     'HIGH',
};

export const GAP_BAND_SORT_ORDER: Record<GapBand, number> = {
  CRITICAL_GAP:     0,
  SIGNIFICANT_GAP:  1,
  MODERATE_GAP:     2,
  NEAR_TARGET:      3,
  MET:              4,
  EXCEEDS:          5,
};

export async function generateTNIJustification(
  competencyName: string,
  achievedPct: number,
  requiredLevel: string,
  gapBand: GapBand,
  memberRole: string
): Promise<string> {
  const requiredPct = REQUIRED_LEVEL_PCT[requiredLevel] ?? 0;
  const gap = requiredPct - achievedPct;
  const fallback = `Training recommended to address the ${GAP_BAND_LABEL[gapBand]} in ${competencyName}.`;

  const prompt = `You are a workforce development advisor. Write a 2-3 sentence training justification for the following gap.

Role: ${memberRole}
Competency: ${competencyName}
Required level: ${requiredLevel} (${requiredPct}%)
Achieved score: ${achievedPct.toFixed(1)}%
Gap: ${gap.toFixed(1)}% — classified as ${GAP_BAND_LABEL[gapBand]}

Write only the justification. Be specific to this competency and gap size. Do not use generic language.`;

  // ── Try Anthropic ──────────────────────────────────────────────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) return text;
      } else {
        console.warn('[tni-utils] Anthropic error', res.status, '— trying Gemini');
      }
    } catch (err) {
      console.warn('[tni-utils] Anthropic network error — trying Gemini', err);
    }
  }

  // ── Fallback: Gemini ───────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
        if (text) return text;
      } else {
        console.warn('[tni-utils] Gemini error', res.status);
      }
    } catch (err) {
      console.warn('[tni-utils] Gemini network error', err);
    }
  }

  return fallback;
}

// ─── Career-context helpers ───────────────────────────────────────────────────

export interface CareerContext {
  currentRole: string;
  aspirationalRole: string;
  designation: string;
  certifications: string[];          // ["AWS Solution Architect (2023)", ...]
  strengths: string[];               // from selfAssessment.strengths
  areasToImprove: string[];          // from selfAssessment.areasToImprove
  performanceRating: number;         // 1-5, from selfAssessment.performanceRating
  learningPreferences: string[];     // from learningPreferences.selected
  selfAssessmentScores: Array<{ name: string; rating: number; category: string }>;
  goals: string;
  responsibilities: string;
}

/**
 * Build a structured career-context object from the raw careerFormData JSON
 * stored in the Member model. All fields are optional-safe.
 */
export function buildCareerContext(
  member: any,
  currentRoleName: string,
  aspirationalRoleName: string,
): CareerContext {
  const d: Record<string, any> = member?.careerFormData ?? {};
  const sa: Record<string, any> = d.selfAssessment ?? {};
  const lp: Record<string, any> = d.learningPreferences ?? {};

  const certifications: string[] = (d.certifications ?? []).map((c: any) =>
    [c.name, c.issuer, c.year].filter(Boolean).join(' — ')
  );

  return {
    currentRole: currentRoleName,
    aspirationalRole: aspirationalRoleName,
    designation: member?.designation || '',
    certifications,
    strengths: Array.isArray(sa.strengths) ? sa.strengths : [],
    areasToImprove: Array.isArray(sa.areasToImprove) ? sa.areasToImprove : [],
    performanceRating: Number(sa.performanceRating ?? 0),
    learningPreferences: Array.isArray(lp.selected) ? lp.selected : [],
    selfAssessmentScores: Array.isArray(d.selfAssessmentScores)
      ? d.selfAssessmentScores.map((s: any) => ({ name: s.name, rating: s.rating, category: s.category }))
      : [],
    goals: d.goals ?? '',
    responsibilities: d.responsibilities ?? '',
  };
}

/**
 * Map an achieved percentage to a human-readable standing label.
 */
export function getExperienceStanding(achievedPct: number): string {
  if (achievedPct >= 85) return 'Distinguished';
  if (achievedPct >= 70) return 'Proficient';
  if (achievedPct >= 50) return 'Developing';
  if (achievedPct >= 30) return 'Foundational';
  return 'Emerging';
}

/**
 * Compute an overall fitment percentage from the gap-analysis result set.
 * Weights: EXCEEDS → 100 %, NEAR_TARGET → 80 %, MODERATE_GAP → 50 %,
 *          SIGNIFICANT_GAP → 25 %, CRITICAL_GAP → 0 %, MET → 100 %
 */
export function computeOverallFitment(
  gapRows: Array<{ gap: GapBand }>,
): number {
  const BAND_SCORE: Record<GapBand, number> = {
    EXCEEDS: 100,
    MET: 100,
    NEAR_TARGET: 80,
    MODERATE_GAP: 50,
    SIGNIFICANT_GAP: 25,
    CRITICAL_GAP: 0,
  };
  if (!gapRows.length) return 0;
  const total = gapRows.reduce((sum, r) => sum + (BAND_SCORE[r.gap] ?? 0), 0);
  return Math.round(total / gapRows.length);
}

/**
 * Convert an overall fitment score into a qualitative readiness verdict.
 */
export function getReadinessVerdict(fitment: number): {
  label: string;
  color: string;
  description: string;
} {
  if (fitment >= 90) return { label: 'Role Ready', color: 'green', description: 'Meets or exceeds all role requirements.' };
  if (fitment >= 70) return { label: 'Near Ready', color: 'teal', description: 'Minor development needed to reach full role readiness.' };
  if (fitment >= 50) return { label: 'In Progress', color: 'amber', description: 'Moderate gaps; structured development will bridge the delta.' };
  if (fitment >= 25) return { label: 'Developing', color: 'orange', description: 'Significant gaps requiring targeted training investment.' };
  return { label: 'Emerging', color: 'red', description: 'Foundational competencies need substantial development.' };
}
