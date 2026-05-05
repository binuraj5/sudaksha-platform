/**
 * SCIP instrument seed — creates the AssessmentModel structure
 * SEPL/INT/2026/IMPL-STEPS-01 Step 22
 * Run manually: npx ts-node prisma/seeds/scip-instrument.ts
 * Does NOT auto-run — Binu must review before executing
 */

export const SCIP_INSTRUMENT_CONFIG = {
  name: 'SCIP™ — Sudaksha Career Intelligence Profile',
  slug: 'scip-full',
  sourceType: 'SCIP',
  description: 'Composite psychometric assessment: Cognitive + OCEAN + RIASEC + EI + Values',
  estimatedMinutes: 40,
  components: [
    {
      name: 'Cognitive Ability',
      code: 'SCIP-COG',
      description: 'Abstract, numerical, and verbal reasoning (IRT-adaptive)',
      itemCount: 25,
      layer: 'ADAPTIVE',
      durationMinutes: 10,
    },
    {
      name: 'Personality — OCEAN',
      code: 'SCIP-OCEAN',
      description: 'Big Five personality (IPIP public domain)',
      itemCount: 50,
      layer: 'SELF_REPORT',
      durationMinutes: 10,
    },
    {
      name: 'Career Interests — RIASEC',
      code: 'SCIP-RIASEC',
      description: 'Holland career interest codes (forced-choice pairs)',
      itemCount: 36,
      layer: 'FORCED_CHOICE',
      durationMinutes: 8,
    },
    {
      name: 'Emotional Intelligence',
      code: 'SCIP-EI',
      description: 'Goleman four-domain EI (SJT format, Sudaksha-developed)',
      itemCount: 24,
      layer: 'SJT',
      durationMinutes: 7,
    },
    {
      name: 'Core Values',
      code: 'SCIP-VALUES',
      description: 'Schwartz Basic Values — Portrait Values Questionnaire',
      itemCount: 28,
      layer: 'SELF_REPORT',
      durationMinutes: 5,
    },
  ],
};
