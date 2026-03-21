/**
 * report-ai.ts
 * Parallelized AI narrative generation for the individual assessment report.
 * Uses Anthropic Claude with a graceful plaintext fallback on API failure.
 */

import type { CareerContext } from './tni-utils';
import type { GapBand } from './tni-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GapRow {
  competencyName: string;
  category: string;
  achievedPct: number;
  requiredLevel: string;
  gap: GapBand;
  gapLabel: string;
}

export interface ReportNarratives {
  executiveSummary: string;       // Section 1 — 3-4 sentences
  gapInsight: string;             // Section 2 — 2-3 sentences on top gaps
  capabilityTrajectory: string;   // Section 5 — 2-3 sentences forward-looking
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Try Anthropic Claude first; fall back to Google Gemini on failure/quota. */
async function callAI(prompt: string, maxTokens = 250): Promise<string | null> {
  const result = await callClaude(prompt, maxTokens);
  if (result !== null) return result;
  // Anthropic unavailable/over-quota — try Gemini
  return callGemini(prompt);
}

async function callClaude(prompt: string, maxTokens = 250): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.warn('[report-ai] Claude API error', res.status, '— falling back to Gemini');
      return null;  // triggers Gemini fallback
    }

    const data = await res.json();
    return (data.content?.[0]?.text as string) ?? null;
  } catch (err) {
    console.warn('[report-ai] Claude network error — falling back to Gemini', err);
    return null;
  }
}

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      console.warn('[report-ai] Gemini API error', res.status);
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    return text ?? null;
  } catch (err) {
    console.warn('[report-ai] Gemini network error', err);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate all three AI narratives for the report in parallel.
 * Falls back gracefully to plaintext if Anthropic is unavailable.
 */
export async function generateReportNarratives(opts: {
  memberName: string;
  roleBasedMode: boolean;         // Mode A vs Mode B
  roleName: string;
  overallScore: number;
  fitmentPct: number;
  readinessLabel: string;
  gapRows: GapRow[];
  trainingCount: number;
  careerCtx: CareerContext | null;
}): Promise<ReportNarratives> {
  const {
    memberName, roleBasedMode, roleName, overallScore, fitmentPct,
    readinessLabel, gapRows, trainingCount, careerCtx,
  } = opts;

  const name = memberName || 'the candidate';
  const criticalGaps = gapRows.filter(r => r.gap === 'CRITICAL_GAP' || r.gap === 'SIGNIFICANT_GAP');
  const topStrengths = gapRows.filter(r => r.gap === 'EXCEEDS' || r.gap === 'MET');
  const careerSummary = careerCtx
    ? `Current role: ${careerCtx.currentRole}. Designation: ${careerCtx.designation || 'not specified'}. Strengths: ${careerCtx.strengths.slice(0, 4).join(', ') || 'not listed'}. Areas to improve: ${careerCtx.areasToImprove.slice(0, 3).join(', ') || 'not listed'}. Certifications: ${careerCtx.certifications.slice(0, 3).join(', ') || 'none'}. Learning preferences: ${careerCtx.learningPreferences.join(', ') || 'not specified'}.`
    : '';

  // ── Prompt 1: Executive Summary ───────────────────────────────────────────
  const execPrompt = roleBasedMode
    ? `You are a workforce analytics advisor. Write 3-4 sentences as an executive summary for an individual assessment report.

Candidate: ${name}
Target Role: ${roleName}
Overall Assessment Score: ${overallScore}%
Role Fitment Index: ${fitmentPct}%
Readiness Verdict: ${readinessLabel}
Competencies exceeding/meeting requirements: ${topStrengths.length}
Competencies with gaps: ${criticalGaps.length}
Training interventions recommended: ${trainingCount}
${careerSummary}

Write in third person, professional tone. Use specific numbers. Do not invent facts beyond what is provided. No bullet points.`
    : `You are a workforce analytics advisor. Write 3-4 sentences as an executive summary for a standalone competency assessment report.

Candidate: ${name}
Overall Assessment Score: ${overallScore}%
Competencies assessed: ${gapRows.length}
${careerSummary}

Write in third person, professional tone. Use specific numbers. Do not invent facts beyond what is provided. No bullet points.`;

  // ── Prompt 2: Gap Insight ──────────────────────────────────────────────────
  const gapPrompt = roleBasedMode && criticalGaps.length > 0
    ? `You are a workforce development advisor. Write 2-3 sentences summarising the most critical competency gaps.

Role: ${roleName}
Priority gaps: ${criticalGaps.slice(0, 3).map(g => `${g.competencyName} (${g.gapLabel})`).join(', ')}

Be specific, concise. State the business impact of these gaps. No bullet points.`
    : '';

  // ── Prompt 3: Capability Trajectory ───────────────────────────────────────
  const trajectoryPrompt = `You are a talent development advisor. Write 2-3 forward-looking sentences about the candidate's development trajectory.

Candidate: ${name}
Current fitment: ${fitmentPct}%
Readiness verdict: ${readinessLabel}
${careerCtx?.goals ? `Career goals: ${careerCtx.goals}` : ''}
${careerCtx?.learningPreferences?.length ? `Preferred learning modes: ${careerCtx.learningPreferences.join(', ')}` : ''}
${trainingCount} training interventions are recommended.

Focus on positive, actionable language about their growth path. No bullet points.`;

  // ── Parallelise all three calls ────────────────────────────────────────────
  const [execRaw, gapRaw, trajRaw] = await Promise.all([
    callAI(execPrompt, 300),
    gapPrompt ? callAI(gapPrompt, 200) : Promise.resolve(null),
    callAI(trajectoryPrompt, 200),
  ]);

  // ── Fallbacks ──────────────────────────────────────────────────────────────
  const executiveSummary = execRaw ??
    `${name} completed the ${roleBasedMode ? roleName : 'competency'} assessment with an overall score of ${overallScore}%. ` +
    (roleBasedMode
      ? `The role fitment index stands at ${fitmentPct}%, indicating a '${readinessLabel}' readiness level. ` +
        `${topStrengths.length} competencies meet or exceed requirements, while ${trainingCount} training interventions are recommended to close priority gaps.`
      : `${gapRows.length} competencies were assessed. The results provide a detailed baseline for development planning.`);

  const gapInsight = gapRaw ??
    (criticalGaps.length > 0
      ? `Key development areas include ${criticalGaps.slice(0, 3).map(g => g.competencyName).join(', ')}, which represent the highest-priority gaps relative to the ${roleName} role requirements. Addressing these through structured training will have the most immediate impact on role readiness.`
      : '');

  const capabilityTrajectory = trajRaw ??
    `With ${trainingCount} targeted interventions aligned to the identified gaps, ${name} is on a clear development path toward role readiness. ` +
    (careerCtx?.learningPreferences?.length
      ? `Their preferred learning modes — ${careerCtx.learningPreferences.slice(0, 2).join(' and ')} — should be prioritised when designing the development plan.`
      : `Consistent application of recommended training programmes will accelerate progression.`);

  return { executiveSummary, gapInsight, capabilityTrajectory };
}
