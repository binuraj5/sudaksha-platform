# SUDAKSHA PLATFORM — STEP-BY-STEP IMPLEMENTATION PROMPTS
## Reference: SEPL/INT/2026/IMPL-STEPS-01
## For: VS Code Claude Code Agent (CLI)
## Date: April 2026 | STRICTLY CONFIDENTIAL

---

## HOW TO USE THIS DOCUMENT

Each STEP is a **standalone, self-contained prompt**. Copy the content between the `--- BEGIN STEP N ---` and `--- END STEP N ---` markers and paste it directly into Claude Code.

**Rules before every step:**
1. Read the **Pre-conditions** block. If any pre-condition is not met, do not start.
2. After the agent completes, run the **Acceptance Tests** block manually.
3. Only move to the next step after all tests pass.
4. If any test fails, fix within the same step — do not carry failures forward.

**Token efficiency note:** These prompts are deliberately scoped small. Each step touches one concern. The agent should never be asked to do more than what is written. If the agent starts doing something outside the step scope, type `STOP — stay in scope`.

---

## STEP SEQUENCE OVERVIEW

| Step | Title | Touches | Risk |
|---|---|---|---|
| 1 | Codebase orientation read | Read-only | Zero |
| 2 | MemberAssessment canonical confirmation | Read-only | Zero |
| 3 | CompetencyScore schema — db-assessments | Schema additive | Low |
| 4 | CompetencyScore schema — db-core sync | Schema additive | Low |
| 5 | AssessmentDelta + CareerFitScore schema | Schema additive | Low |
| 6 | Migration execution | DB only | Medium |
| 7 | CompetencyScore compute service | New file | Low |
| 8 | Wire scoring into completion route | One file, additive | Medium |
| 9 | NLP 6-dimension prompt upgrade | One file, prompt only | Low |
| 10 | Fix CompetencyHeatmap mock → real data | One component | Low |
| 11 | Role-aware dashboard routing | New layout logic | Medium |
| 12 | Team Lead dashboard view | New page | Low |
| 13 | Department Head dashboard view | New page | Low |
| 14 | L&D dashboard view | New page | Low |
| 15 | HR / Talent Management view | New page | Low |
| 16 | Recruiter + Hiring Manager views | New pages | Low |
| 17 | HR Head + CEO views | New pages | Low |
| 18 | Individual — 3-lens report card | Enhance existing | Medium |
| 19 | Individual — career fit matches | New section | Low |
| 20 | Individual — progress timeline | New section | Low |
| 21 | Individual — AI career coach chat | New component | Low |
| 22 | SCIP sourceType + instrument config | Schema + seed | Low |
| 23 | SCIP assessment runner wiring | Additive | Medium |
| 24 | SCIP dimension score storage | New service | Low |
| 25 | Future intelligence signal card | New component | Low |

---

---BEGIN STEP 1---

# STEP 1 — CODEBASE ORIENTATION (READ-ONLY)

## Agent operating mode: READ-ONLY. Write nothing.

## Purpose
Confirm the exact current state of the files this implementation series will touch. This step produces a brief fact-sheet that will be referenced in every subsequent step.

## Pre-conditions
- You are in the root of the SudakshaNWS / sudaksha-platform monorepo
- No prior steps have been run

## Instructions

Read the following files and for each, output a one-line status summary:

```bash
cat packages/db-assessments/prisma/schema.prisma | grep -n "model " | head -40
cat packages/db-core/prisma/schema.prisma | grep -n "model " | head -40
cat apps/portal/lib/prisma.ts
cat apps/portal/app/api/assessments/runner/response/route.ts | head -60
ls apps/portal/app/api/assessments/runner/
cat apps/portal/components/Analytics/CompetencyHeatmap.tsx | head -40
grep -rn "MemberAssessment\|UserAssessmentModel" apps/portal/app/api --include="*.ts" -l
grep -rn "sourceType" packages/db-assessments/prisma/schema.prisma | head -10
grep -n "AssessmentTypeEnum\|ROLE_BASED\|COMPETENCY_BASED\|ADAPT_16\|SCIP" packages/db-assessments/prisma/schema.prisma | head -15
grep -n "MemberRole\|UserRole" packages/db-assessments/prisma/schema.prisma | head -15
```

## Output format required

Produce a short fact-sheet:
```
FACT-SHEET — Step 1 findings
Models in db-assessments: [count]
Models in db-core: [count]
Prisma singleton path: [path]
Assessment runner files: [list]
CompetencyHeatmap uses mock data: [YES/NO/UNKNOWN]
Files using MemberAssessment: [count]
Files using UserAssessmentModel: [count]
sourceType enum values: [list them]
AssessmentTypeEnum present: [YES/NO]
Role enum values relevant to dashboards: [list]
```

## Acceptance Tests
- [ ] Fact-sheet produced with no UNKNOWN entries
- [ ] No files were written or modified

## Do NOT do
- Do not modify any file
- Do not run any migration
- Do not install packages

---END STEP 1---


---BEGIN STEP 2---

# STEP 2 — CONFIRM CANONICAL SESSION MODEL (READ-ONLY)

## Agent operating mode: READ-ONLY. Write nothing.

## Purpose
Confirm that `MemberAssessment` is the correct canonical session model to attach `CompetencyScore` to. This is a decision gate — Step 3 depends on it.

## Pre-conditions
- Step 1 completed and fact-sheet produced

## Instructions

```bash
# Check which model the adaptive session links to
grep -n "memberAssessmentId\|userAssessmentModelId" packages/db-assessments/prisma/schema.prisma

# Check which model the panel interview links to
grep -n "PanelInterview" packages/db-assessments/prisma/schema.prisma -A 10

# Check which model the completion route writes to
cat apps/portal/app/api/assessments/runner/$(ls apps/portal/app/api/assessments/runner/)/complete/route.ts 2>/dev/null || find apps/portal/app/api/assessments/runner -name "route.ts" | xargs grep -l "complete\|COMPLETED" | head -3

# Check which session model has the most FK relations
grep -n "MemberAssessment\b" packages/db-assessments/prisma/schema.prisma | wc -l
grep -n "UserAssessmentModel\b" packages/db-assessments/prisma/schema.prisma | wc -l
```

## Output format required

```
DECISION RECORD — Step 2
AdaptiveSession links to: [MemberAssessment / UserAssessmentModel]
PanelInterview links to: [MemberAssessment / UserAssessmentModel]
Completion route writes to: [confirmed model or NEEDS INSPECTION]
MemberAssessment FK count in schema: [number]
UserAssessmentModel FK count in schema: [number]
CANONICAL MODEL DECISION: [MemberAssessment / UserAssessmentModel]
Reason: [one sentence]
```

## Acceptance Tests
- [ ] Decision record produced
- [ ] Canonical model confirmed — record this for all subsequent steps
- [ ] No files written

---END STEP 2---


---BEGIN STEP 3---

# STEP 3 — ADD CompetencyScore MODEL TO db-assessments SCHEMA

## Agent operating mode: SCHEMA EDIT — additive only.

## Purpose
Add the `CompetencyScore` model to `packages/db-assessments/prisma/schema.prisma`. This is the foundational data model for per-competency scoring across all three instruments (RBCA, ADAPT-16, SCIP).

## Pre-conditions
- Step 2 completed. Canonical model confirmed as `MemberAssessment`.
- `CompetencyScore` model does NOT exist in db-assessments schema (verify with `grep -n "CompetencyScore" packages/db-assessments/prisma/schema.prisma`)

## Instructions

### 3.1 — Read the file first
```bash
tail -80 packages/db-assessments/prisma/schema.prisma
```
Note the exact last line and last model. You will append after it.

### 3.2 — Add the model
Append the following to the END of `packages/db-assessments/prisma/schema.prisma`, after all existing models:

```prisma
// CompetencyScore — SEPL/INT/2026/IMPL-STEPS-01 Step 3
// Stores per-competency calibrated score for any assessment type
// ADDITIVE — does not modify any existing model
model CompetencyScore {
  id                 String           @id @default(cuid())
  memberAssessmentId String
  memberAssessment   MemberAssessment @relation(fields: [memberAssessmentId], references: [id], onDelete: Cascade)
  competencyCode     String
  competencyId       String?
  assessmentType     String           @default("RBCA")
  layerScores        Json             @default("{}")
  compositeRawScore  Float            @default(0)
  normalisedScore    Float?
  proficiencyLevel   Int              @default(1)
  percentileRank     Int?
  biasFlag           String?
  cohortType         String           @default("PROFESSIONAL")
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  @@unique([memberAssessmentId, competencyCode, assessmentType])
  @@index([memberAssessmentId])
  @@index([competencyCode])
  @@index([assessmentType])
}
```

### 3.3 — Add back-reference to MemberAssessment
Find the `MemberAssessment` model in the schema. Locate its closing `}`. Add this line immediately before the closing `}`:

```prisma
  competencyScores   CompetencyScore[]
```

**IMPORTANT:** Add ONLY this one line. Do not change any other field in MemberAssessment.

### 3.4 — Validate schema syntax
```bash
cd packages/db-assessments && npx prisma validate 2>&1
```

## Output format required
```
STEP 3 COMPLETE
CompetencyScore model added: [YES/NO]
Back-reference added to MemberAssessment: [YES/NO]
prisma validate result: [PASS / ERRORS — list them]
Lines added to schema: [count]
Any existing models modified: [NONE — or list if accidental]
```

## Acceptance Tests
- [ ] `npx prisma validate` passes with no errors
- [ ] `grep -c "CompetencyScore" packages/db-assessments/prisma/schema.prisma` returns 3 or more (model name + relation + back-ref)
- [ ] No existing model was altered (verify with git diff)

## Do NOT do
- Do not run `prisma migrate` or `prisma db push`
- Do not modify db-core in this step
- Do not add any other models

---END STEP 3---


---BEGIN STEP 4---

# STEP 4 — SYNC CompetencyScore MODEL TO db-core SCHEMA

## Agent operating mode: SCHEMA EDIT — additive only.

## Purpose
Mirror the identical `CompetencyScore` model addition into `packages/db-core/prisma/schema.prisma`. Also fix the known `CompetencyDevelopmentRequest` field divergence.

## Pre-conditions
- Step 3 completed and validated
- `CompetencyScore` does NOT exist in db-core (verify: `grep -n "CompetencyScore" packages/db-core/prisma/schema.prisma`)

## Instructions

### 4.1 — Read db-core schema tail
```bash
tail -60 packages/db-core/prisma/schema.prisma
grep -n "MemberAssessment" packages/db-core/prisma/schema.prisma | head -5
grep -n "CompetencyDevelopmentRequest" packages/db-core/prisma/schema.prisma -A 20 | head -25
```

### 4.2 — Add CompetencyScore model
Append the IDENTICAL model from Step 3 to the END of `packages/db-core/prisma/schema.prisma`.

### 4.3 — Add back-reference to MemberAssessment in db-core
Same as Step 3.3 — find `MemberAssessment` closing `}`, add `competencyScores CompetencyScore[]` before it.

### 4.4 — Fix CompetencyDevelopmentRequest divergence
Find the `CompetencyDevelopmentRequest` model in `packages/db-core/prisma/schema.prisma`.
Check if it has `level` and `competencyId` fields.
If MISSING, add these two lines inside the model (before the closing `}`):

```prisma
  level              String           @default("JUNIOR")
  competencyId       String?
```

Do NOT add a relation line unless a `Competency` model exists and has no existing `competencyDevelopmentRequests` back-reference. Check first:
```bash
grep -n "competencyDevelopmentRequests\|CompetencyDevelopmentRequest" packages/db-core/prisma/schema.prisma
```

### 4.5 — Validate
```bash
cd packages/db-core && npx prisma validate 2>&1
```

## Output format required
```
STEP 4 COMPLETE
CompetencyScore added to db-core: [YES/NO]
Back-reference added: [YES/NO]
CompetencyDevelopmentRequest level field: [already present / added / skipped — reason]
CompetencyDevelopmentRequest competencyId field: [already present / added / skipped — reason]
prisma validate db-core: [PASS / ERRORS]
```

## Acceptance Tests
- [ ] `prisma validate` passes on db-core
- [ ] `prisma validate` still passes on db-assessments (re-run to confirm no regression)
- [ ] git diff shows only additive changes — no modifications to existing fields

---END STEP 4---


---BEGIN STEP 5---

# STEP 5 — ADD AssessmentDelta AND CareerFitScore MODELS

## Agent operating mode: SCHEMA EDIT — additive only, BOTH schemas.

## Purpose
Add two more models needed for the pre/post delta system and career fit ranking. These complete the Phase 1 schema foundation.

## Pre-conditions
- Steps 3 and 4 completed, both schemas validate

## Instructions

### 5.1 — Add to db-assessments first, then mirror to db-core

Append to the END of `packages/db-assessments/prisma/schema.prisma`:

```prisma
// AssessmentDelta — SEPL/INT/2026/IMPL-STEPS-01 Step 5
model AssessmentDelta {
  id                     String           @id @default(cuid())
  memberId               String
  member                 Member           @relation("MemberDeltas", fields: [memberId], references: [id], onDelete: Cascade)
  baselineAssessmentId   String
  baselineAssessment     MemberAssessment @relation("DeltaBaseline", fields: [baselineAssessmentId], references: [id])
  followupAssessmentId   String
  followupAssessment     MemberAssessment @relation("DeltaFollowup", fields: [followupAssessmentId], references: [id])
  deltaScores            Json             @default("{}")
  overallDelta           Float?
  attributedActivityId   String?
  assessmentType         String           @default("RBCA")
  calculatedAt           DateTime         @default(now())

  @@index([memberId])
  @@index([baselineAssessmentId])
}

// CareerFitScore — SEPL/INT/2026/IMPL-STEPS-01 Step 5
model CareerFitScore {
  id                   String           @id @default(cuid())
  memberId             String
  member               Member           @relation("MemberCareerFit", fields: [memberId], references: [id], onDelete: Cascade)
  roleId               String
  role                 Role             @relation("RoleCareerFit", fields: [roleId], references: [id])
  memberAssessmentId   String
  memberAssessment     MemberAssessment @relation("AssessmentCareerFit", fields: [memberAssessmentId], references: [id])
  fitScore             Float
  gapAnalysis          Json             @default("{}")
  instrumentsUsed      String[]         @default([])
  rank                 Int?
  calculatedAt         DateTime         @default(now())

  @@unique([memberId, roleId, memberAssessmentId])
  @@index([memberId])
  @@index([fitScore])
}
```

### 5.2 — Add back-references
In `MemberAssessment`, add before closing `}`:
```prisma
  deltaAsBaseline    AssessmentDelta[] @relation("DeltaBaseline")
  deltaAsFollowup    AssessmentDelta[] @relation("DeltaFollowup")
  careerFitScores    CareerFitScore[]  @relation("AssessmentCareerFit")
  isBaseline         Boolean           @default(false)
  baselineSessionId  String?
```

In `Member`, add before closing `}`:
```prisma
  assessmentDeltas   AssessmentDelta[] @relation("MemberDeltas")
  careerFitScores    CareerFitScore[]  @relation("MemberCareerFit")
```

In `Role`, add before closing `}`:
```prisma
  careerFitScores    CareerFitScore[]  @relation("RoleCareerFit")
```

**BEFORE adding each back-reference, check it doesn't already exist:**
```bash
grep -n "deltaAsBaseline\|deltaAsFollowup\|careerFitScores\|assessmentDeltas\|isBaseline" packages/db-assessments/prisma/schema.prisma
```

### 5.3 — Mirror IDENTICAL changes to db-core
Apply the exact same additions to `packages/db-core/prisma/schema.prisma`.

### 5.4 — Validate both
```bash
cd packages/db-assessments && npx prisma validate 2>&1
cd ../db-core && npx prisma validate 2>&1
```

## Output format required
```
STEP 5 COMPLETE
AssessmentDelta added: db-assessments [YES/NO] db-core [YES/NO]
CareerFitScore added: db-assessments [YES/NO] db-core [YES/NO]
All back-references added: [YES/NO — list any skipped and why]
prisma validate db-assessments: [PASS/FAIL]
prisma validate db-core: [PASS/FAIL]
```

## Acceptance Tests
- [ ] Both schemas validate with no errors
- [ ] `grep -c "CareerFitScore\|AssessmentDelta" packages/db-assessments/prisma/schema.prisma` > 4
- [ ] No existing models modified (verify git diff)

---END STEP 5---


---BEGIN STEP 6---

# STEP 6 — RUN MIGRATIONS

## Agent operating mode: MIGRATION EXECUTION.

## ⚠️ BINU MUST REVIEW THE SCHEMA DIFF BEFORE THIS STEP RUNS ⚠️

## Purpose
Apply the additive schema changes from Steps 3–5 to the actual PostgreSQL databases.

## Pre-conditions
- Steps 3, 4, 5 all completed with PASS validation
- Binu has reviewed `git diff packages/` and confirmed all changes are additive only
- You have a working database connection (env vars set)
- You are NOT running this against a production database — development only

## Instructions

### 6.1 — Dry run first (shows what migration will do, no changes applied)
```bash
cd packages/db-assessments
npx prisma migrate dev --name "add_competency_score_delta_career_fit" --create-only
```
Review the generated migration file at `prisma/migrations/[timestamp]_add_competency_score_delta_career_fit/migration.sql` before proceeding.

The migration SQL should contain ONLY:
- `CREATE TABLE "CompetencyScore"` statements
- `CREATE TABLE "AssessmentDelta"` statements
- `CREATE TABLE "CareerFitScore"` statements
- `ALTER TABLE "MemberAssessment" ADD COLUMN` statements (isBaseline, baselineSessionId, back-refs)
- `ALTER TABLE "Member" ADD COLUMN` statements (back-refs only)
- `ALTER TABLE "Role" ADD COLUMN` statements (back-refs only)
- `CREATE INDEX` statements
- `CREATE UNIQUE INDEX` statements
- `ALTER TABLE "CompetencyDevelopmentRequest" ADD COLUMN` (if applicable)

**If the migration SQL contains any DROP, ALTER COLUMN type change, or RENAME — STOP and report.**

### 6.2 — Apply db-assessments migration
```bash
cd packages/db-assessments
npx prisma migrate dev --name "add_competency_score_delta_career_fit"
```

### 6.3 — Apply db-core migration
```bash
cd packages/db-core
npx prisma migrate dev --name "add_competency_score_delta_career_fit"
```

### 6.4 — Regenerate Prisma clients
```bash
cd packages/db-assessments && npx prisma generate
cd ../db-core && npx prisma generate
```

### 6.5 — Verify tables created
```bash
cd packages/db-assessments
npx prisma db execute --stdin <<EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('CompetencyScore', 'AssessmentDelta', 'CareerFitScore');
EOF
```

## Output format required
```
STEP 6 COMPLETE
Migration SQL reviewed: [YES/NO — any DROP or ALTER TYPE found: YES/NO]
db-assessments migration: [SUCCESS / FAILED — error]
db-core migration: [SUCCESS / FAILED — error]
Prisma clients regenerated: [YES/NO]
Tables confirmed in DB: [CompetencyScore YES/NO] [AssessmentDelta YES/NO] [CareerFitScore YES/NO]
```

## Acceptance Tests
- [ ] Both migrations applied with no errors
- [ ] Three new tables visible in database
- [ ] `npx prisma studio` (optional) — can open and see new tables
- [ ] Existing tables unaffected — spot-check MemberAssessment still has all original fields

---END STEP 6---


---BEGIN STEP 7---

# STEP 7 — CREATE CompetencyScore COMPUTE SERVICE

## Agent operating mode: NEW FILE only. Do not modify existing files.

## Purpose
Create the service that computes and stores per-competency scores after an assessment completes. This is a new file — it does not touch any existing route or service.

## Pre-conditions
- Step 6 completed, migrations applied, Prisma clients regenerated

## Instructions

### 7.1 — Read context first
```bash
cat apps/portal/lib/prisma.ts
grep -n "competencyId\|competencyCode\|questionType\|ComponentQuestion\|UserAssessmentComponent" packages/db-assessments/prisma/schema.prisma | head -30
```

### 7.2 — Create the service file
Create `apps/portal/lib/scoring/computeCompetencyScores.ts` with the following content:

```typescript
/**
 * CompetencyScore Compute Service
 * SEPL/INT/2026/IMPL-STEPS-01 Step 7
 *
 * Called after assessment completion to persist per-competency scores.
 * This is a NEW file — it does not modify any existing service.
 *
 * IMPORTANT: The PROVISIONAL_DOMAIN_WEIGHTS below are structural placeholders.
 * The actual proprietary weight values must be set by Binu Raj Pillai (CEO)
 * before this service is used in production.
 */

import { prisma } from '@/lib/prisma';

// ── WEIGHT MATRIX ────────────────────────────────────────────────────────────
// Weights per domain per layer (L1=Self-report, L2=SJT, L3=Psychometric,
// L4=360, L5=NLP, L6=Simulation). Must sum to 1.0 per domain.
// THESE ARE PROVISIONAL — replace with authorised values before production.
const DOMAIN_WEIGHTS: Record<string, Record<string, number>> = {
  A:  { L1: 0.15, L2: 0.30, L3: 0.15, L4: 0.10, L5: 0.10, L6: 0.20 },
  D:  { L1: 0.15, L2: 0.20, L3: 0.15, L4: 0.05, L5: 0.25, L6: 0.20 },
  AL: { L1: 0.10, L2: 0.20, L3: 0.10, L4: 0.35, L5: 0.15, L6: 0.10 },
  P:  { L1: 0.15, L2: 0.15, L3: 0.15, L4: 0.10, L5: 0.35, L6: 0.10 },
  T:  { L1: 0.15, L2: 0.30, L3: 0.10, L4: 0.05, L5: 0.15, L6: 0.25 },
};

// ADAPT-16 competency → domain
const COMPETENCY_DOMAIN: Record<string, string> = {
  'A-01': 'A', 'A-02': 'A', 'A-03': 'A', 'A-04': 'A',
  'D-01': 'D', 'D-02': 'D', 'D-03': 'D',
  'AL-01': 'AL', 'AL-02': 'AL', 'AL-03': 'AL',
  'P-01': 'P', 'P-02': 'P', 'P-03': 'P',
  'T-01': 'T', 'T-02': 'T', 'T-03': 'T',
};

// Question type → layer key
const QTYPE_TO_LAYER: Record<string, string> = {
  'MULTIPLE_CHOICE': 'L1', 'TRUE_FALSE': 'L1', 'RATING': 'L1', 'LIKERT': 'L1',
  'SCENARIO_BASED': 'L2', 'SJT': 'L2',
  'PSYCHOMETRIC': 'L3',
  'PANEL_360': 'L4',
  'ESSAY': 'L5', 'VIDEO_RESPONSE': 'L5', 'VOICE_RESPONSE': 'L5',
  'FILE_UPLOAD': 'L6', 'SIMULATION': 'L6',
};

type ScoresByLayer = Record<string, number[]>;

export async function computeAndStoreCompetencyScores(
  memberAssessmentId: string,
  assessmentType: string = 'RBCA',
  cohortType: string = 'PROFESSIONAL'
): Promise<{ stored: number; skipped: number }> {
  try {
    // 1. Get all UserAssessmentComponent IDs for this session
    const components = await prisma.userAssessmentComponent.findMany({
      where: { userAssessmentModelId: memberAssessmentId },
      select: { id: true },
    });

    if (!components.length) {
      console.warn(`[CompetencyScore] No components found for session ${memberAssessmentId}`);
      return { stored: 0, skipped: 0 };
    }

    const componentIds = components.map(c => c.id);

    // 2. Get all responses with their question metadata
    const responses = await prisma.componentQuestionResponse.findMany({
      where: { userComponentId: { in: componentIds } },
      include: {
        question: {
          select: {
            questionType: true,
            component: { select: { competencyId: true } },
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

      const score = resp.aiScore ?? resp.pointsAwarded ?? 0;
      const layer = QTYPE_TO_LAYER[resp.question?.questionType ?? ''] ?? 'L1';

      if (!grouped[competencyId]) grouped[competencyId] = {};
      if (!grouped[competencyId][layer]) grouped[competencyId][layer] = [];
      grouped[competencyId][layer].push(score);
    }

    // 4. Compute and upsert CompetencyScore per competency
    let stored = 0;
    let skipped = 0;

    for (const [competencyId, layerData] of Object.entries(grouped)) {
      // Resolve competency code (use competencyId as fallback code)
      const competency = await prisma.competency.findUnique({
        where: { id: competencyId },
        select: { name: true },
      }).catch(() => null);

      const competencyCode = competency?.name ?? competencyId;
      const domain = COMPETENCY_DOMAIN[competencyCode];
      const weights = domain ? DOMAIN_WEIGHTS[domain] : null;

      const layerScores: Record<string, number | null> = {
        L1: null, L2: null, L3: null, L4: null, L5: null, L6: null,
      };

      let composite = 0;
      let totalWeight = 0;

      for (const [layer, scores] of Object.entries(layerData)) {
        if (!scores.length) continue;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        layerScores[layer] = Math.round(avg * 100) / 100;
        const w = weights?.[layer] ?? 1 / 6;
        composite += avg * w;
        totalWeight += w;
      }

      if (totalWeight === 0) { skipped++; continue; }
      composite = totalWeight < 1 ? composite / totalWeight : composite;

      // Simple proficiency mapping (replace with normative calibration in Step N)
      const proficiencyLevel = composite >= 85 ? 4
        : composite >= 65 ? 3
        : composite >= 40 ? 2
        : 1;

      await prisma.competencyScore.upsert({
        where: {
          memberAssessmentId_competencyCode_assessmentType: {
            memberAssessmentId,
            competencyCode,
            assessmentType,
          },
        },
        update: {
          layerScores,
          compositeRawScore: Math.round(composite * 100) / 100,
          proficiencyLevel,
          updatedAt: new Date(),
        },
        create: {
          memberAssessmentId,
          competencyCode,
          competencyId,
          assessmentType,
          layerScores,
          compositeRawScore: Math.round(composite * 100) / 100,
          proficiencyLevel,
          cohortType,
        },
      });

      stored++;
    }

    console.log(`[CompetencyScore] ${stored} stored, ${skipped} skipped for session ${memberAssessmentId}`);
    return { stored, skipped };

  } catch (err) {
    console.error('[CompetencyScore] Compute failed:', err);
    return { stored: 0, skipped: 0 };
  }
}
```

### 7.3 — Check TypeScript compiles
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep -i "computeCompetencyScores\|scoring/" | head -20
```

## Output format required
```
STEP 7 COMPLETE
File created: apps/portal/lib/scoring/computeCompetencyScores.ts [YES/NO]
TypeScript errors in new file: [NONE / list errors]
Existing files modified: [NONE — or list]
```

## Acceptance Tests
- [ ] File exists at correct path
- [ ] No TypeScript errors in the new file
- [ ] No existing files were modified

---END STEP 7---


---BEGIN STEP 8---

# STEP 8 — WIRE SCORING INTO ASSESSMENT COMPLETION ROUTE

## Agent operating mode: MODIFY ONE EXISTING FILE — additive insert only.

## Purpose
Call the `computeAndStoreCompetencyScores` service when an assessment session completes. This is an additive call — the existing completion logic is NOT changed.

## Pre-conditions
- Step 7 completed, service file exists

## Instructions

### 8.1 — Read the completion route
```bash
find apps/portal/app/api/assessments/runner -name "*.ts" | xargs grep -l "COMPLETED\|complete\|status.*COMPLET" 2>/dev/null
```
Read the file(s) found. Identify:
- Where `MemberAssessment.status` is set to `COMPLETED` (or equivalent)
- The `memberAssessmentId` variable name at that point
- The `member.type` or cohort type variable, if available

### 8.2 — Add the import at the top of the completion route file
After the last existing import line, add:
```typescript
import { computeAndStoreCompetencyScores } from '@/lib/scoring/computeCompetencyScores';
```

### 8.3 — Add the async fire-and-forget call
Find the code block where the assessment is marked COMPLETED. AFTER that block (not inside it, not replacing it), add:

```typescript
// Fire-and-forget: compute competency scores asynchronously
// Does not block the response — failure is logged, not thrown
computeAndStoreCompetencyScores(
  memberAssessmentId,   // use whatever variable holds the session ID
  'RBCA',               // default — update when ADAPT-16 and SCIP are wired in Step 22+
  member?.type ?? 'PROFESSIONAL'
).catch(err => console.error('[CompetencyScore] Async compute error:', err));
```

**IMPORTANT:** Replace `memberAssessmentId` and `member?.type` with the actual variable names from the file. Do not introduce new variables.

### 8.4 — Verify TypeScript
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | head -30
```

## Output format required
```
STEP 8 COMPLETE
Completion route file: [path]
Import added: [YES/NO]
Async call added after COMPLETED block: [YES/NO]
Existing completion logic modified: [NO — or describe if yes]
TypeScript errors: [NONE / list]
```

## Acceptance Tests
- [ ] No TypeScript errors
- [ ] Completion route logic unchanged except for the new import and one fire-and-forget call
- [ ] `git diff` shows exactly 2 additive changes: import + call

---END STEP 8---


---BEGIN STEP 9---

# STEP 9 — UPGRADE NLP SCORING PROMPT TO 6 DIMENSIONS

## Agent operating mode: MODIFY ONE EXISTING FILE — prompt string replacement only.

## Purpose
The current Claude API call for open-response scoring generates narrative text. Upgrade it to also return 6 structured dimension scores as JSON, then store them in `ComponentQuestionResponse.aiEvaluation`.

## Pre-conditions
- Step 8 completed

## Instructions

### 9.1 — Find the NLP evaluation route
```bash
find apps/portal/app/api -name "*.ts" | xargs grep -l "ANTHROPIC\|anthropic\|claude\|interview.*eval\|nlp" 2>/dev/null | head -5
cat [the file found above]
```

### 9.2 — Read the current prompt
Identify the exact prompt string sent to the Claude API. Note:
- Where it is defined (inline? imported from config?)
- What it currently returns

### 9.3 — Replace ONLY the prompt content
Replace the prompt string with the following. Do NOT change request handling, auth, error handling, or response logic:

```typescript
const ADAPT16_NLP_PROMPT = `You are an expert psychometric evaluator assessing competency expression in professional reflective writing.

Evaluate the response below. Return ONLY a valid JSON object — no preamble, no markdown, no explanation.

{
  "specificity_of_behavioural_example": <0-100>,
  "outcome_orientation": <0-100>,
  "self_reflective_depth": <0-100>,
  "complexity_of_thinking": <0-100>,
  "linguistic_confidence_clarity": <0-100>,
  "ethical_values_language": <0-100>,
  "overall_nlp_score": <0-100>,
  "primary_competencies_evidenced": ["<code>"],
  "narrative_summary": "<2 sentences max — plain language interpretation>",
  "scoring_confidence": <0-100>
}

Scoring guide:
- specificity_of_behavioural_example: concrete STAR-method indicators vs vague generalities
- outcome_orientation: articulated outcomes, consequences, learnings
- self_reflective_depth: genuine self-examination, personal limitations identified
- complexity_of_thinking: multi-causal reasoning, perspective-taking, analytical depth
- linguistic_confidence_clarity: coherence, precision, structural clarity
- ethical_values_language: principles-based language, values-congruent framing

Response to evaluate:
"""
{RESPONSE_TEXT}
"""`;
```

Replace `{RESPONSE_TEXT}` interpolation to match whatever variable holds the user's text.

### 9.4 — Update the result storage
After parsing the Claude API response, ensure:
- `ComponentQuestionResponse.aiScore` = `parsedResult.overall_nlp_score`
- `ComponentQuestionResponse.aiEvaluation` = the full parsed JSON object

If these assignments already exist, update them to use the new field names. If they don't exist, add them.

### 9.5 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | head -20
```

## Output format required
```
STEP 9 COMPLETE
NLP route file: [path]
Old prompt replaced: [YES/NO]
aiScore assignment updated: [YES/NO]
aiEvaluation assignment updated: [YES/NO]
TypeScript errors: [NONE / list]
```

## Acceptance Tests
- [ ] No TypeScript errors
- [ ] Old prompt is completely replaced
- [ ] Result still stored in the same DB fields — no new columns needed
- [ ] `git diff` shows prompt replacement + possibly 2 assignment updates — nothing else

---END STEP 9---


---BEGIN STEP 10---

# STEP 10 — FIX CompetencyHeatmap — MOCK DATA → REAL API

## Agent operating mode: MODIFY ONE EXISTING FILE.

## Purpose
If `CompetencyHeatmap.tsx` uses hardcoded mock data, replace it with a real API call to `/api/clients/[clientId]/analytics/competency-heatmap`. If it already uses real data, this step is a no-op.

## Pre-conditions
- Step 9 completed

## Instructions

### 10.1 — Inspect the component
```bash
cat apps/portal/components/Analytics/CompetencyHeatmap.tsx
```

### 10.2 — Determine state
If the file contains `MOCK_HEATMAP`, `mockData`, `hardcoded`, or a literal array of competency objects that aren't fetched from an API — it uses mock data. Proceed to 10.3.
If it already uses `fetch`, `useQuery`, `useSWR`, or similar — output "ALREADY USES REAL DATA" and stop.

### 10.3 — Replace mock data with API call
Keep the entire component JSX and rendering logic intact. Only replace the data source:

1. Add a `clientId` prop if not present
2. Add a loading state using the project's existing loading pattern (check how other components do it)
3. Replace the mock array with:
```typescript
const [data, setData] = useState<HeatmapData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!clientId) return;
  fetch(`/api/clients/${clientId}/analytics/competency-heatmap`)
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false); })
    .catch(() => setLoading(false));
}, [clientId]);
```

4. Wrap existing render in `if (loading) return <LoadingSpinner />` and `if (!data) return <EmptyState />`
5. Use `data` in place of the previous mock variable

Use whatever `LoadingSpinner` and `EmptyState` components already exist in the project.

### 10.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "CompetencyHeatmap" | head -10
```

## Output format required
```
STEP 10 COMPLETE
Was using mock data: [YES/NO]
clientId prop added/already present: [added/present/not needed]
API call wired: [YES/NO/SKIPPED — already real]
TypeScript errors: [NONE / list]
```

## Acceptance Tests
- [ ] Component renders without console errors
- [ ] Loading state visible while fetch is in progress
- [ ] Empty state visible if API returns no data
- [ ] Mock data array no longer present in file

---END STEP 10---


---BEGIN STEP 11---

# STEP 11 — ROLE-AWARE DASHBOARD ROUTING

## Agent operating mode: NEW FILE + ONE LAYOUT MODIFICATION.

## Purpose
Implement the logic that routes authenticated users to their role-specific dashboard on login. A CEO should never see a Team Lead view. This is the routing foundation for Steps 12–17.

## Pre-conditions
- Step 10 completed
- Understand the current auth session structure: `grep -n "session\|role\|MemberRole\|UserRole" apps/portal/app/api/auth/ -r --include="*.ts" | head -20`

## Instructions

### 11.1 — Read current dashboard route
```bash
find apps/portal/app -name "page.tsx" | xargs grep -l "dashboard" | head -5
cat [the main dashboard page found]
```

### 11.2 — Read role enum values
```bash
grep -n "enum.*Role\|MemberRole\|UserRole" packages/db-assessments/prisma/schema.prisma | head -20
```

### 11.3 — Create the role-to-dashboard mapping file
Create `apps/portal/lib/dashboardRouting.ts`:

```typescript
/**
 * Dashboard routing by role
 * SEPL/INT/2026/IMPL-STEPS-01 Step 11
 * Maps authenticated user role to their dashboard path.
 * Add new roles here as they are built — never in page components.
 */

export type DashboardRole =
  | 'TEAM_LEAD'
  | 'DEPARTMENT_HEAD'
  | 'L_AND_D'
  | 'HR'
  | 'TALENT_MANAGEMENT'
  | 'RECRUITER'
  | 'HIRING_MANAGER'
  | 'HR_HEAD'
  | 'CEO'
  | 'INDIVIDUAL'
  | 'STUDENT'
  | 'ADMIN'
  | string;  // fallback for unknown roles

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  TEAM_LEAD:          '/assessments/dashboard/team-lead',
  DEPARTMENT_HEAD:    '/assessments/dashboard/dept-head',
  L_AND_D:            '/assessments/dashboard/ld',
  HR:                 '/assessments/dashboard/hr',
  TALENT_MANAGEMENT:  '/assessments/dashboard/hr',
  RECRUITER:          '/assessments/dashboard/recruiter',
  HIRING_MANAGER:     '/assessments/dashboard/hiring-manager',
  HR_HEAD:            '/assessments/dashboard/hr-head',
  CEO:                '/assessments/dashboard/ceo',
  INDIVIDUAL:         '/assessments/dashboard/individual',
  STUDENT:            '/assessments/dashboard/individual',
  ADMIN:              '/assessments/admin/dashboard',
};

// Default fallback if role has no specific dashboard yet
const DEFAULT_DASHBOARD = '/assessments/dashboard/individual';

export function getDashboardPath(role: string | null | undefined): string {
  if (!role) return DEFAULT_DASHBOARD;
  return ROLE_DASHBOARD_MAP[role.toUpperCase()] ?? DEFAULT_DASHBOARD;
}
```

### 11.4 — Update the main dashboard redirect
In the main authenticated dashboard entry point (the page that loads after login), add:

```typescript
import { getDashboardPath } from '@/lib/dashboardRouting';
// ...
const dashboardPath = getDashboardPath(session?.user?.role);
// Use redirect(dashboardPath) or router.replace(dashboardPath)
```

**IMPORTANT:** Only add the redirect logic if the current page is a generic landing/redirect page. If it already shows dashboard content, do NOT change its content — only add a redirect at the top if appropriate.

### 11.5 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | head -20
```

## Output format required
```
STEP 11 COMPLETE
dashboardRouting.ts created: [YES/NO]
Main dashboard redirect updated: [YES/NO / SKIPPED — already has role routing]
TypeScript errors: [NONE / list]
Role enum values found in schema: [list]
```

## Acceptance Tests
- [ ] `getDashboardPath('CEO')` returns `/assessments/dashboard/ceo`
- [ ] `getDashboardPath(null)` returns individual dashboard
- [ ] No existing dashboard functionality broken

---END STEP 11---


---BEGIN STEP 12---

# STEP 12 — TEAM LEAD DASHBOARD

## Agent operating mode: NEW PAGE + NEW COMPONENTS.

## Purpose
Build the Team Lead dashboard at `/assessments/dashboard/team-lead`. Shows team competency snapshot, top 3 TNI items, and team member list with scores. Uses real data from existing APIs.

## Pre-conditions
- Step 11 completed, routing file exists

## Instructions

### 12.1 — Check existing APIs available
```bash
grep -rn "team\|members\|cohort" apps/portal/app/api/clients --include="*.ts" -l | head -10
```

### 12.2 — Read the existing client dashboard for patterns
```bash
cat apps/portal/app/assessments/clients/\[clientId\]/dashboard/page.tsx 2>/dev/null | head -80
```

### 12.3 — Create the page
Create `apps/portal/app/assessments/dashboard/team-lead/page.tsx`:

This page must:
1. Be a Server Component (fetch data server-side) OR a Client Component with `useSession` — match the project's existing pattern
2. Show a 4-metric summary row:
   - Team average readiness %
   - Count of critical gaps (proficiencyLevel = 1)
   - Highest scoring member name
   - Days until next re-assessment
3. Show a horizontal bar chart of bottom-5 competencies by average score — use the existing chart pattern from the project (check `apps/portal/components/` for chart components)
4. Show top 3 TNI cards — each must show: urgency badge (Critical/High/Medium), title, one-line business consequence
5. Show team member list — name, role, overall score, status badge

Data sources to use:
- `/api/clients/[clientId]/dashboard/stats` for summary metrics
- `/api/clients/[clientId]/analytics/competency-heatmap` for bar chart data
- `/api/member/gap-analysis` or equivalent for TNI items
- `/api/clients/[clientId]/employees` for member list

**Use `clientId` from the session/context — check how existing pages get it.**

Style using existing Tailwind + Shadcn/UI components already in the project. Do not introduce new UI libraries.

### 12.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "team-lead" | head -10
```

## Output format required
```
STEP 12 COMPLETE
Page created at: [path]
Data sources wired: [list endpoints used]
Uses existing chart component: [YES/NO — which one]
TypeScript errors: [NONE / list]
```

## Acceptance Tests
- [ ] Page renders without runtime errors
- [ ] Navigate to `/assessments/dashboard/team-lead` — page loads
- [ ] All 4 metric cards show (may be 0/null with no data — that is acceptable)
- [ ] No hardcoded mock data in the page

---END STEP 12---


---BEGIN STEP 13---

# STEP 13 — DEPARTMENT HEAD DASHBOARD

## Agent operating mode: NEW PAGE.

## Purpose
Build `/assessments/dashboard/dept-head`. Similar to Team Lead but scoped to department, adds culture health metric from SCIP (placeholder if SCIP not yet deployed), and succession gap flag.

## Pre-conditions
- Step 12 completed and tested

## Instructions

Create `apps/portal/app/assessments/dashboard/dept-head/page.tsx`.

This page must show:
1. 4 metrics: Dept readiness index / Role-ready % at L3+ / High-potential count / Culture alignment % (show "Pending SCIP data" if no SCIP scores exist)
2. Domain-level bar chart (5 ADAPT-16 domains, not 16 individual competencies — aggregate by domain)
3. Top 3 TNI cards — same pattern as Step 12 but dept-scoped
4. Succession gap panel: list roles where no internal candidate meets L3+ requirement (query CareerFitScore where fitScore < 75 for senior-level roles — return empty state if no data yet)
5. Top performers list (top 5 by CompetencyScore average)

**Reuse the TNI card component built in Step 12 — do not rebuild it.**

```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "dept-head" | head -10
```

## Acceptance Tests
- [ ] Page renders at `/assessments/dashboard/dept-head`
- [ ] TNI card component reused (not duplicated)
- [ ] Succession panel shows empty state gracefully when no CareerFitScore data exists
- [ ] Domain aggregation logic is correct (group A-01 through A-04 under Domain A, etc.)

---END STEP 13---


---BEGIN STEP 14---

# STEP 14 — L&D DASHBOARD

## Agent operating mode: NEW PAGE.

## Purpose
Build `/assessments/dashboard/ld`. Focuses on programme delivery, ROI tracking, and TNI-to-programme linkage.

## Pre-conditions
- Step 13 completed

## Instructions

Create `apps/portal/app/assessments/dashboard/ld/page.tsx`.

This page must show:
1. 4 metrics: Open TNI items / Active programmes / Avg pre→post delta (from AssessmentDelta — show "No delta data yet" if empty) / Training ROI score
2. Programme progress list — for each active Activity/programme: name, enrolled count, completion %, linked competencies (from ActivityAssessment → AssessmentModel → components)
3. TNI → Programme linkage: show which open TNI items have a linked programme and which do not (gap)
4. SCIP learning style insight panel (placeholder: "SCIP assessment required for learning style data" — wired fully in Step 23)

Key query: `Activity.type = CURRICULUM` or equivalent for training programmes.

```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "\/ld" | head -10
```

## Acceptance Tests
- [ ] Page renders at `/assessments/dashboard/ld`
- [ ] Empty states for delta data and SCIP data are graceful
- [ ] Programme list queries real Activity records

---END STEP 14---


---BEGIN STEP 15---

# STEP 15 — HR / TALENT MANAGEMENT DASHBOARD

## Agent operating mode: NEW PAGE.

## Purpose
Build `/assessments/dashboard/hr`. Full organisation view — all three instrument lenses, talent audit, culture risk flags.

## Pre-conditions
- Step 14 completed

## Instructions

Create `apps/portal/app/assessments/dashboard/hr/page.tsx`.

This page must show:
1. 4 metrics: Workforce Readiness Index (aggregate ADAPT-16 composite — placeholder 0 if no data) / High-potential count (top quartile CompetencyScore) / Culture risk flags (CareerFitScore.gapAnalysis where values misalignment > threshold — placeholder if no SCIP) / Succession coverage %
2. Lens toggle tabs: "RBCA gaps" / "ADAPT-16 readiness" / "SCIP culture" — implemented as client-side tab state, each tab shows a different bar chart
3. Full competency domain bars (organisation-wide averages)
4. Top 3 high-urgency TNI items — organisation-wide
5. Quick people search (reuse existing search component from the project)

**Lens tab state:** Use `useState` for the active lens. The three lens views share the same container — show/hide sections based on active tab.

```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "dashboard/hr" | head -10
```

## Acceptance Tests
- [ ] Page renders at `/assessments/dashboard/hr`
- [ ] Lens tabs switch without page reload
- [ ] SCIP lens shows placeholder gracefully

---END STEP 15---


---BEGIN STEP 16---

# STEP 16 — RECRUITER AND HIRING MANAGER DASHBOARDS

## Agent operating mode: TWO NEW PAGES.

## Purpose
Build recruiter and hiring manager views — these are focused on candidate screening and hire vs develop decisions.

## Pre-conditions
- Step 15 completed

## Instructions

### 16.1 — Recruiter: `/assessments/dashboard/recruiter`
Shows:
1. Metrics: Candidates assessed this month / Shortlisted (CareerFitScore ≥ 75) / Culture fit flags / Avg time to shortlist (placeholder)
2. Open roles list — from existing Role or Project data — each showing pipeline fill %
3. Candidate shortlist — members with CareerFitScore ≥ 75 for an active role, sorted by fitScore desc
4. Culture flags — members with SCIP values misalignment (placeholder if no SCIP)

### 16.2 — Hiring Manager: `/assessments/dashboard/hiring-manager`
Shows:
1. Metrics: Top candidate fit score / Internal promotion candidates count / Hire vs Develop recommendation (logic: if best internal candidate CareerFitScore ≥ 70 → "Develop", else → "Hire") / Team ADAPT-16 average
2. Candidate comparison: top 3 candidates side by side — RBCA fit, ADAPT-16 avg, SCIP values (if available)
3. Internal candidate panel: team members with CareerFitScore ≥ 70 for target role
4. Team dynamics note: SCIP work style clustering (placeholder)

**Both pages must reuse existing Card, Badge, and Table components from the project.**

```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "recruiter\|hiring" | head -10
```

## Acceptance Tests
- [ ] Both pages render without errors
- [ ] Hire vs Develop logic is correct (test with mock CareerFitScore data if needed)
- [ ] Empty states graceful throughout

---END STEP 16---


---BEGIN STEP 17---

# STEP 17 — HR HEAD AND CEO DASHBOARDS

## Agent operating mode: TWO NEW PAGES.

## Purpose
The most senior views — board-ready, strategic, minimal data density, maximum signal-to-noise.

## Pre-conditions
- Step 16 completed

## Instructions

### 17.1 — HR Head: `/assessments/dashboard/hr-head`
Shows:
1. Strategic metrics: Workforce readiness / Critical role succession coverage / Culture health score / L&D ROI
2. Department comparison bar chart — one bar per department showing their ADAPT-16 aggregate
3. Risk dashboard: departments below threshold (< 60 readiness), flagged with action required
4. Top 5 succession-ready employees (highest CareerFitScore for senior roles)
5. Export button: "Download board brief" — triggers report generation (wire to existing `/api/clients/[clientId]/reports/generate`)

### 17.2 — CEO: `/assessments/dashboard/ceo`
**Intentionally minimal.** Shows:
1. Three large numbers only: Future-Readiness Index / Culture Score / Revenue Risk (Medium/Low/High derived from readiness index)
2. 6-month trend sparkline per metric (placeholder line chart — use existing chart component)
3. Department readiness comparison (5 bars, one per department)
4. Two insight cards: biggest risk + biggest opportunity (generated from TNI data)
5. NO competency-level detail — CEOs do not need to see individual scores

```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "hr-head\|ceo" | head -10
```

## Acceptance Tests
- [ ] CEO page has maximum 5 visual elements — no tables, no long lists
- [ ] HR Head export button triggers the existing report API
- [ ] Both pages load in < 2s on local dev

---END STEP 17---


---BEGIN STEP 18---

# STEP 18 — INDIVIDUAL DASHBOARD — 3-LENS REPORT CARD

## Agent operating mode: ENHANCE EXISTING PAGE — additive sections only.

## Purpose
Enhance the existing individual results/dashboard page to show the 3-lens summary (RBCA + ADAPT-16 + SCIP status) at the top. This enhances the existing page — it does NOT replace it.

## Pre-conditions
- Step 17 completed
- Existing individual results page identified and working

## Instructions

### 18.1 — Read the existing page
```bash
find apps/portal/app -name "page.tsx" | xargs grep -l "individual\|results\|dashboard" | grep -v admin | head -5
cat [the individual dashboard/results page]
```

### 18.2 — Add the 3-lens summary component
Create `apps/portal/components/Individual/ThreeLensSummary.tsx`:

```tsx
/**
 * ThreeLensSummary — shows RBCA, ADAPT-16, and SCIP status as three cards
 * SEPL/INT/2026/IMPL-STEPS-01 Step 18
 */
interface LensData {
  rbca?: { score: number; target: number; gaps: number };
  adapt16?: { avgLevel: number; strongDomain: string; weakDomain: string };
  scip?: { hollandCode: string; cognitivePercentile: number } | null;
}

export function ThreeLensSummary({ data }: { data: LensData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* RBCA lens */}
      <div className="border border-emerald-200 rounded-lg p-4 border-t-4 border-t-emerald-500">
        <p className="text-xs font-medium text-emerald-700 mb-2">Role readiness</p>
        <p className="text-2xl font-medium text-emerald-600">
          {data.rbca ? `${data.rbca.score}%` : '—'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.rbca
            ? `vs ${data.rbca.target}% target · ${data.rbca.gaps} gaps`
            : 'Complete RBCA assessment'}
        </p>
      </div>
      {/* ADAPT-16 lens */}
      <div className="border border-violet-200 rounded-lg p-4 border-t-4 border-t-violet-500">
        <p className="text-xs font-medium text-violet-700 mb-2">Future readiness</p>
        <p className="text-2xl font-medium text-violet-600">
          {data.adapt16 ? `L${data.adapt16.avgLevel.toFixed(1)}` : '—'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.adapt16
            ? `Strong: ${data.adapt16.strongDomain} · Gap: ${data.adapt16.weakDomain}`
            : 'Complete ADAPT-16 assessment'}
        </p>
      </div>
      {/* SCIP lens */}
      <div className="border border-orange-200 rounded-lg p-4 border-t-4 border-t-orange-500">
        <p className="text-xs font-medium text-orange-700 mb-2">Career fit</p>
        <p className="text-2xl font-medium text-orange-600">
          {data.scip ? data.scip.hollandCode : '—'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.scip
            ? `Cognitive: ${data.scip.cognitivePercentile}th %ile`
            : 'Take SCIP assessment'}
        </p>
      </div>
    </div>
  );
}
```

### 18.3 — Import and add to existing page
In the existing individual dashboard page, ADD the `<ThreeLensSummary>` component at the TOP of the page content, before existing sections. Do not remove or reorder any existing sections.

Wire data: query `CompetencyScore` for RBCA and ADAPT-16 data. SCIP data is null until Step 22+.

```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "ThreeLensSummary\|Individual" | head -10
```

## Acceptance Tests
- [ ] Three lens cards appear at top of individual dashboard
- [ ] Existing sections below are unchanged
- [ ] Empty states show "Complete X assessment" when data is absent
- [ ] Mobile layout (col-1) works correctly

---END STEP 18---


---BEGIN STEP 19---

# STEP 19 — INDIVIDUAL — CAREER FIT MATCHES SECTION

## Agent operating mode: NEW COMPONENT + ADDITIVE SECTION in existing page.

## Purpose
Add a "Top career matches" section to the individual dashboard, ranked by CareerFitScore. Shows top 3 roles with fit score bar and gap summary.

## Pre-conditions
- Step 18 completed

## Instructions

### 19.1 — Create CareerFitMatches component
Create `apps/portal/components/Individual/CareerFitMatches.tsx`:

```tsx
/**
 * CareerFitMatches — top career role matches from CareerFitScore
 * SEPL/INT/2026/IMPL-STEPS-01 Step 19
 */
interface CareerMatch {
  roleId: string;
  roleName: string;
  fitScore: number;
  scipFit?: number;
  adapt16AvgLevel?: number;
  gapCount?: number;
}

export function CareerFitMatches({ memberId }: { memberId: string }) {
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/career/fit/${memberId}`)
      .then(r => r.json())
      .then(d => { setMatches(d.matches ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [memberId]);

  if (loading) return <div className="h-32 animate-pulse bg-muted rounded-lg" />;
  if (!matches.length) return (
    <div className="text-center py-8 text-muted-foreground text-sm">
      Complete an assessment to see your career fit matches
    </div>
  );

  return (
    <div className="space-y-3">
      {matches.slice(0, 3).map(m => (
        <div key={m.roleId} className="border rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-sm">{m.roleName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {m.gapCount !== undefined ? `${m.gapCount} gaps to close` : ''}
            </p>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${m.fitScore}%`,
                backgroundColor: m.fitScore >= 80 ? '#1D9E75' : m.fitScore >= 65 ? '#BA7517' : '#E24B4A'
              }}
            />
          </div>
          <span className="text-sm font-medium w-10 text-right">{Math.round(m.fitScore)}%</span>
        </div>
      ))}
    </div>
  );
}
```

### 19.2 — Create the API route if it doesn't exist
Check: `find apps/portal/app/api/career -name "*.ts" | xargs grep -l "fit" 2>/dev/null`

If `/api/career/fit/[memberId]` doesn't exist, create it to query `CareerFitScore` and return top 5 by fitScore desc.

### 19.3 — Add section to individual dashboard
Add below the `ThreeLensSummary` component and above existing content:
```tsx
<section>
  <h2 className="text-sm font-medium mb-3">Top career matches</h2>
  <CareerFitMatches memberId={session.user.memberId} />
</section>
```

## Acceptance Tests
- [ ] Section appears in individual dashboard
- [ ] API returns empty array gracefully when no CareerFitScore records exist
- [ ] Fit score bar colour changes correctly at 80/65 thresholds

---END STEP 19---


---BEGIN STEP 20---

# STEP 20 — INDIVIDUAL — PROGRESS TIMELINE

## Agent operating mode: NEW COMPONENT + ADDITIVE SECTION.

## Purpose
Add a chronological career progress timeline showing all assessment events with delta badges. This is the lifelong tracking feature.

## Pre-conditions
- Step 19 completed

## Instructions

### 20.1 — Create ProgressTimeline component
Create `apps/portal/components/Individual/ProgressTimeline.tsx`:

The component should:
1. Query all `MemberAssessment` records for the member (via API), ordered by `completedAt` asc
2. For each completed assessment, show: date, assessment type, overall score, any `AssessmentDelta` records linked to it
3. Delta records show "+N level" badges in green
4. Baseline assessments marked with a special indicator
5. Max 6 events shown by default with "Show all" expand

Create the supporting API route at `/api/member/[memberId]/timeline` that returns:
```typescript
// MemberAssessment records with linked CompetencyScore averages and AssessmentDelta records
```

Keep the component simple — vertical list with left border line, dots, and text. No complex chart libraries.

### 20.2 — Add to individual dashboard
Add as the third section, after career fit matches.

## Acceptance Tests
- [ ] Timeline renders correctly with 1+ completed assessments
- [ ] Empty state: "Complete your first assessment to start your career timeline"
- [ ] Delta badges only appear when AssessmentDelta records exist
- [ ] "Show all" expand works correctly

---END STEP 20---


---BEGIN STEP 21---

# STEP 21 — INDIVIDUAL — AI CAREER COACH CHAT

## Agent operating mode: NEW COMPONENT.

## Purpose
Add the AI career coach chat panel at the bottom of the individual dashboard. Uses the Claude API with the user's assessment profile as context.

## Pre-conditions
- Step 20 completed
- Anthropic SDK already integrated in the project (verify: `grep -rn "anthropic\|ANTHROPIC_API_KEY" apps/portal --include="*.ts" -l | head -3`)

## Instructions

### 21.1 — Create API route
Create `apps/portal/app/api/career/coach/route.ts`:

```typescript
// Career coach API — POST { memberId, message, conversationHistory }
// Returns { response: string }
// Uses member's CompetencyScore data as context

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const { memberId, message, conversationHistory = [] } = await req.json();

  // Fetch member's top competency scores for context (max 5 to limit tokens)
  const scores = await prisma.competencyScore.findMany({
    where: { memberAssessment: { member: { id: memberId } } },
    orderBy: { proficiencyLevel: 'asc' },
    take: 5,
    select: { competencyCode: true, proficiencyLevel: true, assessmentType: true },
  });

  const careerFit = await prisma.careerFitScore.findMany({
    where: { memberId },
    orderBy: { fitScore: 'desc' },
    take: 3,
    select: { role: { select: { name: true } }, fitScore: true },
  });

  const context = scores.length
    ? `Member profile: lowest competencies: ${scores.map(s => `${s.competencyCode}=L${s.proficiencyLevel}`).join(', ')}. Top career fits: ${careerFit.map(c => `${c.role.name} (${Math.round(c.fitScore)}%)`).join(', ')}.`
    : 'Member has not yet completed an assessment.';

  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: `You are a concise, encouraging career coach. You have access to this person's assessment data: ${context}. Give specific, actionable advice in 2-3 sentences max. Never ask for more information — work with what you have.`,
    messages: [
      ...conversationHistory.slice(-4),  // Keep last 4 for context, limit tokens
      { role: 'user', content: message },
    ],
  });

  const text = response.content.find(b => b.type === 'text')?.text ?? '';
  return Response.json({ response: text });
}
```

### 21.2 — Create CareerCoachChat component
Create `apps/portal/components/Individual/CareerCoachChat.tsx` — a simple chat UI:
- Shows the AI coach's opening message with 3 suggested prompt chips
- Text input for custom questions
- Response displays inline (no full conversation thread needed for MVP)
- Max 3 exchanges before showing "Start a new conversation" — prevents runaway token usage

### 21.3 — Add to individual dashboard
Add as the last section.

## Acceptance Tests
- [ ] Chat component renders with 3 suggested prompts
- [ ] Sending a message returns an AI response
- [ ] Token guard: after 3 exchanges, new conversation prompt appears
- [ ] Empty context (no assessments) handled gracefully by the API

---END STEP 21---


---BEGIN STEP 22---

# STEP 22 — SCIP INSTRUMENT CONFIG

## Agent operating mode: SCHEMA ENUM + SEED DATA.

## Purpose
Add `SCIP` as a valid `sourceType` value and create the seed data structure for the SCIP assessment instrument. No question content yet — just the structural configuration.

## Pre-conditions
- Step 21 completed

## Instructions

### 22.1 — Add SCIP to sourceType enum
Find the enum that contains `ROLE_BASED` and `COMPETENCY_BASED` in both schemas:
```bash
grep -n "ROLE_BASED\|sourceType\|AssessmentSourceType" packages/db-assessments/prisma/schema.prisma | head -10
```

Add `SCIP` and `ADAPT_16` values to that enum if not already present. This is additive — existing values unchanged.

### 22.2 — Create SCIP instrument seed file
Create `apps/portal/prisma/seeds/scip-instrument.ts`:

```typescript
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
```

**This seed file is NOT executed in this step. It is created for review.**

### 22.3 — Create SCIPDimensionScore model (additive)
Add to both schemas:

```prisma
// SCIPDimensionScore — SEPL/INT/2026/IMPL-STEPS-01 Step 22
model SCIPDimensionScore {
  id                 String           @id @default(cuid())
  memberAssessmentId String
  memberAssessment   MemberAssessment @relation(fields: [memberAssessmentId], references: [id], onDelete: Cascade)
  dimension          String           // COG | OCEAN | RIASEC | EI | VALUES
  rawScore           Float
  normalisedScore    Float?
  percentileRank     Int?
  subScores          Json             @default("{}")
  createdAt          DateTime         @default(now())

  @@unique([memberAssessmentId, dimension])
  @@index([memberAssessmentId])
}
```

Add back-reference to MemberAssessment: `scipDimensionScores SCIPDimensionScore[]`

Run `prisma validate` on both schemas and migrate.

## Acceptance Tests
- [ ] Both schemas validate
- [ ] Migration applied successfully
- [ ] `SCIPDimensionScore` table exists in DB
- [ ] Seed file created but NOT yet run

---END STEP 22---


---BEGIN STEP 23---

# STEP 23 — SCIP ASSESSMENT RUNNER WIRING

## Agent operating mode: ADDITIVE — existing runner + new SCIP scoring path.

## Purpose
When an assessment with `sourceType = SCIP` completes, route it to the SCIP dimension scoring service instead of (or in addition to) the RBCA competency scoring service.

## Pre-conditions
- Step 22 completed, SCIP enum value added

## Instructions

### 23.1 — Create SCIP scoring service
Create `apps/portal/lib/scoring/computeSCIPScores.ts`:

This service:
1. Takes a `memberAssessmentId`
2. Reads `ComponentQuestionResponse` records grouped by component code (SCIP-COG, SCIP-OCEAN, etc.)
3. Computes raw dimension scores using simple weighted average per dimension
4. Derives the RIASEC three-letter code from SCIP-RIASEC forced-choice results
5. Upserts `SCIPDimensionScore` records

Initial implementation uses raw score averages — normative calibration added later when data accumulates.

### 23.2 — Update completion route
In the same completion route updated in Step 8, add SCIP routing:

```typescript
// Existing code from Step 8 remains unchanged
// Add below it:

if (assessmentModel?.sourceType === 'SCIP') {
  computeSCIPScores(memberAssessmentId)
    .catch(err => console.error('[SCIPScore] Async compute error:', err));
}
```

Read `assessmentModel?.sourceType` from the existing completion route context — it should already be available.

### 23.3 — Update CareerFitScore computation to include SCIP
In `computeAndStoreCompetencyScores.ts` from Step 7, add a post-scoring step:

After storing `CompetencyScore` records, if SCIP dimension scores exist for this member, trigger a CareerFitScore recomputation that combines all available instrument data.

Create a separate `computeCareerFitScores.ts` service that:
1. Reads all `CompetencyScore` for the member (ADAPT-16 + RBCA)
2. Reads `SCIPDimensionScore` for the member
3. For each `Role` in the system (use the existing Role + RoleCompetency tables)
4. Computes a weighted fit score
5. Upserts `CareerFitScore` records

## Acceptance Tests
- [ ] Completing a SCIP-type assessment triggers `computeSCIPScores` (verify in server logs)
- [ ] `SCIPDimensionScore` records created after SCIP assessment completion
- [ ] RBCA assessments still trigger the original `computeAndStoreCompetencyScores` (no regression)
- [ ] TypeScript passes

---END STEP 23---


---BEGIN STEP 24---

# STEP 24 — SCIP DIMENSION SCORES IN INDIVIDUAL DASHBOARD

## Agent operating mode: ENHANCE EXISTING COMPONENTS.

## Purpose
Wire real SCIP data into the ThreeLensSummary, CareerFitMatches, and CareerCoachChat components built in Steps 18–21.

## Pre-conditions
- Step 23 completed

## Instructions

### 24.1 — Update ThreeLensSummary data query
In the individual dashboard page, update the SCIP lens data query:

```typescript
const scipScores = await prisma.sCIPDimensionScore.findMany({
  where: { memberAssessment: { member: { id: memberId } } },
  orderBy: { createdAt: 'desc' },
  take: 5,
});

// Extract RIASEC code from dimension scores
const riasecScore = scipScores.find(s => s.dimension === 'RIASEC');
const cogScore = scipScores.find(s => s.dimension === 'COG');

const scipData = riasecScore ? {
  hollandCode: (riasecScore.subScores as any).hollandCode ?? '???',
  cognitivePercentile: cogScore?.percentileRank ?? 0,
} : null;
```

### 24.2 — Update CareerCoachChat context
In the coach API route from Step 21, add SCIP dimension data to the context string:
```typescript
const scipData = await prisma.sCIPDimensionScore.findMany({ ... });
// Add to context string: "Personality: [OCEAN top traits]. Career interests: [RIASEC code]."
```

### 24.3 — Add SCIP insights to career fit page
When SCIP data is available, show the RIASEC cluster description alongside career fit matches.

## Acceptance Tests
- [ ] SCIP lens shows real Holland code when SCIP data exists
- [ ] SCIP lens shows "Take SCIP assessment" when no data
- [ ] AI coach context includes SCIP personality data when available
- [ ] TypeScript passes

---END STEP 24---


---BEGIN STEP 25---

# STEP 25 — FUTURE INTELLIGENCE SIGNAL CARD

## Agent operating mode: NEW COMPONENT.

## Purpose
Add the "Future intelligence" panel to the individual dashboard — AI-generated career shift signals based on profile + market trends. This is the roadmap feature, initially using Claude API with curated trend prompts.

## Pre-conditions
- Step 24 completed

## Instructions

### 25.1 — Create the API route
Create `apps/portal/app/api/career/future-signals/route.ts`:

```typescript
// POST { memberId }
// Returns up to 3 forward-looking career intelligence signals
// Backed by Claude API with member profile context + curated trend data

const MARKET_TRENDS_CONTEXT = `
Current job market signals (India, 2026):
- AI + Product Management convergence: 40% salary premium for AI-fluent PMs
- GCC expansion: 200+ new GCCs planned, highest demand in data, cloud, cybersecurity
- Domain D (Digital Fluency) is the #1 skill gap across industries
- Leadership roles requiring EI scores are 34% higher paid than technical-equivalent
- L&D and talent roles growing 28% YoY in GCC sector
`;
// In future: replace with live API feed or database of trends

// Generate signals using member's profile + trends
```

The prompt instructs Claude to return a JSON array of 2–3 signals, each with:
- `timeframe`: "6 months" / "18 months" / "3 years"
- `urgency`: "opportunity" / "caution" / "watch"
- `headline`: 10 words max
- `insight`: 2 sentences max, specific to the profile

### 25.2 — Create FutureIntelligence component
Create `apps/portal/components/Individual/FutureIntelligence.tsx`:

Simple component showing 2–3 signal cards. Each card has:
- Left border colour: green (opportunity), amber (caution), violet (watch)
- Timeframe badge
- Headline in bold
- Insight text
- "Learn more" → `sendPrompt` equivalent (triggers the AI chat)

### 25.3 — Add to individual dashboard
Add as the section BEFORE the AI Career Coach Chat.

### 25.4 — Cache signals to avoid repeated API calls
Use a simple 24-hour TTL: store generated signals in `Member.careerFormData` or a new `CareerSignalCache` field rather than calling Claude on every page load.

## Output format required
```
STEP 25 COMPLETE
API route created: [YES/NO]
Component created: [YES/NO]
Caching implemented: [YES/NO — method used]
TypeScript errors: [NONE / list]
```

## Acceptance Tests
- [ ] Signals load on individual dashboard (may take 2–3 seconds first load)
- [ ] Cached on subsequent loads (verify no API call on reload within 24h)
- [ ] Empty graceful if Claude API returns malformed response
- [ ] Timeframe and urgency correctly displayed

---END STEP 25---


---

## MASTER ACCEPTANCE CHECKLIST

Before considering the full implementation series complete, verify all of the following:

**Schema integrity:**
- [ ] `prisma validate` passes on both db-assessments and db-core
- [ ] All three new tables exist: CompetencyScore, AssessmentDelta, CareerFitScore, SCIPDimensionScore
- [ ] No existing tables were modified (column additions only)
- [ ] No migration has any DROP or ALTER TYPE statements

**Scoring pipeline:**
- [ ] Completing an RBCA assessment creates CompetencyScore records
- [ ] Completing an ADAPT-16 assessment creates CompetencyScore records with assessmentType=ADAPT_16
- [ ] Completing a SCIP assessment creates SCIPDimensionScore records
- [ ] CareerFitScore records are computed after any assessment completes

**Dashboard routing:**
- [ ] Login as a Team Lead → Team Lead dashboard appears
- [ ] Login as CEO → CEO dashboard appears (not Team Lead view)
- [ ] Login as Individual → Individual dashboard appears
- [ ] Unknown role → Individual dashboard (fallback)

**Individual dashboard:**
- [ ] Three-lens summary shows all three cards
- [ ] Career fit matches show ranked roles
- [ ] Progress timeline shows assessment history
- [ ] AI coach responds to messages
- [ ] Future signals load and cache

**No regression:**
- [ ] Existing RBCA assessment flow unchanged
- [ ] Existing results page still works
- [ ] Existing admin dashboard unchanged
- [ ] All existing API routes return same responses as before

---

*SEPL/INT/2026/IMPL-STEPS-01 | April 2026 | STRICTLY CONFIDENTIAL*
*Total steps: 25 | Estimated sessions: 25–30 | Estimated calendar time: 6–8 weeks at 1 step/day*
