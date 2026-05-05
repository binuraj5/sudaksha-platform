/**
 * NormativeProfile seed — placeholder calibration data
 * SEPL/INT/2026/IMPL-GAPS-01 Step G2
 *
 * These are PLACEHOLDER values (isCalibrated: false).
 * Replace with real values after collecting 200+ pilot assessments per cohort.
 * Run manually: npx ts-node apps/portal/prisma/seeds/normative-profiles.ts
 */

import { PrismaClient } from '../../generated/client';
const prisma = new PrismaClient();

const ADAPT16_CODES = [
  'A-01','A-02','A-03','A-04',
  'D-01','D-02','D-03',
  'AL-01','AL-02','AL-03',
  'P-01','P-02','P-03',
  'T-01','T-02','T-03',
];
const COHORT_TYPES = ['STUDENT', 'PROFESSIONAL', 'CORPORATE'];

// Placeholder normal distribution parameters per cohort
// Students score lower on average than professionals, corporates higher
const COHORT_DEFAULTS: Record<string, { mean: number; std: number }> = {
  STUDENT:      { mean: 45.0, std: 14.0 },
  PROFESSIONAL: { mean: 55.0, std: 15.0 },
  CORPORATE:    { mean: 60.0, std: 14.0 },
};

async function seed() {
  let created = 0;
  for (const code of ADAPT16_CODES) {
    for (const cohort of COHORT_TYPES) {
      const { mean, std } = COHORT_DEFAULTS[cohort];
      await prisma.normativeProfile.upsert({
        where: { competencyCode_cohortType_assessmentType: {
          competencyCode: code, cohortType: cohort, assessmentType: 'ADAPT_16'
        }},
        update: {},
        create: {
          competencyCode: code, cohortType: cohort, assessmentType: 'ADAPT_16',
          sampleSize: 0, meanScore: mean, stdDeviation: std,
          p30Threshold: mean - 0.52 * std,
          p60Threshold: mean + 0.25 * std,
          p85Threshold: mean + 1.04 * std,
          isCalibrated: false,
        },
      });
      created++;
    }
  }
  console.log(`Seeded ${created} ADAPT-16 normative profile placeholders`);

  // ── TDAS NORMATIVE PROFILES ───────────────────────────────────────────────
  // TDAS sessions tend to score lower (10-minute quiz context)
  // Adjust mean down by ~5 points from ADAPT-16 defaults
  let tdasCreated = 0;
  for (const code of ADAPT16_CODES) {
    for (const cohort of COHORT_TYPES) {
      const { mean: adaptMean, std } = COHORT_DEFAULTS[cohort];
      const mean = adaptMean - 5.0; // TDAS specific adjustment
      
      await prisma.normativeProfile.upsert({
        where: { competencyCode_cohortType_assessmentType: {
          competencyCode: code, cohortType: cohort, assessmentType: 'TDAS'
        }},
        update: {},
        create: {
          competencyCode: code, cohortType: cohort, assessmentType: 'TDAS',
          sampleSize: 0, meanScore: mean, stdDeviation: std,
          p30Threshold: mean - 0.52 * std,
          p60Threshold: mean + 0.25 * std,
          p85Threshold: mean + 1.04 * std,
          isCalibrated: false,
        },
      });
      tdasCreated++;
    }
  }
  console.log(`Seeded ${tdasCreated} TDAS normative profile placeholders`);
  await prisma.$disconnect();
}

seed();
