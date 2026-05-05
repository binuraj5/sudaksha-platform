/**
 * Bias Detection Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G1
 * Patent claim C-03 — bias detection sub-module
 *
 * Three bias types per patent specification:
 * 1. Extreme Response Bias — majority of L1 responses at scale extremes (1 or 5)
 * 2. Acquiescence Bias — consistent agreement regardless of item valence
 * 3. Social Desirability Inflation — large positive gap between L1 and L2/L4 scores
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface BiasResult {
  hasBias: boolean;
  flags: Array<{
    flagType: 'EXTREME_RESPONSE' | 'ACQUIESCENCE' | 'SOCIAL_DESIRABILITY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    w1CorrectionFactor: number;
    details: Record<string, unknown>;
  }>;
  recommendedW1Multiplier: number; // 1.0 = no correction, 0.5 = halved
}

export async function detectAndStoreBias(
  memberAssessmentId: string,
  selfReportResponses: Array<{ value: number; itemValence: 'POSITIVE' | 'NEGATIVE' }>,
  l2Scores: Record<string, number>, // competencyCode → SJT score
  l1Scores: Record<string, number>  // competencyCode → self-report score
): Promise<BiasResult> {
  const flags: BiasResult['flags'] = [];

  // ── BIAS TYPE 1: Extreme Response Bias ──────────────────────────────────
  // Triggered when > 60% of self-report responses are at scale extremes (1 or 5)
  const extremeCount = selfReportResponses.filter(r =>
    r.value === 1 || r.value === 5
  ).length;
  const extremeRatio = extremeCount / Math.max(selfReportResponses.length, 1);

  if (extremeRatio > 0.6) {
    const severity = extremeRatio > 0.8 ? 'HIGH' : extremeRatio > 0.7 ? 'MEDIUM' : 'LOW';
    flags.push({
      flagType: 'EXTREME_RESPONSE',
      severity,
      w1CorrectionFactor: severity === 'HIGH' ? 0.4 : severity === 'MEDIUM' ? 0.6 : 0.8,
      details: { extremeRatio: Math.round(extremeRatio * 100) / 100, extremeCount, total: selfReportResponses.length }
    });
  }

  // ── BIAS TYPE 2: Acquiescence Bias ──────────────────────────────────────
  // Triggered when > 70% of responses agree (4 or 5) regardless of item valence
  // On reversed/negative items, agreeing (high score) is inconsistent
  const negativeItems = selfReportResponses.filter(r => r.itemValence === 'NEGATIVE');
  if (negativeItems.length >= 5) {
    const negativeAgreement = negativeItems.filter(r => r.value >= 4).length / negativeItems.length;
    if (negativeAgreement > 0.7) {
      const severity = negativeAgreement > 0.85 ? 'HIGH' : negativeAgreement > 0.75 ? 'MEDIUM' : 'LOW';
      flags.push({
        flagType: 'ACQUIESCENCE',
        severity,
        w1CorrectionFactor: severity === 'HIGH' ? 0.3 : severity === 'MEDIUM' ? 0.5 : 0.7,
        details: { negativeAgreementRatio: Math.round(negativeAgreement * 100) / 100, negativeItemCount: negativeItems.length }
      });
    }
  }

  // ── BIAS TYPE 3: Social Desirability Inflation ──────────────────────────
  // Triggered when L1 scores are consistently > 20 points above L2 scores
  // across 5+ competencies — suggests respondent portrays idealized self
  const competenciesWithBoth = Object.keys(l1Scores).filter(k => l2Scores[k] !== undefined);
  if (competenciesWithBoth.length >= 5) {
    const inflationScores = competenciesWithBoth.map(k => l1Scores[k] - l2Scores[k]);
    const avgInflation = inflationScores.reduce((a, b) => a + b, 0) / inflationScores.length;
    if (avgInflation > 20) {
      const severity = avgInflation > 35 ? 'HIGH' : avgInflation > 25 ? 'MEDIUM' : 'LOW';
      flags.push({
        flagType: 'SOCIAL_DESIRABILITY',
        severity,
        w1CorrectionFactor: severity === 'HIGH' ? 0.35 : severity === 'MEDIUM' ? 0.55 : 0.75,
        details: { avgInflation: Math.round(avgInflation * 100) / 100, competenciesChecked: competenciesWithBoth.length }
      });
    }
  }

  // ── COMPUTE FINAL w1 MULTIPLIER ─────────────────────────────────────────
  // Use the most severe correction factor found (lowest multiplier wins)
  const recommendedW1Multiplier = flags.length > 0
    ? Math.min(...flags.map(f => f.w1CorrectionFactor))
    : 1.0;

  // ── PERSIST BiasFlag RECORDS ────────────────────────────────────────────
  if (flags.length > 0) {
    await prisma.biasFlag.createMany({
      data: flags.map(f => ({
        memberAssessmentId,
        flagType: f.flagType,
        severity: f.severity,
        affectedLayer: 'L1',
        correctionApplied: true,
        w1CorrectionFactor: f.w1CorrectionFactor,
        details: f.details as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });
  }

  return { hasBias: flags.length > 0, flags, recommendedW1Multiplier };
}
