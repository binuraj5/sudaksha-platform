/**
 * CompetencyScore Compute Service
 * SEPL/INT/2026/IMPL-STEPS-01 Step 7
 *
 * Called after assessment completion to persist per-competency scores.
 * This is a NEW file — it does not modify any existing service.
 */

import { prisma } from '@/lib/prisma';
import { detectAndStoreBias } from './detectBias';
import { calibrateScore } from './calibrateScore';

// ── WEIGHT MATRIX ────────────────────────────────────────────────────────────
// Weights per domain per layer (L1=Self-report, L2=SJT, L3=Psychometric,
// L4=360, L5=NLP, L6=Simulation). Must sum to 1.0 per domain.
// Authorised by Binu Raj Pillai (CEO) — SEPL/INT/2026/IMPL-STEPS-01
const DOMAIN_WEIGHTS: Record<string, Record<string, number>> = {
  A:  { L1: 0.10, L2: 0.30, L3: 0.10, L4: 0.10, L5: 0.15, L6: 0.25 },
  AL: { L1: 0.10, L2: 0.15, L3: 0.10, L4: 0.40, L5: 0.15, L6: 0.10 },
  P:  { L1: 0.10, L2: 0.15, L3: 0.15, L4: 0.10, L5: 0.40, L6: 0.10 },
  D:  { L1: 0.10, L2: 0.20, L3: 0.15, L4: 0.05, L5: 0.30, L6: 0.20 },
  T:  { L1: 0.10, L2: 0.30, L3: 0.10, L4: 0.05, L5: 0.20, L6: 0.25 },
};

// ADAPT-16 competency code → domain key
const COMPETENCY_DOMAIN: Record<string, string> = {
  'A-01': 'A', 'A-02': 'A', 'A-03': 'A', 'A-04': 'A',
  'D-01': 'D', 'D-02': 'D', 'D-03': 'D',
  'AL-01': 'AL', 'AL-02': 'AL', 'AL-03': 'AL',
  'P-01': 'P', 'P-02': 'P', 'P-03': 'P',
  'T-01': 'T', 'T-02': 'T', 'T-03': 'T',
};

// Question type string → layer key
const QTYPE_TO_LAYER: Record<string, string> = {
  'MULTIPLE_CHOICE': 'L1', 'TRUE_FALSE': 'L1', 'RATING': 'L1', 'LIKERT': 'L1',
  'SCENARIO_BASED': 'L2', 'SJT': 'L2',
  'PSYCHOMETRIC': 'L3',
  'PANEL_360': 'L4',
  'ESSAY': 'L5', 'VIDEO_RESPONSE': 'L5', 'VOICE_RESPONSE': 'L5',
  'FILE_UPLOAD': 'L6', 'SIMULATION': 'L6',
};

type ScoresByLayer = Record<string, number[]>;

type LayerSnapshot = Record<string, number | null>;

export async function computeAndStoreCompetencyScores(
  memberAssessmentId: string,
  assessmentType: string = 'RBCA',
  cohortType: string = 'PROFESSIONAL'
): Promise<{ stored: number; skipped: number }> {
  try {
    // 1. Get all UserAssessmentComponent IDs for this session.
    //    MemberAssessment links to UserAssessmentModel via member+model;
    //    UserAssessmentComponent links to UserAssessmentModel via userAssessmentModelId.
    //    We join through the memberAssessmentId → userAssessmentModel chain.
    const components = await prisma.userAssessmentComponent.findMany({
      where: { userAssessmentModelId: memberAssessmentId },
      select: { id: true },
    });

    if (!components.length) {
      console.warn(
        `[CompetencyScore] No components found for session ${memberAssessmentId}`
      );
      return { stored: 0, skipped: 0 };
    }

    const componentIds = components.map((c) => c.id);

    // 2. Fetch all question responses for those components, including the
    //    question's type and the component's competencyId.
    //    Note: pointsAwardded is the schema spelling (preserved exactly).
    const responses = await prisma.componentQuestionResponse.findMany({
      where: { userComponentId: { in: componentIds } },
      include: {
        question: {
          select: {
            questionType: true,
            component: {
              select: { competencyId: true },
            },
          },
        },
      },
    });

    if (!responses.length) return { stored: 0, skipped: 0 };

    // 3. Group scores by competencyId → layer
    const grouped: Record<string, ScoresByLayer> = {};

    for (const resp of responses) {
      const competencyId = resp.question?.component?.competencyId;
      if (!competencyId) continue;

      // Use aiScore first, fall back to pointsAwardded (schema typo preserved)
      const score: number =
        resp.aiScore ?? (resp.pointsAwardded as number | null) ?? 0;

      const qtypeStr = resp.question?.questionType
        ? String(resp.question.questionType)
        : '';
      const layer = QTYPE_TO_LAYER[qtypeStr] ?? 'L1';

      if (!grouped[competencyId]) grouped[competencyId] = {};
      if (!grouped[competencyId][layer]) grouped[competencyId][layer] = [];
      grouped[competencyId][layer].push(score);
    }

    // 3.5 Detect response bias in self-report data and compute w1 correction.
    const selfReportItems = responses
      .filter((r) => QTYPE_TO_LAYER[String(r.question?.questionType ?? '')] === 'L1')
      .map((r) => ({
        value: Number(r.aiScore ?? (r.pointsAwardded as number | null) ?? 0),
        itemValence: 'POSITIVE' as const,
      }));

    const l1Scores: Record<string, number> = {};
    const l2Scores: Record<string, number> = {};
    for (const [competencyId, layerData] of Object.entries(grouped)) {
      const competencyRecord = await prisma.competency
        .findUnique({
          where: { id: competencyId },
          select: { name: true },
        })
        .catch(() => null);

      const competencyCode = competencyRecord?.name ?? competencyId;
      const l1 = layerData.L1 ?? [];
      const l2 = layerData.L2 ?? [];
      if (l1.length) {
        l1Scores[competencyCode] = l1.reduce((a, b) => a + b, 0) / l1.length;
      }
      if (l2.length) {
        l2Scores[competencyCode] = l2.reduce((a, b) => a + b, 0) / l2.length;
      }
    }

    const biasResult = await detectAndStoreBias(
      memberAssessmentId,
      selfReportItems,
      l2Scores,
      l1Scores
    );
    const w1Multiplier = biasResult.recommendedW1Multiplier;

    // 4. Compute and upsert CompetencyScore per competency
    let stored = 0;
    let skipped = 0;

    for (const [competencyId, layerData] of Object.entries(grouped)) {
      // Resolve the human-readable competency name to use as the code
      const competencyRecord = await prisma.competency
        .findUnique({
          where: { id: competencyId },
          select: { name: true },
        })
        .catch(() => null);

      const competencyCode: string = competencyRecord?.name ?? competencyId;
      const domain = COMPETENCY_DOMAIN[competencyCode];
      const weights = domain ? DOMAIN_WEIGHTS[domain] : null;

      // Build per-layer average snapshot
      const layerSnapshot: LayerSnapshot = {
        L1: null, L2: null, L3: null, L4: null, L5: null, L6: null,
      };

      let composite = 0;
      let totalWeight = 0;

      for (const [layer, scores] of Object.entries(layerData)) {
        if (!scores.length) continue;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        layerSnapshot[layer] = Math.round(avg * 100) / 100;
        const baseWeight = weights?.[layer] ?? 1 / 6;
        const w = layer === 'L1' ? baseWeight * w1Multiplier : baseWeight;
        composite += avg * w;
        totalWeight += w;
      }

      if (totalWeight === 0) {
        skipped++;
        continue;
      }

      // Normalise if not all layers contributed
      if (totalWeight < 1) composite = composite / totalWeight;

      const calibration = await calibrateScore(
        composite,
        competencyCode,
        cohortType,
        assessmentType
      );

      await prisma.competencyScore.upsert({
        where: {
          memberAssessmentId_competencyCode_assessmentType: {
            memberAssessmentId,
            competencyCode,
            assessmentType,
          },
        },
        update: {
          layerScores: layerSnapshot as object,
          compositeRawScore: Math.round(composite * 100) / 100,
          proficiencyLevel: calibration.proficiencyLevel,
          normalisedScore: calibration.normalisedScore,
          percentileRank: calibration.percentileRank,
          updatedAt: new Date(),
        },
        create: {
          memberAssessmentId,
          competencyCode,
          competencyId,
          assessmentType,
          layerScores: layerSnapshot as object,
          compositeRawScore: Math.round(composite * 100) / 100,
          proficiencyLevel: calibration.proficiencyLevel,
          normalisedScore: calibration.normalisedScore,
          percentileRank: calibration.percentileRank,
          cohortType,
        },
      });

      stored++;
    }

    console.log(
      `[CompetencyScore] ${stored} stored, ${skipped} skipped for session ${memberAssessmentId}`
    );
    return { stored, skipped };
  } catch (err) {
    console.error('[CompetencyScore] Compute failed:', err);
    return { stored: 0, skipped: 0 };
  }
}
