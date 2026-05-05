/**
 * Score Calibration Utility
 * SEPL/INT/2026/IMPL-GAPS-01 Step G3
 * Converts raw composite score to proficiency level using normative profile.
 */
import { prisma } from '@/lib/prisma';

export interface CalibrationResult {
  proficiencyLevel: 1 | 2 | 3 | 4;
  normalisedScore: number;      // 0–100 normalised
  percentileRank: number;       // 0–100 percentile within cohort
  calibrationSource: 'NORMATIVE' | 'FALLBACK';
}

export async function calibrateScore(
  rawScore: number,
  competencyCode: string,
  cohortType: string,
  assessmentType: string = 'ADAPT_16'
): Promise<CalibrationResult> {
  // Fetch normative profile for this competency + cohort
  const profile = await prisma.normativeProfile.findUnique({
    where: {
      competencyCode_cohortType_assessmentType: {
        competencyCode,
        cohortType,
        assessmentType,
      },
    },
  }).catch(() => null);

  if (!profile) {
    // Fallback: use hardcoded thresholds if no normative data
    return {
      proficiencyLevel: rawScore >= 85 ? 4 : rawScore >= 65 ? 3 : rawScore >= 40 ? 2 : 1,
      normalisedScore: rawScore,
      percentileRank: rawScore,
      calibrationSource: 'FALLBACK',
    };
  }

  // Z-transform: z = (rawScore - mean) / stdDev
  const z = (rawScore - profile.meanScore) / Math.max(profile.stdDeviation, 1);

  // Convert z-score to percentile rank (approximation using error function)
  const percentileRank = Math.round((0.5 * (1 + erf(z / Math.sqrt(2)))) * 100);

  // Normalise to 0–100 scale
  const normalisedScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((rawScore - profile.p30Threshold) /
          Math.max(profile.p85Threshold - profile.p30Threshold, 1)) *
          70 +
          15
      )
    )
  );

  // Map to proficiency level using normative band thresholds
  const proficiencyLevel: 1 | 2 | 3 | 4 =
    rawScore >= profile.p85Threshold ? 4 :
    rawScore >= profile.p60Threshold ? 3 :
    rawScore >= profile.p30Threshold ? 2 : 1;

  return {
    proficiencyLevel,
    normalisedScore,
    percentileRank,
    calibrationSource: 'NORMATIVE',
  };
}

// Error function approximation (Abramowitz & Stegun)
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}
