# SUDAKSHA PLATFORM — PHASE 2 GAP-CLOSURE IMPLEMENTATION PROMPTS
## Reference: SEPL/INT/2026/IMPL-GAPS-01
## Prerequisite: SEPL/INT/2026/IMPL-STEPS-01 (all 25 steps complete ✅)
## For: VS Code Claude Code Agent (CLI)
## Date: April 2026 | STRICTLY CONFIDENTIAL

---

## HOW TO USE THIS DOCUMENT

Same rules as Phase 1. Each STEP is a standalone, self-contained prompt.
Copy only the content between `---BEGIN STEP Gn---` and `---END STEP Gn---`.
Complete acceptance tests before proceeding to the next step.
Type `STOP — stay in scope` if the agent drifts.

## WHAT THIS SERIES COVERS

These are the patent-claim gaps confirmed absent from the Phase 1 build.
Every item here is either a named patent claim or a production-critical
dependency. Priority order follows patent importance, not build complexity.

| Step | Title | Patent Claim | Risk |
|---|---|---|---|
| G1 | BiasFlag model + bias detection logic | C-03 named claim | Low |
| G2 | Normative calibration — NormativeProfile model | C-03 named claim | Low |
| G3 | Normative calibration — z-transform + percentile engine | C-03 named claim | Medium |
| G4 | AssessmentDelta — baseline flagging + delta computation | C-04 | Medium |
| G5 | AssessmentDelta — before/after report panel | C-04 UI | Low |
| G6 | CareerFitScore — weighted inverse-distance algorithm | C-07 | Medium |
| G7 | Workforce Readiness Index — computation + UI | C-10 | Medium |
| G8 | Individual report — radar chart (16-axis) | C-06 T1 | Low |
| G9 | Corporate cohort report template | C-06 T2 | Medium |
| G10 | Institutional report template | C-06 T3 | Medium |
| G11 | Executive / CHRO report template | C-06 T4 | Medium |
| G12 | Anti-cheat — response-time anomaly detection | C-09 claim | Low |
| G13 | Anti-cheat — per-cohort SJT item pools | C-09 claim | Medium |
| G14 | Anti-cheat — retake lockout enforcement | C-09 claim | Low |
| G15 | Anti-cheat — browser lockdown mode | C-09 claim | Medium |
| G16 | LMS — Activity module delivery scaffolding | C-04, C-05 | High |
| G17 | LMS — competency-tagged module completion + micro-assessment trigger | C-04, C-06 | High |
| G18 | SCIP — full question bank seed (all 5 dimensions) | C-01 equiv | Medium |
| G19 | Redis caching layer confirmation + implementation | C-09 infra | Medium |
| G20 | S3 object storage — report PDF persistence | C-09 infra | Medium |

---

---BEGIN STEP G1---

# STEP G1 — BiasFlag MODEL + BIAS DETECTION LOGIC

## Agent operating mode: NEW MODEL + NEW SERVICE FILE. Additive only.

## Purpose
The patent (C-03) explicitly claims a bias detection sub-module that identifies
extreme response bias, acquiescence bias, and social desirability inflation,
downweights the self-report layer (w1), and sets a reliability flag in the output
report. This is a named patent claim with zero current implementation.

## Pre-conditions
- All Phase 1 steps complete
- `CompetencyScore` table exists and is being populated
- Run: `grep -n "BiasFlag\|biasFlag" packages/db-assessments/prisma/schema.prisma`
  Confirm no BiasFlag model exists before proceeding

## Instructions

### G1.1 — Add BiasFlag model to BOTH schemas
Append to END of `packages/db-assessments/prisma/schema.prisma`:

```prisma
// BiasFlag — SEPL/INT/2026/IMPL-GAPS-01 Step G1
// Patent claim C-03: bias detection sub-module
model BiasFlag {
  id                 String           @id @default(cuid())
  memberAssessmentId String
  memberAssessment   MemberAssessment @relation(fields: [memberAssessmentId], references: [id], onDelete: Cascade)
  flagType           String           // EXTREME_RESPONSE | ACQUIESCENCE | SOCIAL_DESIRABILITY
  severity           String           // LOW | MEDIUM | HIGH
  affectedLayer      String           // L1 (self-report is always the affected layer)
  correctionApplied  Boolean          @default(false)
  w1CorrectionFactor Float?           // the downweight applied to w1 (e.g. 0.5 = halved)
  detectedAt         DateTime         @default(now())
  details            Json             @default("{}")

  @@index([memberAssessmentId])
  @@index([flagType])
}
```

Add back-reference to `MemberAssessment`:
```prisma
  biasFlags   BiasFlag[]
```

Mirror identical addition to `packages/db-core/prisma/schema.prisma`.

Run `npx prisma validate` on both. Then migrate:
```bash
cd packages/db-assessments && npx prisma migrate dev --name "add_bias_flag"
cd packages/db-core && npx prisma migrate dev --name "add_bias_flag"
npx prisma generate  # run in both packages
```

### G1.2 — Create bias detection service
Create `apps/portal/lib/scoring/detectBias.ts`:

```typescript
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
        details: f.details,
      })),
      skipDuplicates: true,
    });
  }

  return { hasBias: flags.length > 0, flags, recommendedW1Multiplier };
}
```

### G1.3 — Wire bias detection into scoring service
In `apps/portal/lib/scoring/computeCompetencyScores.ts`, AFTER collecting
self-report responses but BEFORE computing composite scores, add:

```typescript
import { detectAndStoreBias } from './detectBias';

// After grouping responses by layer, add:
const selfReportItems = responses
  .filter(r => QTYPE_TO_LAYER[r.question?.questionType ?? ''] === 'L1')
  .map(r => ({
    value: r.pointsAwarded ?? 0,
    itemValence: (r.question as any)?.itemValence ?? 'POSITIVE'
  }));

const l1Scores: Record<string, number> = {};
const l2Scores: Record<string, number> = {};
// populate from grouped scores before running bias check...

const biasResult = await detectAndStoreBias(
  memberAssessmentId,
  selfReportItems,
  l2Scores,
  l1Scores
);

// Apply w1 correction to all subsequent composite calculations:
const w1Multiplier = biasResult.recommendedW1Multiplier;
// Multiply w1 by w1Multiplier when computing composite score
```

### G1.4 — Validate and TypeScript check
```bash
cd packages/db-assessments && npx prisma validate 2>&1
cd apps/portal && npx tsc --noEmit 2>&1 | grep -i "bias\|detectBias" | head -10
```

## Output format required
```
STEP G1 COMPLETE
BiasFlag model added: db-assessments [YES/NO] db-core [YES/NO]
Migration applied: [YES/NO]
detectBias.ts created: [YES/NO]
Wired into computeCompetencyScores: [YES/NO]
TypeScript errors: [NONE / list]
Existing scoring pipeline affected: [NO — or describe]
```

## Acceptance Tests
- [ ] `BiasFlag` table exists in database
- [ ] `detectAndStoreBias` function compiles without errors
- [ ] Completing a test assessment with all-5 responses creates a BiasFlag record
- [ ] `w1CorrectionFactor` stored correctly in BiasFlag record
- [ ] Existing RBCA assessments unaffected (no regression)

---END STEP G1---


---BEGIN STEP G2---

# STEP G2 — NormativeProfile MODEL + SEED STRUCTURE

## Agent operating mode: NEW MODEL + SEED FILE. Additive only.

## Purpose
The patent (C-03) claims proficiency calibration against cohort-specific normative
bands using z-transform. This requires a `NormativeProfile` table storing reference
population statistics per competency per cohort type. This step creates the model
and seeds initial placeholder data. Real calibration values come after pilot data
is collected (minimum 200 assessments per cohort type).

## Pre-conditions
- Step G1 complete
- `NormativeProfile` does not exist: `grep -n "NormativeProfile" packages/db-assessments/prisma/schema.prisma`

## Instructions

### G2.1 — Add NormativeProfile model to both schemas
```prisma
// NormativeProfile — SEPL/INT/2026/IMPL-GAPS-01 Step G2
// Patent claim C-03 — normative calibration against cohort-specific bands
model NormativeProfile {
  id              String   @id @default(cuid())
  competencyCode  String
  cohortType      String   // STUDENT | PROFESSIONAL | CORPORATE
  assessmentType  String   @default("ADAPT_16")
  sampleSize      Int      @default(0)
  meanScore       Float    @default(50.0)
  stdDeviation    Float    @default(15.0)
  // Percentile band thresholds (raw score cutoffs)
  p30Threshold    Float    @default(40.0)  // Below = Emerging (L1)
  p60Threshold    Float    @default(55.0)  // Below = Developing (L2)
  p85Threshold    Float    @default(72.0)  // Below = Proficient (L3), above = Advanced (L4)
  lastUpdated     DateTime @default(now())
  isCalibrated    Boolean  @default(false) // false = placeholder, true = real pilot data

  @@unique([competencyCode, cohortType, assessmentType])
  @@index([competencyCode])
  @@index([cohortType])
}
```

Add to both schemas. Migrate:
```bash
cd packages/db-assessments && npx prisma migrate dev --name "add_normative_profile"
cd packages/db-core && npx prisma migrate dev --name "add_normative_profile"
```

### G2.2 — Create seed file
Create `apps/portal/prisma/seeds/normative-profiles.ts`:

```typescript
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
  console.log(`Seeded ${created} normative profile placeholders`);
  await prisma.$disconnect();
}

seed();
```

**Do NOT run the seed yet.** Create the file only. Binu will run it manually after review.

### G2.3 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "normative\|NormativeProfile" | head -10
```

## Acceptance Tests
- [ ] `NormativeProfile` table exists in both databases
- [ ] Seed file created but not yet run
- [ ] `grep -c "NormativeProfile" packages/db-assessments/prisma/schema.prisma` > 2
- [ ] No existing code modified

---END STEP G2---


---BEGIN STEP G3---

# STEP G3 — Z-TRANSFORM + PERCENTILE CALIBRATION ENGINE

## Agent operating mode: MODIFY ONE EXISTING SERVICE FILE.

## Purpose
Wire the `NormativeProfile` table into the existing `computeCompetencyScores.ts`
service so that raw composite scores are z-transformed and mapped to the correct
proficiency level (L1–L4) using the normative bands, replacing the current
hardcoded thresholds.

## Pre-conditions
- Steps G1 and G2 complete, NormativeProfile table exists

## Instructions

### G3.1 — Read the current scoring service
```bash
cat apps/portal/lib/scoring/computeCompetencyScores.ts
```
Note the current proficiency mapping logic (hardcoded thresholds at 85/65/40).

### G3.2 — Create calibration utility
Create `apps/portal/lib/scoring/calibrateScore.ts`:

```typescript
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
    where: { competencyCode_cohortType_assessmentType: {
      competencyCode, cohortType, assessmentType
    }},
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
  const percentileRank = Math.round(
    (0.5 * (1 + erf(z / Math.sqrt(2)))) * 100
  );

  // Normalise to 0–100 scale
  const normalisedScore = Math.min(100, Math.max(0, Math.round(
    ((rawScore - profile.p30Threshold) /
    (profile.p85Threshold - profile.p30Threshold)) * 70 + 15
  )));

  // Map to proficiency level using normative band thresholds
  const proficiencyLevel: 1 | 2 | 3 | 4 =
    rawScore >= profile.p85Threshold ? 4 :
    rawScore >= profile.p60Threshold ? 3 :
    rawScore >= profile.p30Threshold ? 2 : 1;

  return { proficiencyLevel, normalisedScore, percentileRank, calibrationSource: 'NORMATIVE' };
}

// Error function approximation (Abramowitz & Stegun)
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}
```

### G3.3 — Update computeCompetencyScores.ts
In `apps/portal/lib/scoring/computeCompetencyScores.ts`:

1. Add import: `import { calibrateScore } from './calibrateScore';`
2. Replace the hardcoded proficiency mapping block with:
```typescript
const calibration = await calibrateScore(
  composite,
  competencyCode,
  cohortType,
  assessmentType
);
```
3. Use `calibration.proficiencyLevel`, `calibration.normalisedScore`,
   `calibration.percentileRank` when upserting the `CompetencyScore` record.

### G3.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "calibrate\|Calibrat" | head -10
```

## Acceptance Tests
- [ ] `calibrateScore` returns FALLBACK source when no NormativeProfile exists
- [ ] After running the seed (G2), returns NORMATIVE source
- [ ] Proficiency levels no longer use hardcoded 85/65/40 thresholds
- [ ] Existing CompetencyScore records still created correctly (no regression)

---END STEP G3---


---BEGIN STEP G4---

# STEP G4 — AssessmentDelta BASELINE FLAGGING + DELTA COMPUTATION

## Agent operating mode: MODIFY EXISTING COMPLETION ROUTE + NEW SERVICE.

## Purpose
The `AssessmentDelta` model exists from Phase 1 (Step 5) but is never populated.
This step implements: (a) flagging the first assessment as baseline, and
(b) computing and storing the delta when a second assessment completes.

## Pre-conditions
- Phase 1 Step 5 complete — `AssessmentDelta` table exists
- `MemberAssessment.isBaseline` field exists

## Instructions

### G4.1 — Read current completion route
```bash
find apps/portal/app/api/assessments/runner -name "*.ts" | xargs grep -l "COMPLETED" | head -3
cat [completion route file]
```

### G4.2 — Create delta computation service
Create `apps/portal/lib/scoring/computeAssessmentDelta.ts`:

```typescript
/**
 * AssessmentDelta Computation Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G4
 * Patent claim C-04 — closed-loop pre/post competency delta
 */
import { prisma } from '@/lib/prisma';

export async function computeAndStoreDelta(
  memberId: string,
  followupAssessmentId: string,
  assessmentType: string = 'RBCA'
): Promise<void> {
  // Find the most recent COMPLETED baseline assessment for this member
  const baseline = await prisma.memberAssessment.findFirst({
    where: {
      member: { id: memberId },
      isBaseline: true,
      status: 'COMPLETED',
      id: { not: followupAssessmentId },
    },
    orderBy: { completedAt: 'desc' },
  });

  if (!baseline) return; // No baseline exists yet — this becomes the baseline

  // Fetch competency scores for both sessions
  const [baselineScores, followupScores] = await Promise.all([
    prisma.competencyScore.findMany({
      where: { memberAssessmentId: baseline.id, assessmentType },
      select: { competencyCode: true, proficiencyLevel: true, compositeRawScore: true },
    }),
    prisma.competencyScore.findMany({
      where: { memberAssessmentId: followupAssessmentId, assessmentType },
      select: { competencyCode: true, proficiencyLevel: true, compositeRawScore: true },
    }),
  ]);

  if (!baselineScores.length || !followupScores.length) return;

  // Compute delta per competency
  const deltaScores: Record<string, number> = {};
  const followupMap = Object.fromEntries(followupScores.map(s => [s.competencyCode, s]));

  let totalDelta = 0;
  let count = 0;

  for (const base of baselineScores) {
    const followup = followupMap[base.competencyCode];
    if (!followup) continue;
    const delta = followup.proficiencyLevel - base.proficiencyLevel;
    deltaScores[base.competencyCode] = delta;
    totalDelta += delta;
    count++;
  }

  const overallDelta = count > 0 ? Math.round((totalDelta / count) * 100) / 100 : 0;

  await prisma.assessmentDelta.upsert({
    where: {
      // Unique constraint on baseline + followup pair
      id: `${baseline.id}_${followupAssessmentId}`,
    },
    update: { deltaScores, overallDelta, calculatedAt: new Date() },
    create: {
      memberId,
      baselineAssessmentId: baseline.id,
      followupAssessmentId,
      deltaScores,
      overallDelta,
      assessmentType,
    },
  }).catch(async () => {
    // Upsert by composite key if ID-based fails
    await prisma.assessmentDelta.create({
      data: { memberId, baselineAssessmentId: baseline.id, followupAssessmentId, deltaScores, overallDelta, assessmentType },
    }).catch(() => {}); // Silently skip if already exists
  });
}

export async function flagAsBaseline(memberAssessmentId: string): Promise<void> {
  await prisma.memberAssessment.update({
    where: { id: memberAssessmentId },
    data: { isBaseline: true },
  });
}
```

### G4.3 — Wire into completion route
In the completion route, AFTER `computeAndStoreCompetencyScores` is called:

```typescript
import { computeAndStoreDelta, flagAsBaseline } from '@/lib/scoring/computeAssessmentDelta';

// Check if this member has any prior completed assessment
const priorCompleted = await prisma.memberAssessment.count({
  where: {
    member: { id: memberId },
    status: 'COMPLETED',
    id: { not: memberAssessmentId },
  },
});

if (priorCompleted === 0) {
  // First completion — flag as baseline
  flagAsBaseline(memberAssessmentId).catch(() => {});
} else {
  // Subsequent completion — compute delta against baseline
  computeAndStoreDelta(memberId, memberAssessmentId, assessmentType)
    .catch(err => console.error('[AssessmentDelta] Delta compute failed:', err));
}
```

## Acceptance Tests
- [ ] First assessment completion sets `isBaseline = true`
- [ ] Second assessment completion creates an `AssessmentDelta` record
- [ ] `deltaScores` JSON contains per-competency level changes (e.g. `{"A-01": 1, "T-02": 0}`)
- [ ] No errors on first assessment (no prior baseline)

---END STEP G4---


---BEGIN STEP G5---

# STEP G5 — BEFORE/AFTER COMPARISON PANEL IN INDIVIDUAL REPORT

## Agent operating mode: NEW COMPONENT + ADDITIVE SECTION in individual dashboard.

## Purpose
Surface the `AssessmentDelta` data as a visual before/after comparison panel
in the individual dashboard. This is the "training ROI evidence" feature.

## Pre-conditions
- Step G4 complete, AssessmentDelta records being populated

## Instructions

### G5.1 — Create BeforeAfterPanel component
Create `apps/portal/components/Individual/BeforeAfterPanel.tsx`:

The component fetches the most recent `AssessmentDelta` for the member
from a new API endpoint and renders:
- A heading: "Your progress since [baseline date]"
- Per-competency rows showing: competency name, before level (dot), after level
  (dot), delta badge (+1 / 0 / -1) colour-coded green/grey/red
- An overall delta summary: "Average improvement: +0.8 levels across 12 competencies"
- Empty state: "Complete your second assessment to see your progress" with CTA

### G5.2 — Create supporting API route
Create `apps/portal/app/api/member/[memberId]/delta/route.ts`:
- `GET` — returns most recent `AssessmentDelta` with joined `CompetencyScore`
  data for both baseline and followup sessions
- Requires authenticated session, enforces memberId === session user

### G5.3 — Add to individual dashboard
Add as a section between Progress Timeline and AI Career Coach Chat.
Reuse the existing section heading pattern.

## Acceptance Tests
- [ ] Panel renders with empty state when no delta exists
- [ ] Panel shows competency-level changes when delta data exists
- [ ] Delta badges use correct colours (green = positive, grey = zero, red = negative)
- [ ] API returns 403 if memberId !== session user

---END STEP G5---


---BEGIN STEP G6---

# STEP G6 — CareerFitScore WEIGHTED INVERSE-DISTANCE ALGORITHM

## Agent operating mode: NEW SERVICE FILE + WIRE INTO COMPLETION ROUTE.

## Purpose
The `CareerFitScore` model exists but the computation is currently a placeholder.
This step implements the patent-specified weighted inverse-distance algorithm
that ranks all roles by fit against the member's multi-instrument profile.

## Pre-conditions
- Phase 1 Steps 5 and 7 complete
- `CareerFitScore` table exists, `Role` + `RoleCompetency` tables populated

## Instructions

### G6.1 — Create career fit algorithm service
Create `apps/portal/lib/scoring/computeCareerFitScores.ts`:

```typescript
/**
 * CareerFitScore Computation Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G6
 * Patent claim C-07 — career-competency mapping engine
 * Algorithm: weighted inverse-distance between member profile and role archetype
 */
import { prisma } from '@/lib/prisma';

export async function computeCareerFitScores(memberId: string): Promise<void> {
  // 1. Get member's latest CompetencyScore records (all instrument types)
  const latestAssessment = await prisma.memberAssessment.findFirst({
    where: { member: { id: memberId }, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });
  if (!latestAssessment) return;

  const memberScores = await prisma.competencyScore.findMany({
    where: { memberAssessmentId: latestAssessment.id },
    select: { competencyCode: true, proficiencyLevel: true, assessmentType: true },
  });
  if (!memberScores.length) return;

  // Map: competencyCode → proficiencyLevel (1–4)
  const profileMap = Object.fromEntries(
    memberScores.map(s => [s.competencyCode, s.proficiencyLevel])
  );

  // 2. Get all active roles with their competency requirements
  const roles = await prisma.role.findMany({
    where: { status: 'ACTIVE' },
    include: {
      competencies: {
        select: {
          competencyId: true,
          requiredLevel: true,
          weight: true,
          isCritical: true,
        },
      },
    },
    take: 100, // Cap at 100 roles per computation
  });

  // Level mapping: JUNIOR=1, MIDDLE=2, SENIOR=3, EXPERT=4
  const LEVEL_MAP: Record<string, number> = {
    JUNIOR: 1, MIDDLE: 2, SENIOR: 3, EXPERT: 4,
    EMERGING: 1, DEVELOPING: 2, PROFICIENT: 3, ADVANCED: 4,
  };

  // 3. Compute weighted inverse-distance fit score per role
  const fitScores = [];

  for (const role of roles) {
    if (!role.competencies.length) continue;

    const gapAnalysis: Record<string, { required: number; current: number; gap: number }> = {};
    let weightedDistanceSum = 0;
    let totalWeight = 0;
    let criticalGapFound = false;

    for (const rc of role.competencies) {
      const required = LEVEL_MAP[rc.requiredLevel] ?? 2;
      const current = profileMap[rc.competencyId] ?? 1;
      const gap = required - current;
      const weight = (rc.weight ?? 1.0) * (rc.isCritical ? 1.5 : 1.0);

      gapAnalysis[rc.competencyId] = { required, current, gap };

      // Inverse distance: larger gap = larger penalty
      // Critical competency gaps are penalised 1.5×
      const distance = Math.abs(gap) / 3; // normalise: max gap = 3 levels
      weightedDistanceSum += distance * weight;
      totalWeight += weight;

      if (rc.isCritical && gap > 1) criticalGapFound = true;
    }

    // Fit score: 100 = perfect match, decreases with distance
    const avgWeightedDistance = totalWeight > 0 ? weightedDistanceSum / totalWeight : 1;
    let fitScore = Math.max(0, Math.round((1 - avgWeightedDistance) * 100));

    // Apply critical gap penalty: if member is >1 level below a critical competency
    if (criticalGapFound) fitScore = Math.max(0, fitScore - 15);

    fitScores.push({ role, fitScore, gapAnalysis });
  }

  // 4. Sort by fit score and assign rank
  fitScores.sort((a, b) => b.fitScore - a.fitScore);

  // 5. Upsert CareerFitScore records
  for (let i = 0; i < fitScores.length; i++) {
    const { role, fitScore, gapAnalysis } = fitScores[i];
    await prisma.careerFitScore.upsert({
      where: {
        memberId_roleId_memberAssessmentId: {
          memberId, roleId: role.id, memberAssessmentId: latestAssessment.id,
        },
      },
      update: { fitScore, gapAnalysis, rank: i + 1, calculatedAt: new Date() },
      create: {
        memberId, roleId: role.id, memberAssessmentId: latestAssessment.id,
        fitScore, gapAnalysis, rank: i + 1,
        instrumentsUsed: [...new Set(memberScores.map(s => s.assessmentType))],
      },
    });
  }

  console.log(`[CareerFit] Computed ${fitScores.length} role fit scores for member ${memberId}`);
}
```

### G6.2 — Wire into completion route
After `computeAndStoreCompetencyScores` call in the completion route:
```typescript
import { computeCareerFitScores } from '@/lib/scoring/computeCareerFitScores';

computeCareerFitScores(memberId)
  .catch(err => console.error('[CareerFit] Compute failed:', err));
```

## Acceptance Tests
- [ ] `computeCareerFitScores` runs without error when Role table has data
- [ ] `CareerFitScore` records created with correct `rank` ordering
- [ ] Highest `fitScore` role has rank = 1
- [ ] Critical gap penalty applied correctly (verify manually)
- [ ] Individual dashboard career fit matches now show real ranked data

---END STEP G6---


---BEGIN STEP G7---

# STEP G7 — WORKFORCE READINESS INDEX — COMPUTATION + UI

## Agent operating mode: NEW SERVICE + NEW API ROUTE + UI ENHANCEMENT.

## Purpose
The Workforce Readiness Index (WRI) is a single composite 0–100 score per
organisation calibrated against industry benchmarks. It is the CEO/HR Head's
primary metric and a named patent claim in C-10.

## Pre-conditions
- Step G6 complete

## Instructions

### G7.1 — Create WRI computation service
Create `apps/portal/lib/analytics/computeWorkforceReadinessIndex.ts`:

```typescript
/**
 * Workforce Readiness Index (WRI) Computation
 * SEPL/INT/2026/IMPL-GAPS-01 Step G7
 * Patent claim C-10 — organisation-level readiness index
 *
 * Formula: WRI = weighted average of domain averages across all org members
 * Calibrated against industry benchmark (default: 70 for tech sector)
 */
import { prisma } from '@/lib/prisma';

const INDUSTRY_BENCHMARKS: Record<string, number> = {
  TECHNOLOGY: 70, FINANCE: 68, HEALTHCARE: 65,
  EDUCATION: 62, MANUFACTURING: 60, DEFAULT: 65,
};

export async function computeWRI(tenantId: string, sector: string = 'DEFAULT'): Promise<{
  wri: number;
  benchmark: number;
  gap: number;
  domainScores: Record<string, number>;
  memberCount: number;
}> {
  // Get all completed assessments for this tenant
  const scores = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: {
        member: { tenantId },
        status: 'COMPLETED',
      },
      assessmentType: 'ADAPT_16',
    },
    select: { competencyCode: true, proficiencyLevel: true },
  });

  if (!scores.length) {
    return { wri: 0, benchmark: INDUSTRY_BENCHMARKS[sector] ?? 65, gap: 0, domainScores: {}, memberCount: 0 };
  }

  // Group by domain
  const DOMAIN_MAP: Record<string, string> = {
    'A-01':'A','A-02':'A','A-03':'A','A-04':'A',
    'D-01':'D','D-02':'D','D-03':'D',
    'AL-01':'AL','AL-02':'AL','AL-03':'AL',
    'P-01':'P','P-02':'P','P-03':'P',
    'T-01':'T','T-02':'T','T-03':'T',
  };

  const domainSums: Record<string, number[]> = { A:[], D:[], AL:[], P:[], T:[] };
  for (const s of scores) {
    const domain = DOMAIN_MAP[s.competencyCode];
    if (domain) domainSums[domain].push(s.proficiencyLevel);
  }

  // Convert average proficiency (1–4) to 0–100 scale: (avg - 1) / 3 * 100
  const domainScores: Record<string, number> = {};
  for (const [domain, levels] of Object.entries(domainSums)) {
    if (!levels.length) continue;
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    domainScores[domain] = Math.round(((avg - 1) / 3) * 100);
  }

  const domainValues = Object.values(domainScores);
  const wri = domainValues.length
    ? Math.round(domainValues.reduce((a, b) => a + b, 0) / domainValues.length)
    : 0;

  const benchmark = INDUSTRY_BENCHMARKS[sector] ?? 65;
  const memberCount = new Set(scores.map(s => s.memberAssessmentId)).size;

  return { wri, benchmark, gap: wri - benchmark, domainScores, memberCount };
}
```

### G7.2 — Create API route
Create `apps/portal/app/api/clients/[clientId]/analytics/workforce-readiness/route.ts`:
- `GET` — calls `computeWRI(tenantId)` and returns result
- Authenticated, tenant-scoped

### G7.3 — Add WRI to CEO and HR Head dashboards
In both CEO and HR Head dashboard pages (Steps 17 from Phase 1):
- Replace the placeholder "Future-Readiness Index" metric with a live call
  to `/api/clients/[clientId]/analytics/workforce-readiness`
- Show: WRI score / benchmark / gap with trend direction indicator

## Acceptance Tests
- [ ] API returns WRI = 0 gracefully when no ADAPT-16 data exists
- [ ] WRI computation uses only `assessmentType: ADAPT_16` scores
- [ ] CEO dashboard shows live WRI number
- [ ] HR Head dashboard shows WRI + benchmark gap

---END STEP G7---


---BEGIN STEP G8---

# STEP G8 — INDIVIDUAL REPORT RADAR CHART (16-AXIS)

## Agent operating mode: NEW COMPONENT.

## Purpose
The patent (C-06) specifies an ADAPT-16 radar chart as a core element of the
Individual Learner Report. This is a named visual output. Currently the individual
dashboard shows bar charts or scores — the 16-axis spider diagram is absent.

## Pre-conditions
- Step G7 complete
- Check existing chart libraries: `grep -rn "recharts\|d3\|chart" apps/portal/package.json`

## Instructions

### G8.1 — Create ADAPT16RadarChart component
Create `apps/portal/components/Individual/ADAPT16RadarChart.tsx`:

Use `recharts` (already in the project per audit) `RadarChart` component.

```tsx
/**
 * ADAPT-16 Radar Chart — 16-axis competency profile visualisation
 * SEPL/INT/2026/IMPL-GAPS-01 Step G8
 * Patent claim C-06 T1 — individual learner report visual output
 */
'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CompetencyScore { code: string; name: string; level: number; }

interface Props {
  scores: CompetencyScore[];
  showLabels?: boolean;
}

const CODE_SHORT: Record<string, string> = {
  'A-01':'Learn Agility','A-02':'Cog Flexibility','A-03':'Resilience','A-04':'Ambiguity Tol.',
  'D-01':'AI Literacy','D-02':'Data Decisions','D-03':'Digital Fluency',
  'AL-01':'Collab Intel','AL-02':'Social/EI','AL-03':'Influence/Comm',
  'P-01':'Growth Mindset','P-02':'Metacognition','P-03':'Values Decisions',
  'T-01':'Critical Thinking','T-02':'Systems Thinking','T-03':'Creative Thinking',
};

export function ADAPT16RadarChart({ scores, showLabels = true }: Props) {
  if (!scores.length) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
      Complete ADAPT-16 assessment to see your radar chart
    </div>
  );

  const data = scores.map(s => ({
    subject: CODE_SHORT[s.code] ?? s.code,
    value: s.level,      // 1–4
    fullMark: 4,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--color-border-tertiary)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
        />
        <Radar
          name="Your profile"
          dataKey="value"
          stroke="#7F77DD"
          fill="#7F77DD"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value: number) => [`Level ${value}`, 'Proficiency']}
          contentStyle={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

### G8.2 — Add to individual dashboard
Add immediately below the ThreeLensSummary component (from Phase 1 Step 18).

Fetch data:
```typescript
const radarData = await prisma.competencyScore.findMany({
  where: {
    memberAssessment: { member: { id: memberId } },
    assessmentType: 'ADAPT_16',
  },
  orderBy: { competencyCode: 'asc' },
  select: { competencyCode: true, proficiencyLevel: true },
  take: 16,
});
```

Map to the component's `scores` prop format.

### G8.3 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "RadarChart\|ADAPT16Radar" | head -10
```

## Acceptance Tests
- [ ] Radar chart renders with 16 axes when ADAPT-16 data exists
- [ ] Empty state renders correctly when no data
- [ ] All 16 competency codes map to correct short labels
- [ ] Chart is responsive (works on mobile)

---END STEP G8---


---BEGIN STEP G9---

# STEP G9 — CORPORATE COHORT REPORT TEMPLATE

## Agent operating mode: NEW PAGE + NEW REPORT TEMPLATE RECORD.

## Purpose
Build the Corporate/GCC Cohort Report — the second of the four structurally
differentiated report types specified in patent claim C-06 T2.
Shows team ADAPT-16 profile, gap heat map, ROI forecast, benchmark comparison.

## Pre-conditions
- Step G8 complete
- CompetencyHeatmap component confirmed using real data (Phase 1 Step 10)

## Instructions

### G9.1 — Create corporate report page
Create `apps/portal/app/assessments/reports/corporate/[clientId]/page.tsx`:

Sections (in order):
1. **Header** — client name, report date, cohort size, assessment coverage %
2. **Workforce Readiness Index** — large number from G7, vs benchmark, trend
3. **Team ADAPT-16 Radar** — reuse ADAPT16RadarChart with cohort mean scores
4. **Competency Gap Heat Map** — reuse CompetencyHeatmap component
5. **Training ROI Forecast** — for the top-3 gap competencies, show estimated
   business impact of closing gap (use hardcoded ROI multipliers per competency
   domain — e.g. "Closing AL-01 gap by 1 level: estimated 18% improvement in
   cross-functional delivery"). These are placeholder estimates until real
   correlation data is available.
6. **Benchmark Comparison** — cohort scores vs INDUSTRY_BENCHMARKS from G7
7. **Module Attribution** (placeholder) — "Enable LMS to see training attribution"

### G9.2 — Seed ReportTemplate record
Add a seed file `apps/portal/prisma/seeds/report-templates.ts` that creates
four `ReportTemplate` records (one per report type). Do NOT run yet — create file only:

```typescript
const templates = [
  { name: 'ADAPT-16 Individual Report', type: 'INDIVIDUAL', isSystem: true },
  { name: 'Corporate Cohort Report', type: 'CORPORATE_COHORT', isSystem: true },
  { name: 'Institutional Placement Report', type: 'INSTITUTIONAL', isSystem: true },
  { name: 'Executive Strategic Report', type: 'EXECUTIVE', isSystem: true },
];
```

### G9.3 — Add navigation link
In the corporate/client dashboard (Phase 1 Step 15), add a "View Full Report"
button that links to `/assessments/reports/corporate/[clientId]`.

## Acceptance Tests
- [ ] Corporate report page renders all 7 sections
- [ ] Placeholder sections have clear "coming soon" / "pending data" states
- [ ] ReportTemplate seed file created (not run)
- [ ] Navigation link works from client dashboard

---END STEP G9---


---BEGIN STEP G10---

# STEP G10 — INSTITUTIONAL REPORT TEMPLATE

## Agent operating mode: NEW PAGE.

## Purpose
Build the Institutional Placement Report — patent claim C-06 T3.
Serves placement officers: student employability profiles, curriculum gap
analysis, individual portfolios for recruiters.

## Pre-conditions
- Step G9 complete

## Instructions

### G10.1 — Create institutional report page
Create `apps/portal/app/assessments/reports/institutional/[orgSlug]/page.tsx`:

Sections:
1. **Batch header** — institution name, batch year, student count, completion %
2. **Batch ADAPT-16 Summary** — radar chart with cohort mean, same as G9 but
   framed as "Student Employability Profile"
3. **SCIP Career Clusters** — pie or grouped list showing RIASEC distribution
   across the batch (e.g. "42% Investigative, 28% Social, 18% Enterprising")
4. **Curriculum Gap Analysis** — which ADAPT-16 competencies are systematically
   low across the batch, with suggested curriculum interventions per competency
5. **Placement Readiness Index** — percentage of students at L2+ across all 16
   competencies (minimum employability threshold)
6. **Individual Student Portfolios** — paginated list, each student showing
   name + ADAPT-16 summary + SCIP code + top 3 career fits. Each row has
   "Download Portfolio" button (PDF generation — placeholder for now)
7. **Semester Progress** (placeholder if only one assessment cycle)

### G10.2 — Placement readiness threshold logic
```typescript
// A student is "placement ready" if they score L2+ on at least 12/16 competencies
const placementReady = scores.filter(s => s.proficiencyLevel >= 2).length >= 12;
```

## Acceptance Tests
- [ ] Page renders for an institutional tenant
- [ ] RIASEC distribution shows correctly from SCIPDimensionScore data
- [ ] Placement Readiness Index % computed correctly
- [ ] Individual student list is paginated (max 20 per page)

---END STEP G10---


---BEGIN STEP G11---

# STEP G11 — EXECUTIVE / CHRO STRATEGIC REPORT TEMPLATE

## Agent operating mode: NEW PAGE.

## Purpose
Build the Executive Strategic Report — patent claim C-06 T4.
Intentionally minimal — board-ready signal, not operational detail.

## Pre-conditions
- Step G10 complete

## Instructions

### G11.1 — Create executive report page
Create `apps/portal/app/assessments/reports/executive/[clientId]/page.tsx`:

**This page must be visually distinct from the operational dashboards.**
Use larger typography, more whitespace, fewer data points.

Sections:
1. **Three headline numbers** (full width, large):
   - Workforce Future-Readiness Index (WRI from G7)
   - Culture Health Score (mean SCIP values alignment — placeholder 74 if no SCIP)
   - Succession Coverage % (roles with internal L3+ candidate / total critical roles)
2. **Strategic risk summary** — top 3 organisational risks from TNI data,
   each expressed as a business consequence not a competency code
   (e.g. "Digital fluency gap threatens AI adoption roadmap — 48% of tech dept below threshold")
3. **Top talent identification** — top 10% of employees by CompetencyScore
   average, shown as a list with name + dept + overall score
4. **Recommended interventions** — 3 priority actions only, with estimated
   investment range and projected WRI improvement
5. **6-month trend** — sparkline showing WRI change over past 2 assessment cycles
   (placeholder straight line if only 1 cycle)
6. **"Download Board Brief" button** — calls `/api/clients/[clientId]/reports/generate`
   with templateType: EXECUTIVE

## Acceptance Tests
- [ ] Page has no more than 6 visual sections
- [ ] No raw competency codes visible (business language only)
- [ ] Download button triggers existing report generation API
- [ ] Top talent list pulls from real CompetencyScore data

---END STEP G11---


---BEGIN STEP G12---

# STEP G12 — ANTI-CHEAT: RESPONSE-TIME ANOMALY DETECTION

## Agent operating mode: MODIFY EXISTING RESPONSE ROUTE. Additive.

## Purpose
Patent claim C-09 specifies response-time monitoring. Item-level timestamps
are already stored. This step adds anomaly detection: flag assessments where
completion time is statistically improbable.

## Pre-conditions
- Step G11 complete
- Response timestamps confirmed in `ComponentQuestionResponse` (check schema)

## Instructions

### G12.1 — Read the response submission route
```bash
find apps/portal/app/api/assessments/runner -name "*.ts" | xargs grep -l "response\|answer" | head -3
cat [response route]
```

### G12.2 — Add response timing to stored data
In the response submission handler, when creating `ComponentQuestionResponse`,
ensure `createdAt` is explicitly set (it may already default to `now()`).
Also add the elapsed time since session start as a field if not present:
check if `timeSpent` exists in `UserAssessmentComponent` — it does per the
audit. Ensure it is being updated on each response.

### G12.3 — Create anomaly detection service
Create `apps/portal/lib/assessment/detectTimeAnomaly.ts`:

```typescript
/**
 * Response Time Anomaly Detection
 * SEPL/INT/2026/IMPL-GAPS-01 Step G12
 * Patent claim C-09 — response-time monitoring
 *
 * Minimum plausible response times per question type (seconds):
 * - Multiple choice: 8s minimum (read + select)
 * - SJT scenario: 20s minimum (read scenario + 4 options)
 * - Essay/open-text: 60s minimum (read + compose)
 * - Simulation: 30s minimum
 */
const MIN_RESPONSE_TIMES: Record<string, number> = {
  MULTIPLE_CHOICE: 8, TRUE_FALSE: 5, LIKERT: 6, RATING: 5,
  SCENARIO_BASED: 20, SJT: 20,
  ESSAY: 60, OPEN_TEXT: 60,
  SIMULATION: 30, VIDEO_RESPONSE: 45,
};

export function isAnomalouslyFast(
  questionType: string,
  responseTimeSeconds: number
): boolean {
  const minTime = MIN_RESPONSE_TIMES[questionType] ?? 8;
  return responseTimeSeconds < minTime;
}

export function computeSessionAnomalyScore(
  responses: Array<{ questionType: string; responseTimeSeconds: number }>
): { anomalyScore: number; flagged: boolean } {
  if (!responses.length) return { anomalyScore: 0, flagged: false };

  const anomalousCount = responses.filter(r =>
    isAnomalouslyFast(r.questionType, r.responseTimeSeconds)
  ).length;

  const anomalyScore = anomalousCount / responses.length;
  return {
    anomalyScore: Math.round(anomalyScore * 100) / 100,
    flagged: anomalyScore > 0.3, // Flag if > 30% of responses are too fast
  };
}
```

### G12.4 — Wire into completion route
At assessment completion, compute anomaly score and store in `BiasFlag`:
```typescript
import { computeSessionAnomalyScore } from '@/lib/assessment/detectTimeAnomaly';

const anomaly = computeSessionAnomalyScore(responseTimings);
if (anomaly.flagged) {
  await prisma.biasFlag.create({
    data: {
      memberAssessmentId,
      flagType: 'RAPID_COMPLETION',
      severity: anomaly.anomalyScore > 0.6 ? 'HIGH' : 'MEDIUM',
      affectedLayer: 'ALL',
      correctionApplied: false,
      details: { anomalyScore: anomaly.anomalyScore },
    },
  });
}
```

Add `RAPID_COMPLETION` as a valid flagType (it is a string field — no enum change needed).

## Acceptance Tests
- [ ] `isAnomalouslyFast('SCENARIO_BASED', 5)` returns `true`
- [ ] `isAnomalouslyFast('SCENARIO_BASED', 25)` returns `false`
- [ ] Completing assessment in < 2 minutes creates a BiasFlag with RAPID_COMPLETION
- [ ] Normal-paced completion creates no BiasFlag

---END STEP G12---


---BEGIN STEP G13---

# STEP G13 — ANTI-CHEAT: PER-COHORT SJT ITEM POOLS

## Agent operating mode: SCHEMA ADDITIVE + SERVICE MODIFICATION.

## Purpose
Patent claim C-09 specifies randomised item selection from cohort-specific pools.
SJT scenarios should be drawn randomly from a pool appropriate for the user's
cohort type (Student/Professional/Corporate) to prevent item familiarity.

## Pre-conditions
- Step G12 complete

## Instructions

### G13.1 — Add cohortType to ComponentQuestion
Check if `cohortType` field exists on `ComponentQuestion`:
```bash
grep -n "cohortType\|CohortType" packages/db-assessments/prisma/schema.prisma | head -10
```

If absent, add additively to `ComponentQuestion` in both schemas:
```prisma
  targetCohort   String?  // null = all cohorts, STUDENT | PROFESSIONAL | CORPORATE
  itemPoolTag    String?  // groups questions into pools for random selection
```

Migrate both schemas.

### G13.2 — Create item pool selection service
Create `apps/portal/lib/assessment/selectItemPool.ts`:

```typescript
/**
 * Item Pool Selection Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G13
 * Patent claim C-09 — randomised item selection per cohort
 */
import { prisma } from '@/lib/prisma';

export async function selectSJTItemsForCohort(
  componentId: string,
  cohortType: string,
  targetCount: number = 24
): Promise<string[]> {
  // Get questions matching this cohort or applicable to all cohorts
  const questions = await prisma.componentQuestion.findMany({
    where: {
      component: { id: componentId },
      questionType: { in: ['SCENARIO_BASED', 'SJT'] },
      OR: [
        { targetCohort: cohortType },
        { targetCohort: null },
      ],
    },
    select: { id: true },
  });

  if (questions.length <= targetCount) {
    // Not enough questions for selection — return all, shuffled
    return questions.map(q => q.id).sort(() => Math.random() - 0.5);
  }

  // Randomly sample targetCount questions from the pool
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, targetCount).map(q => q.id);
}
```

### G13.3 — Wire into assessment start route
In the assessment start route, after creating the session, use
`selectSJTItemsForCohort` to pre-select which SJT questions to present.
Store the selection in `UserAssessmentComponent` metadata or a new
session-level field.

**If the runner already fetches questions dynamically — check the runner's
question fetch route and add cohort filtering there instead.**

## Acceptance Tests
- [ ] `selectSJTItemsForCohort` returns shuffled subset when pool > 24
- [ ] Student cohort only sees questions tagged STUDENT or null
- [ ] Calling the function twice returns different orderings (random)
- [ ] Assessment start route uses cohort-filtered question set

---END STEP G13---


---BEGIN STEP G14---

# STEP G14 — ANTI-CHEAT: RETAKE LOCKOUT ENFORCEMENT

## Agent operating mode: MODIFY EXISTING ROUTE. Additive guard.

## Purpose
Patent claim C-09 specifies retake lockout — minimum configurable interval
between retakes. `MemberAssessment.attemptNumber` exists but no lockout
is enforced in the start route.

## Pre-conditions
- Step G13 complete

## Instructions

### G14.1 — Add retake lockout config to AssessmentModel
Check if `minRetakeIntervalDays` exists on `AssessmentModel`:
```bash
grep -n "retake\|Retake\|lockout" packages/db-assessments/prisma/schema.prisma | head -10
```

If absent, add additively:
```prisma
  minRetakeIntervalDays  Int  @default(90)  // 90 days default lockout
  maxAttempts            Int  @default(3)   // max total attempts
```

Migrate both schemas.

### G14.2 — Add lockout check in assessment start route
In `POST /api/assessments/[id]/start` (or equivalent), ADD this check
BEFORE creating the new `MemberAssessment` record:

```typescript
// Check retake lockout
const lastAttempt = await prisma.memberAssessment.findFirst({
  where: {
    memberId,
    assessmentModelId: assessmentId,
    status: 'COMPLETED',
  },
  orderBy: { completedAt: 'desc' },
  include: { assessmentModel: { select: { minRetakeIntervalDays: true, maxAttempts: true } } },
});

if (lastAttempt) {
  const model = lastAttempt.assessmentModel;

  // Check max attempts
  const attemptCount = await prisma.memberAssessment.count({
    where: { memberId, assessmentModelId: assessmentId },
  });
  if (model.maxAttempts && attemptCount >= model.maxAttempts) {
    return Response.json({
      error: 'RETAKE_LIMIT_REACHED',
      message: `Maximum ${model.maxAttempts} attempts reached for this assessment.`
    }, { status: 403 });
  }

  // Check lockout interval
  const daysSinceLast = Math.floor(
    (Date.now() - new Date(lastAttempt.completedAt!).getTime()) / 86400000
  );
  if (model.minRetakeIntervalDays && daysSinceLast < model.minRetakeIntervalDays) {
    const daysRemaining = model.minRetakeIntervalDays - daysSinceLast;
    return Response.json({
      error: 'RETAKE_LOCKED',
      message: `Retake available in ${daysRemaining} days.`,
      retakeAvailableAt: new Date(
        new Date(lastAttempt.completedAt!).getTime() +
        model.minRetakeIntervalDays * 86400000
      ).toISOString(),
    }, { status: 403 });
  }
}
```

### G14.3 — Handle lockout in UI
In the assessment start UI, handle the `RETAKE_LOCKED` error response:
show a message "You can retake this assessment on [date]" with the
`retakeAvailableAt` date formatted.

## Acceptance Tests
- [ ] First attempt always allowed
- [ ] Second attempt within 90 days returns 403 RETAKE_LOCKED with date
- [ ] Second attempt after 90 days proceeds normally
- [ ] Exceeding maxAttempts returns 403 RETAKE_LIMIT_REACHED
- [ ] UI shows friendly lockout message

---END STEP G14---


---BEGIN STEP G15---

# STEP G15 — ANTI-CHEAT: BROWSER LOCKDOWN MODE

## Agent operating mode: NEW COMPONENT + FEATURE FLAG.

## Purpose
Patent claim C-09 specifies browser lockdown for proctored assessments.
Full-screen enforcement, copy-paste disable, tab-switch detection.
This should be a configurable mode on the assessment — not always active.

## Pre-conditions
- Step G14 complete

## Instructions

### G15.1 — Add lockdown config to AssessmentModel
Add additively to both schemas:
```prisma
  requiresBrowserLockdown  Boolean  @default(false)
  lockdownConfig           Json     @default("{}")
```

Migrate both schemas.

### G15.2 — Create BrowserLockdown component
Create `apps/portal/components/Assessment/BrowserLockdown.tsx`:

```tsx
/**
 * BrowserLockdown — enforces assessment integrity for proctored sessions
 * SEPL/INT/2026/IMPL-GAPS-01 Step G15
 * Patent claim C-09 — browser lockdown mechanism
 *
 * Features:
 * - Fullscreen request on mount
 * - Tab visibility change detection + warning
 * - Copy-paste prevention on assessment content
 * - Exit attempt warning
 */
'use client';
import { useEffect, useState } from 'react';

interface Props {
  enabled: boolean;
  onViolation?: (type: string) => void;
  children: React.ReactNode;
}

export function BrowserLockdown({ enabled, onViolation, children }: Props) {
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Request fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});

    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const count = violations + 1;
        setViolations(count);
        setWarning(`Tab switch detected (${count}/3). Assessment may be flagged.`);
        onViolation?.('TAB_SWITCH');
      }
    };

    // Copy-paste prevention
    const preventCopy = (e: ClipboardEvent) => { e.preventDefault(); };
    const preventPaste = (e: ClipboardEvent) => { e.preventDefault(); };

    // Exit attempt warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your assessment progress may be lost.';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, violations, onViolation]);

  return (
    <div onContextMenu={enabled ? e => e.preventDefault() : undefined}>
      {enabled && warning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground text-sm text-center py-2 px-4">
          {warning}
        </div>
      )}
      {children}
    </div>
  );
}
```

### G15.3 — Wrap assessment runner
In the assessment runner page, wrap the content with `<BrowserLockdown>`:
```tsx
<BrowserLockdown
  enabled={assessmentModel.requiresBrowserLockdown}
  onViolation={(type) => {
    // POST violation to /api/assessments/[id]/violation for logging
    fetch(`/api/assessments/${sessionId}/violation`, {
      method: 'POST', body: JSON.stringify({ type }),
      headers: { 'Content-Type': 'application/json' }
    });
  }}
>
  {/* existing runner content */}
</BrowserLockdown>
```

### G15.4 — Create violation logging route
Create `apps/portal/app/api/assessments/[id]/violation/route.ts`:
- `POST` — stores violation in `BiasFlag` with flagType `TAB_SWITCH` or similar

## Acceptance Tests
- [ ] `requiresBrowserLockdown: false` — component renders children unchanged
- [ ] `requiresBrowserLockdown: true` — fullscreen requested on mount
- [ ] Tab switch triggers warning banner
- [ ] Copy action prevented inside assessment
- [ ] Violation logged to BiasFlag table

---END STEP G15---


---BEGIN STEP G16---

# STEP G16 — LMS: ACTIVITY MODULE DELIVERY SCAFFOLDING

## Agent operating mode: NEW PAGES + ADDITIVE SCHEMA.

## Purpose
The LMS (`lms.sudaksha.com` or `/assessments/lms/`) is parked. This step
builds the minimum viable module delivery layer: activity listing, module
content view, and completion tracking. This is the foundation for G17
(milestone micro-assessments).

## Pre-conditions
- Step G15 complete
- `Activity` and `ActivityMember` models confirmed present (Phase 1 audit)

## Instructions

### G16.1 — Add LMS fields to Activity model
Check if `contentUrl`, `estimatedMinutes`, `moduleOrder` exist on Activity.
If not, add additively:
```prisma
  contentUrl         String?   // URL to learning content (video, doc, SCORM)
  estimatedMinutes   Int       @default(30)
  moduleOrder        Int       @default(0)
  completionCriteria String    @default("TIME_SPENT")  // TIME_SPENT | QUIZ_PASS | MANUAL
```

Migrate.

### G16.2 — Create learner module list page
Create `apps/portal/app/assessments/lms/page.tsx`:
- Shows all activities (type=CURRICULUM) the authenticated member is enrolled in
- Each activity card shows: name, progress %, estimated time, status badge
- Links to `/assessments/lms/[activityId]`

### G16.3 — Create module content page
Create `apps/portal/app/assessments/lms/[activityId]/page.tsx`:
- Shows activity name, description, linked competencies (from ActivityAssessment)
- Content delivery: iframe/video embed from `contentUrl`, or placeholder
  "Content will be available soon" if null
- "Mark Complete" button — calls a completion API
- Shows linked competencies as "This module develops: [competency chips]"

### G16.4 — Create module completion API
Create `apps/portal/app/api/lms/[activityId]/complete/route.ts`:
- `POST` — updates `ActivityMember.status` to COMPLETED, records `completedAt`
- Returns `{ success: true, nextStep: 'MICRO_ASSESSMENT' | 'NEXT_MODULE' | 'PATHWAY_COMPLETE' }`

## Acceptance Tests
- [ ] LMS list page renders enrolled activities
- [ ] Module page shows linked competency chips
- [ ] "Mark Complete" updates ActivityMember status
- [ ] API returns correct nextStep value

---END STEP G16---


---BEGIN STEP G17---

# STEP G17 — LMS: MILESTONE MICRO-ASSESSMENT TRIGGER

## Agent operating mode: MODIFY COMPLETION API + NEW MICRO-ASSESSMENT FLOW.

## Purpose
Patent claim C-04 specifies milestone micro-assessments at module completion.
When a module completes, the system delivers 3–5 items per relevant competency
to track incremental progress. This closes the LMS-assessment loop.

## Pre-conditions
- Step G16 complete, module completion API working

## Instructions

### G17.1 — Create micro-assessment model (additive)
Add to both schemas:
```prisma
// MicroAssessment — SEPL/INT/2026/IMPL-GAPS-01 Step G17
model MicroAssessment {
  id                 String           @id @default(cuid())
  memberId           String
  member             Member           @relation(fields: [memberId], references: [id])
  activityId         String
  activity           Activity         @relation(fields: [activityId], references: [id])
  competencyCode     String
  questions          Json             // selected question IDs + responses
  score              Float?
  completedAt        DateTime?
  createdAt          DateTime         @default(now())

  @@index([memberId])
  @@index([activityId])
}
```

Add back-references to `Member` and `Activity`. Migrate.

### G17.2 — Update module completion API
In `apps/portal/app/api/lms/[activityId]/complete/route.ts`, after marking
the activity complete, trigger micro-assessments:

```typescript
// Get competencies linked to this activity
const linkedAssessments = await prisma.activityAssessment.findMany({
  where: { activityId },
  include: { assessmentModel: { include: { components: { include: { questions: { take: 5 } } } } } },
});

const competencies = linkedAssessments.flatMap(la =>
  la.assessmentModel.components.map(c => ({
    competencyId: c.competencyId,
    questions: c.questions.slice(0, 3), // Max 3 micro-items per competency
  }))
).filter(c => c.competencyId);

// Create micro-assessment records
for (const comp of competencies) {
  await prisma.microAssessment.create({
    data: {
      memberId, activityId,
      competencyCode: comp.competencyId,
      questions: comp.questions.map(q => ({ id: q.id, text: q.questionText })),
    },
  });
}

return Response.json({
  success: true,
  nextStep: competencies.length > 0 ? 'MICRO_ASSESSMENT' : 'NEXT_MODULE',
  microAssessmentIds: /* return the created IDs */,
});
```

### G17.3 — Create micro-assessment UI
Create `apps/portal/app/assessments/lms/micro/[microId]/page.tsx`:
- Shows 3–5 quick questions for the competency being tested
- Simple multiple-choice or rating format
- Submits to `/api/lms/micro/[microId]/submit`
- On completion, shows brief "Progress check complete — keep going!" message

### G17.4 — Wire micro-assessment score into CompetencyScore
After micro-assessment submission, update the member's `CompetencyScore`
for that competency with a weighted blend of the existing score + micro score.

## Acceptance Tests
- [ ] Module completion creates MicroAssessment records for linked competencies
- [ ] Micro-assessment page shows the correct questions
- [ ] Completing micro-assessment updates CompetencyScore
- [ ] LMS module list shows "pending micro-assessment" indicator

---END STEP G17---


---BEGIN STEP G18---

# STEP G18 — SCIP FULL QUESTION BANK SEED

## Agent operating mode: SEED FILE CREATION. No schema changes.

## Purpose
Create the full question bank seed for all 5 SCIP dimensions. This is a content
and data task, not a code task. The questions use public-domain frameworks
(IPIP Big Five, Holland RIASEC, Schwartz PVQ) and Sudaksha-authored items
(Cognitive, EI). The seed file creates all questions as `ComponentQuestion`
records under the SCIP AssessmentModel components.

## Pre-conditions
- Step G17 complete
- SCIP AssessmentModel created (Phase 1 Step 22)

## Instructions

### G18.1 — Create SCIP question bank seed
Create `apps/portal/prisma/seeds/scip-questions.ts`.

This file creates:
- **SCIP-OCEAN (50 items)**: 10 items per Big Five factor.
  Use IPIP public-domain items. Store as LIKERT type with 5-point scale.
  Each item tagged with: factor (O/C/E/A/N), valence (POSITIVE/NEGATIVE).

Sample structure (first 5 of 50 — extend to full 50 in the file):
```typescript
const OCEAN_ITEMS = [
  { text: "I am full of ideas", factor: "O", valence: "POSITIVE" },
  { text: "I have a vivid imagination", factor: "O", valence: "POSITIVE" },
  { text: "I tend to avoid difficult reading material", factor: "O", valence: "NEGATIVE" },
  { text: "I am always prepared", factor: "C", valence: "POSITIVE" },
  { text: "I pay attention to details", factor: "C", valence: "POSITIVE" },
  // ... 45 more items following IPIP Big Five inventory
];
```

- **SCIP-RIASEC (36 items)**: 6 forced-choice pairs per type.
  Format: "Would you rather [A] or [B]?" stored as MULTIPLE_CHOICE with 2 options.

- **SCIP-EI (24 items)**: Sudaksha-authored SJTs, 6 per domain.
  Format: Scenario + 4 behavioural options, stored as SCENARIO_BASED.

- **SCIP-VALUES (28 items)**: PVQ portrait descriptions.
  Format: "How much like you is this person?" with LIKERT scale.

- **SCIP-COG (30 items)**: Adaptive items seeded as placeholders with
  difficulty levels 1–5. Actual cognitive items require psychometrician review.
  Store as MULTIPLE_CHOICE with `difficulty` field.

**Do NOT run this seed automatically.** File created for Binu's review and
psychometrician sign-off before execution.

### G18.2 — Document the seed file
Add a header comment to the seed file listing:
- Total items: 168
- Public domain sources used
- Items requiring psychometrician review (COG items)
- Estimated review time before safe to deploy

## Acceptance Tests
- [ ] Seed file created at correct path
- [ ] File compiles without TypeScript errors
- [ ] Total item count = 168 (50 OCEAN + 36 RIASEC + 24 EI + 28 VALUES + 30 COG)
- [ ] All items have required fields (text, questionType, targetCohort, itemValence or equivalent)
- [ ] File NOT executed — created for review only

---END STEP G18---


---BEGIN STEP G19---

# STEP G19 — REDIS CACHING LAYER CONFIRMATION + IMPLEMENTATION

## Agent operating mode: CONFIGURATION + NEW CACHE UTILITY.

## Purpose
The patent (C-09) specifies Redis for session management and analytics caching.
The audit flagged Redis as unconfirmed in the live build. This step either
confirms existing Redis usage or implements it for the two highest-value
caching targets: assessment session state and WRI computation.

## Pre-conditions
- Step G18 complete
- Check: `grep -rn "redis\|Redis\|REDIS" apps/portal --include="*.ts" -l | head -5`

## Instructions

### G19.1 — Audit current Redis usage
```bash
grep -rn "redis\|Redis\|REDIS_URL" apps/portal --include="*.ts" -l 2>/dev/null | head -10
grep -n "REDIS" apps/portal/.env.example 2>/dev/null || echo "Not in env.example"
cat apps/portal/lib/redis.ts 2>/dev/null || echo "No redis.ts found"
```

**If Redis client already exists** — document it and proceed to G19.3.
**If Redis is absent** — proceed to G19.2.

### G19.2 — Add Redis client (if absent)
Install: `cd apps/portal && pnpm add ioredis`

Create `apps/portal/lib/redis.ts`:
```typescript
/**
 * Redis client singleton
 * SEPL/INT/2026/IMPL-GAPS-01 Step G19
 * Used for: assessment session caching, WRI caching, future signals caching
 */
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis = globalForRedis.redis ?? new Redis(
  process.env.REDIS_URL ?? 'redis://localhost:6379',
  { lazyConnect: true, enableOfflineQueue: false }
);

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Graceful fallback: if Redis unavailable, operations fail silently
export async function cacheGet<T>(key: string): Promise<T | null> {
  try { const v = await redis.get(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try { await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds); }
  catch { /* silent fail — cache is not critical */ }
}

export async function cacheDel(key: string): Promise<void> {
  try { await redis.del(key); }
  catch { /* silent fail */ }
}
```

Add `REDIS_URL=redis://localhost:6379` to `.env.example`.

### G19.3 — Wire caching into WRI computation
In `apps/portal/lib/analytics/computeWorkforceReadinessIndex.ts`:
```typescript
import { cacheGet, cacheSet } from '@/lib/redis';

const CACHE_KEY = `wri:${tenantId}`;
const cached = await cacheGet<ReturnType<typeof computeWRI>>(CACHE_KEY);
if (cached) return cached;

// ... existing computation ...

await cacheSet(CACHE_KEY, result, 3600); // 1-hour TTL
return result;
```

### G19.4 — Wire caching into Future Intelligence Signals
In the career signals API route (Phase 1 Step 25), replace
`Member.metadata` caching with Redis:
```typescript
const cacheKey = `future-signals:${memberId}`;
const cached = await cacheGet(cacheKey);
if (cached) return Response.json(cached);
// ... generate signals ...
await cacheSet(cacheKey, signals, 86400); // 24-hour TTL
```

## Acceptance Tests
- [ ] `redis.ts` utility exists with graceful fallback
- [ ] WRI API returns cached result on second call (verify in logs)
- [ ] Future signals cached for 24 hours
- [ ] App starts without error if Redis is unavailable (offline fallback works)

---END STEP G19---


---BEGIN STEP G20---

# STEP G20 — S3 OBJECT STORAGE — REPORT PDF PERSISTENCE

## Agent operating mode: NEW UTILITY + WIRE INTO REPORT GENERATION.

## Purpose
The patent (C-09) specifies AWS S3 for report storage. The `Report.fileUrl`
field exists but reports are likely generated in-memory and not persisted.
This step implements S3 upload for generated PDF reports.

## Pre-conditions
- Step G19 complete
- Check: `grep -rn "s3\|S3\|AWS_S3\|@aws-sdk" apps/portal --include="*.ts" -l | head -5`

## Instructions

### G20.1 — Audit current S3 usage
```bash
grep -rn "s3\|S3\|fileUrl\|AWS" apps/portal --include="*.ts" -l 2>/dev/null | head -10
cat apps/portal/lib/storage.ts 2>/dev/null || echo "No storage.ts found"
```

**If S3 client exists** — document and proceed to G20.3.

### G20.2 — Add S3 utility (if absent)
Install: `cd apps/portal && pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

Create `apps/portal/lib/storage.ts`:
```typescript
/**
 * S3 Storage Utility
 * SEPL/INT/2026/IMPL-GAPS-01 Step G20
 * Used for: persisting generated report PDFs
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET ?? 'sudaksha-reports';

export async function uploadReportPDF(
  reportId: string,
  pdfBuffer: Buffer,
  contentType: string = 'application/pdf'
): Promise<string> {
  const key = `reports/${new Date().getFullYear()}/${reportId}.pdf`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key,
    Body: pdfBuffer, ContentType: contentType,
  }));
  return key;
}

export async function getReportSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}
```

Add to `.env.example`:
```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=sudaksha-reports
```

### G20.3 — Wire into report generation route
In `apps/portal/app/api/clients/[clientId]/reports/generate/route.ts`:
After generating the report (however it is currently generated):
```typescript
import { uploadReportPDF } from '@/lib/storage';

// After PDF generation:
if (pdfBuffer) {
  const s3Key = await uploadReportPDF(report.id, pdfBuffer);
  await prisma.report.update({
    where: { id: report.id },
    data: { fileUrl: s3Key, status: 'COMPLETED' },
  });
}
```

### G20.4 — Add signed URL endpoint
Create `apps/portal/app/api/reports/[reportId]/download/route.ts`:
- `GET` — fetches `Report.fileUrl`, generates signed S3 URL, redirects
- Requires auth, enforces tenant ownership

## Acceptance Tests
- [ ] `uploadReportPDF` function compiles correctly
- [ ] Report generation stores S3 key in `Report.fileUrl`
- [ ] Download endpoint returns signed URL (or appropriate error if S3 not configured)
- [ ] App functions normally when S3 env vars are absent (graceful degradation)

---END STEP G20---


---

## PHASE 2 MASTER ACCEPTANCE CHECKLIST

Run after completing all 20 steps (G1–G20):

**Patent claim coverage:**
- [ ] C-03 Bias detection: BiasFlag records created for biased responses
- [ ] C-03 Normative calibration: proficiencyLevel uses NormativeProfile thresholds
- [ ] C-04 Pre/post delta: AssessmentDelta records created after second assessment
- [ ] C-06 T1 Individual: 16-axis radar chart visible in individual dashboard
- [ ] C-06 T2 Corporate: cohort report page with heat map + WRI
- [ ] C-06 T3 Institutional: placement report with student portfolios
- [ ] C-06 T4 Executive: board-ready report with WRI + risk summary
- [ ] C-07 Career mapping: CareerFitScore uses weighted inverse-distance algorithm
- [ ] C-09 Anti-cheat: all 5 mechanisms confirmed functional
- [ ] C-10 WRI: Workforce Readiness Index computed and cached

**LMS loop:**
- [ ] Module completion tracked in ActivityMember
- [ ] Micro-assessment triggered on module completion
- [ ] Micro-assessment score updates CompetencyScore
- [ ] AssessmentDelta updated after post-programme reassessment

**Infrastructure:**
- [ ] Redis caching: WRI and future signals cached
- [ ] S3 storage: generated reports persisted with signed URL download

**No regression:**
- [ ] All Phase 1 functionality unchanged
- [ ] RBCA, ADAPT-16, SCIP scoring pipelines intact
- [ ] Role-aware dashboards still route correctly
- [ ] Individual dashboard still shows all 5 sections

---

*SEPL/INT/2026/IMPL-GAPS-01 | April 2026 | STRICTLY CONFIDENTIAL*
*Total Phase 2 steps: 20 (G1–G20)*
*Phase 1 prerequisite: SEPL/INT/2026/IMPL-STEPS-01 (25 steps complete ✅)*
*Combined implementation: 45 steps across both phases*
