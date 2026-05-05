# SUDAKSHA PLATFORM — PHASE 3: TRAINING DELIVERY ASSESSMENT SYSTEM
## Reference: SEPL/INT/2026/IMPL-PHASE3-01
## Prerequisite: SEPL/INT/2026/IMPL-STEPS-01 (Phase 1 ✅) + SEPL/INT/2026/IMPL-GAPS-01 (Phase 2 ✅)
## For: VS Code Claude Code Agent (CLI)
## Date: April 2026 | STRICTLY CONFIDENTIAL

---

## WHAT THIS PHASE BUILDS

The Training Delivery Assessment System (TDAS) is SEPL's fourth instrument type,
distinct from RBCA, ADAPT-16, and SCIP. It operates during live training
delivery — daily, per-module, per-class-section. Key properties:

- Sessions are owned by the SEPL Ops/Delivery team OR the trainer directly
- Questions are uploaded per module by the ops team or trainer
- Questions are randomly selected per session to prevent item familiarity
- Anti-cheat is proctoring-in-live-class context (not browser lockdown)
- Patent-required features (bias detection, normative calibration, delta)
  apply to TDAS assessments using the Phase 2 engines already built
- Sudaksha Observer role: full cross-tenant read + write access to ALL client
  sessions — highest privilege tier in the platform
- Trainer role: scoped to their own assigned clients/cohorts only
- Reporting flows upward: Trainer → Ops/Delivery team → Client

---

## HOW TO USE THIS DOCUMENT

Same rules as Phase 1 and Phase 2. Each STEP is standalone.
Copy only the content between `---BEGIN STEP T{n}---` and `---END STEP T{n}---`.
Complete acceptance tests before proceeding.
Type `STOP — stay in scope` if the agent drifts.

---

## STEP SEQUENCE OVERVIEW

| Step | Title | Touches | Risk |
|---|---|---|---|
| T1 | Orientation — audit existing training schema | Read-only | Zero |
| T2 | TrainingSession model + TrainingSessionQuestion | Schema additive | Low |
| T3 | TrainingSessionResponse + TrainingSessionResult | Schema additive | Low |
| T4 | SUDAKSHA_OBSERVER + TRAINER roles — RBAC configuration | Additive | Medium |
| T5 | Migrate all Phase 3 schema additions | DB only | Medium |
| T6 | Question bank upload service | New file | Low |
| T7 | Randomised question selection engine | New file | Low |
| T8 | Session start + response submission API | New routes | Medium |
| T9 | Session completion + Phase 2 scoring wire-up | Additive | Medium |
| T10 | Trainer dashboard — session management | New page | Low |
| T11 | Trainer dashboard — live session view | New page | Low |
| T12 | Trainer dashboard — session results + class report | New page | Low |
| T13 | Ops/Delivery team dashboard | New page | Low |
| T14 | Sudaksha Observer dashboard — cross-tenant view | New page | High |
| T15 | Sudaksha Observer — client drill-down + trainer monitoring | New page | Medium |
| T16 | Participant session UI — take assessment | New page | Low |
| T17 | Real-time session state — polling or SSE | New route + component | Medium |
| T18 | Module question bank admin UI | New page | Low |
| T19 | Session report page — participant + class | New pages | Low |
| T20 | Wire Phase 2 bias detection to TDAS sessions | Additive | Low |
| T21 | Wire Phase 2 normative calibration to TDAS | Additive | Low |
| T22 | Wire Phase 2 AssessmentDelta to TDAS | Additive | Low |
| T23 | TDAS anti-cheat — response-time flagging for live sessions | New service | Low |
| T24 | TDAS reporting — WRI impact of training sessions | Additive | Low |
| T25 | Phase 3 master validation | Read-only | Zero |

---

---BEGIN STEP T1---

# STEP T1 — ORIENTATION: AUDIT EXISTING TRAINING SCHEMA (READ-ONLY)

## Agent operating mode: READ-ONLY. Write nothing.

## Purpose
Before building anything, confirm the exact state of the existing
Activity/trainer infrastructure that Phase 3 will extend. This is
the decision gate for every subsequent step.

## Pre-conditions
- Phase 1 (Steps 1–25) complete ✅
- Phase 2 (Steps G1–G20) complete ✅

## Instructions

```bash
# 1. What training-related models already exist?
grep -n "Trainer\|Activity\|ActivityMember\|ActivityAssessment\|TrainingSession\|BOOTCAMP\|CURRICULUM" \
  packages/db-assessments/prisma/schema.prisma | head -40

grep -n "Trainer\|Activity\|ActivityMember\|BOOTCAMP\|CURRICULUM" \
  packages/db-core/prisma/schema.prisma | head -40

# 2. What trainer-related API routes exist?
find apps/portal/app/api -type d -name "trainers" | head -5
find apps/portal/app/api -type d -name "training" | head -5
ls apps/portal/app/api/trainers 2>/dev/null || echo "No trainers route"

# 3. What trainer-related admin pages exist?
find apps/portal/app -path "*admin*trainer*" -name "*.tsx" | head -5
find apps/portal/app -path "*trainer*" -name "*.tsx" | head -10

# 4. What roles currently exist?
grep -n "TRAINER\|OBSERVER\|SUDAKSHA\|MemberRole\|UserRole" \
  packages/db-assessments/prisma/schema.prisma | head -20

# 5. What is the Activity model structure?
grep -n "model Activity" packages/db-assessments/prisma/schema.prisma -A 30 | head -35

# 6. Does TrainingSession exist anywhere?
grep -rn "TrainingSession" packages/ --include="*.prisma" | head -5
grep -rn "TrainingSession" apps/portal --include="*.ts" | head -5
```

## Output format required
```
T1 FACT-SHEET
Trainer model in db-assessments: [YES/NO — field names]
Activity model type enum values: [list]
Trainer-related API routes: [list or NONE]
Trainer admin pages: [list or NONE]
TRAINER role in enum: [YES/NO]
SUDAKSHA_OBSERVER role in enum: [YES/NO]
TrainingSession model: [YES/NO — if YES describe]
ActivityAssessment links Activity to: [describe]
Key FK: Activity links to Tenant/Client via: [field name]
```

## Acceptance Tests
- [ ] Fact-sheet produced with no UNKNOWN entries
- [ ] No files written or modified

---END STEP T1---


---BEGIN STEP T2---

# STEP T2 — TrainingSession + TrainingSessionQuestion SCHEMA

## Agent operating mode: SCHEMA EDIT — additive only.

## Purpose
Add the two foundational models for the Training Delivery Assessment System.
TrainingSession is the container for one assessment event (one class on one day
for one module). TrainingSessionQuestion holds the question bank per module,
from which questions are randomly selected per session.

## Pre-conditions
- Step T1 completed. Fact-sheet confirms TrainingSession does NOT exist.
- Activity model confirmed present in db-assessments.

## Instructions

### T2.1 — Read schema tails first
```bash
tail -50 packages/db-assessments/prisma/schema.prisma
grep -n "model Activity " packages/db-assessments/prisma/schema.prisma -A 5 | head -10
```

### T2.2 — Append to db-assessments schema

```prisma
// ── PHASE 3: TRAINING DELIVERY ASSESSMENT SYSTEM ────────────────────────────
// SEPL/INT/2026/IMPL-PHASE3-01 Step T2
// Owner: SEPL Ops/Delivery Team or Trainer
// Instrument type: TDAS (Training Delivery Assessment System)

model TrainingSession {
  id                    String                    @id @default(cuid())
  activityId            String
  activity              Activity                  @relation("ActivityTrainingSessions", fields: [activityId], references: [id])
  tenantId              String
  clientId              String?
  trainerId             String?
  moduleTitle           String
  sessionDate           DateTime
  sessionNumber         Int                       @default(1)
  totalParticipants     Int                       @default(0)
  questionCount         Int                       @default(10)
  durationMinutes       Int                       @default(10)
  status                String                    @default("DRAFT")
  // DRAFT | ACTIVE | COMPLETED | CANCELLED
  randomSeed            String?                   // stored so same session can be reproduced
  startedAt             DateTime?
  completedAt           DateTime?
  createdBy             String                    // memberId of ops user or trainer
  createdAt             DateTime                  @default(now())
  updatedAt             DateTime                  @updatedAt

  questions             TrainingSessionQuestion[]
  responses             TrainingSessionResponse[]
  results               TrainingSessionResult[]

  @@index([activityId])
  @@index([tenantId])
  @@index([trainerId])
  @@index([sessionDate])
  @@index([status])
}

model TrainingSessionQuestion {
  id                    String           @id @default(cuid())
  activityId            String           // scoped to module — same question bank feeds all sessions
  activity              Activity         @relation("ActivityQuestionBank", fields: [activityId], references: [id])
  questionText          String
  questionType          String           @default("MULTIPLE_CHOICE")
  // MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | RATING
  options               Json             @default("[]")
  // Array of { id, text, isCorrect, competencyCode }
  correctOptionId       String?
  competencyCode        String?          // links to ADAPT-16 competency code
  difficultyLevel       Int              @default(2)
  // 1=Easy 2=Medium 3=Hard
  targetCohort          String?          // null=all | STUDENT | PROFESSIONAL | CORPORATE
  isActive              Boolean          @default(true)
  uploadedBy            String           // memberId of ops user or trainer
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  sessionSelections     TrainingSessionResponse[]

  @@index([activityId])
  @@index([competencyCode])
  @@index([isActive])
}
```

### T2.3 — Add back-references to Activity
Find the `Activity` model closing `}`. Before it, add:
```prisma
  trainingSessions      TrainingSession[]         @relation("ActivityTrainingSessions")
  questionBank          TrainingSessionQuestion[]  @relation("ActivityQuestionBank")
```

**BEFORE ADDING: check these don't already exist:**
```bash
grep -n "trainingSessions\|questionBank" packages/db-assessments/prisma/schema.prisma | head -5
```

### T2.4 — Mirror to db-core
Append identical models to `packages/db-core/prisma/schema.prisma`.
Add same back-references to Activity in db-core.

### T2.5 — Validate both
```bash
cd packages/db-assessments && npx prisma validate 2>&1
cd ../db-core && npx prisma validate 2>&1
```

## Output format required
```
T2 COMPLETE
TrainingSession added: db-assessments [YES/NO] db-core [YES/NO]
TrainingSessionQuestion added: db-assessments [YES/NO] db-core [YES/NO]
Back-references added to Activity: [YES/NO]
prisma validate db-assessments: [PASS/FAIL]
prisma validate db-core: [PASS/FAIL]
```

## Acceptance Tests
- [ ] Both schemas validate
- [ ] `grep -c "TrainingSession" packages/db-assessments/prisma/schema.prisma` > 4
- [ ] No existing models modified

---END STEP T2---


---BEGIN STEP T3---

# STEP T3 — TrainingSessionResponse + TrainingSessionResult SCHEMA

## Agent operating mode: SCHEMA EDIT — additive only.

## Purpose
Add the response and result models. TrainingSessionResponse captures each
participant's answer to each question in a session. TrainingSessionResult
is the aggregated per-participant score for a session — the output that
feeds into the Phase 2 CompetencyScore and BiasFlag engines.

## Pre-conditions
- Step T2 completed, both schemas validate.

## Instructions

### T3.1 — Read schema tails
```bash
tail -30 packages/db-assessments/prisma/schema.prisma
grep -n "model Member " packages/db-assessments/prisma/schema.prisma | head -3
```

### T3.2 — Append to db-assessments

```prisma
// SEPL/INT/2026/IMPL-PHASE3-01 Step T3

model TrainingSessionResponse {
  id                    String                   @id @default(cuid())
  sessionId             String
  session               TrainingSession          @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  questionId            String
  question              TrainingSessionQuestion  @relation(fields: [questionId], references: [id])
  memberId              String
  member                Member                   @relation("MemberTrainingResponses", fields: [memberId], references: [id])
  selectedOptionId      String?
  shortAnswerText       String?
  isCorrect             Boolean?
  pointsAwarded         Float                    @default(0)
  responseTimeMs        Int?                     // milliseconds — fed into Phase 2 time-anomaly detection
  submittedAt           DateTime                 @default(now())

  @@unique([sessionId, questionId, memberId])
  @@index([sessionId])
  @@index([memberId])
  @@index([questionId])
}

model TrainingSessionResult {
  id                    String           @id @default(cuid())
  sessionId             String
  session               TrainingSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  memberId              String
  member                Member           @relation("MemberTrainingResults", fields: [memberId], references: [id])
  totalQuestions        Int
  correctAnswers        Int
  rawScore              Float            // percentage 0–100
  normalisedScore       Float?           // after Phase 2 normative calibration
  proficiencyLevel      Int?             // 1–4 after calibration
  percentileRank        Int?
  biasFlags             Json             @default("[]")  // stored from Phase 2 BiasFlag engine
  deltaFromLastSession  Float?           // vs previous session for same activity
  competencyScoreIds    String[]         @default([])    // linked CompetencyScore IDs
  completedAt           DateTime         @default(now())
  createdAt             DateTime         @default(now())

  @@unique([sessionId, memberId])
  @@index([sessionId])
  @@index([memberId])
}
```

### T3.3 — Add back-references to Member
In the `Member` model, before closing `}`, add:
```prisma
  trainingResponses     TrainingSessionResponse[] @relation("MemberTrainingResponses")
  trainingResults       TrainingSessionResult[]   @relation("MemberTrainingResults")
```

**Check first:**
```bash
grep -n "trainingResponses\|trainingResults" packages/db-assessments/prisma/schema.prisma | head -5
```

### T3.4 — Add back-references to TrainingSession
In `TrainingSession`, `responses` and `results` relations are already declared.
Confirm they match the field names in these new models.

### T3.5 — Mirror to db-core, validate both
```bash
cd packages/db-assessments && npx prisma validate 2>&1
cd ../db-core && npx prisma validate 2>&1
```

## Output format required
```
T3 COMPLETE
TrainingSessionResponse added: db-assessments [YES/NO] db-core [YES/NO]
TrainingSessionResult added: db-assessments [YES/NO] db-core [YES/NO]
Member back-references added: [YES/NO]
Both schemas validate: [YES/NO]
```

## Acceptance Tests
- [ ] Both schemas validate with no errors
- [ ] `grep -c "TrainingSessionResult" packages/db-assessments/prisma/schema.prisma` > 3
- [ ] No existing models modified

---END STEP T3---


---BEGIN STEP T4---

# STEP T4 — RBAC: SUDAKSHA_OBSERVER + TRAINER ROLE CONFIGURATION

## Agent operating mode: SCHEMA ADDITIVE + ONE CONFIG FILE.

## Purpose
The Sudaksha Observer role requires full cross-tenant read+write access — the
highest privilege tier in the platform. The Trainer role is scoped to their
assigned clients only. This step configures both in the RBAC layer.

## Pre-conditions
- Step T3 completed.
- T1 confirmed current state of role enum.

## Instructions

### T4.1 — Check current role enum
```bash
grep -n "TRAINER\|OBSERVER\|SUDAKSHA\|enum.*Role" \
  packages/db-assessments/prisma/schema.prisma | head -20
```

### T4.2 — Add roles to enum (if not present)
Find the role enum (likely `MemberRole` or `UserRole`).
**Additively** add the following values if they are absent:

```prisma
  TRAINER
  SUDAKSHA_OBSERVER
  SUDAKSHA_ADMIN
  OPS_DELIVERY
```

Do NOT modify any existing enum value.

### T4.3 — Update dashboard routing
In `apps/portal/lib/dashboardRouting.ts` (built in Phase 1 Step 11),
add the new role mappings:

```typescript
  TRAINER:              '/assessments/dashboard/trainer',
  SUDAKSHA_OBSERVER:    '/assessments/dashboard/observer',
  SUDAKSHA_ADMIN:       '/assessments/dashboard/observer',
  OPS_DELIVERY:         '/assessments/dashboard/trainer',
```

### T4.4 — Create RBAC permission matrix file
Create `apps/portal/lib/permissions/trainingPermissions.ts`:

```typescript
/**
 * Training Delivery Assessment System — RBAC Permission Matrix
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T4
 *
 * SUDAKSHA_OBSERVER: full cross-tenant read + write on all TDAS resources
 * TRAINER: scoped to own assigned clients + cohorts only
 * OPS_DELIVERY: scoped to all sessions within their assigned clients
 */

export type TDASPermission =
  | 'session:create'
  | 'session:activate'
  | 'session:read'
  | 'session:read_all_tenants'
  | 'session:write_all_tenants'
  | 'questions:upload'
  | 'questions:read'
  | 'results:read'
  | 'results:read_all_tenants'
  | 'participant:manage';

const ROLE_PERMISSIONS: Record<string, TDASPermission[]> = {
  SUDAKSHA_OBSERVER: [
    'session:create',
    'session:activate',
    'session:read',
    'session:read_all_tenants',
    'session:write_all_tenants',
    'questions:upload',
    'questions:read',
    'results:read',
    'results:read_all_tenants',
    'participant:manage',
  ],
  SUDAKSHA_ADMIN: [
    'session:create',
    'session:activate',
    'session:read',
    'session:read_all_tenants',
    'session:write_all_tenants',
    'questions:upload',
    'questions:read',
    'results:read',
    'results:read_all_tenants',
    'participant:manage',
  ],
  OPS_DELIVERY: [
    'session:create',
    'session:activate',
    'session:read',
    'questions:upload',
    'questions:read',
    'results:read',
    'participant:manage',
  ],
  TRAINER: [
    'session:create',
    'session:activate',
    'session:read',
    'questions:upload',
    'questions:read',
    'results:read',
  ],
};

export function hasPermission(role: string, permission: TDASPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isCrossTenantRole(role: string): boolean {
  return role === 'SUDAKSHA_OBSERVER' || role === 'SUDAKSHA_ADMIN';
}
```

### T4.5 — Validate and TypeScript check
```bash
cd packages/db-assessments && npx prisma validate 2>&1
cd apps/portal && npx tsc --noEmit 2>&1 | grep "trainingPermissions\|dashboardRouting" | head -10
```

## Output format required
```
T4 COMPLETE
TRAINER role: [already existed / added]
SUDAKSHA_OBSERVER role: [already existed / added]
OPS_DELIVERY role: [already existed / added]
Dashboard routing updated: [YES/NO]
trainingPermissions.ts created: [YES/NO]
TypeScript errors: [NONE / list]
```

## Acceptance Tests
- [ ] `hasPermission('SUDAKSHA_OBSERVER', 'session:read_all_tenants')` returns `true`
- [ ] `hasPermission('TRAINER', 'session:read_all_tenants')` returns `false`
- [ ] `isCrossTenantRole('SUDAKSHA_OBSERVER')` returns `true`
- [ ] `isCrossTenantRole('TRAINER')` returns `false`
- [ ] Dashboard routing: SUDAKSHA_OBSERVER → `/assessments/dashboard/observer`

---END STEP T4---


---BEGIN STEP T5---

# STEP T5 — MIGRATE ALL PHASE 3 SCHEMA ADDITIONS

## Agent operating mode: MIGRATION EXECUTION.

## ⚠️ BINU MUST REVIEW THE MIGRATION SQL BEFORE THIS RUNS ⚠️

## Purpose
Apply all Phase 3 schema additions (T2, T3, T4) to both databases.

## Pre-conditions
- Steps T2, T3, T4 all completed. Both schemas validate.
- Binu has reviewed `git diff packages/` — confirms additive-only changes.
- Development database only — not production.

## Instructions

### T5.1 — Dry-run first (create only, no apply)
```bash
cd packages/db-assessments
npx prisma migrate dev --name "phase3_training_delivery" --create-only
```

Review the generated SQL. It should contain ONLY:
- `CREATE TABLE "TrainingSession"`
- `CREATE TABLE "TrainingSessionQuestion"`
- `CREATE TABLE "TrainingSessionResponse"`
- `CREATE TABLE "TrainingSessionResult"`
- `ALTER TABLE "Activity" ADD COLUMN` (back-references)
- `ALTER TABLE "Member" ADD COLUMN` (back-references)
- `CREATE INDEX` statements
- `CREATE UNIQUE INDEX` statements

**If any DROP or ALTER COLUMN type-change appears: STOP and report.**

### T5.2 — Apply db-assessments
```bash
cd packages/db-assessments
npx prisma migrate dev --name "phase3_training_delivery"
```

### T5.3 — Apply db-core
```bash
cd packages/db-core
npx prisma migrate dev --name "phase3_training_delivery"
```

### T5.4 — Regenerate Prisma clients
```bash
cd packages/db-assessments && npx prisma generate
cd ../db-core && npx prisma generate
```

### T5.5 — Verify tables
```bash
cd packages/db-assessments
npx prisma db execute --stdin <<EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'TrainingSession',
  'TrainingSessionQuestion',
  'TrainingSessionResponse',
  'TrainingSessionResult'
);
EOF
```

## Output format required
```
T5 COMPLETE
Migration SQL reviewed — any DROP found: [YES — STOP / NO — safe]
db-assessments migration: [SUCCESS / FAILED]
db-core migration: [SUCCESS / FAILED]
Prisma clients regenerated: [YES/NO]
4 tables confirmed in DB: [YES/NO]
```

## Acceptance Tests
- [ ] Both migrations applied with no errors
- [ ] All 4 new tables visible in database
- [ ] Existing tables unaffected
- [ ] `npx prisma studio` — can see all 4 new tables

---END STEP T5---


---BEGIN STEP T6---

# STEP T6 — QUESTION BANK UPLOAD SERVICE

## Agent operating mode: NEW FILE only.

## Purpose
Create the service that allows ops/delivery team or trainers to upload
questions for a module. Questions are stored against the Activity (module),
not against a specific session — they form the pool from which sessions draw.
Supports bulk upload from CSV/JSON and individual creation via API.

## Pre-conditions
- Step T5 completed. All tables exist.

## Instructions

### T6.1 — Read context
```bash
grep -n "componentQuestion\|ComponentQuestion\|questionType" \
  packages/db-assessments/prisma/schema.prisma | head -20
cat apps/portal/lib/prisma.ts | head -10
```

### T6.2 — Create question upload service
Create `apps/portal/lib/training/questionBankService.ts`:

```typescript
/**
 * Training Question Bank Service
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T6
 *
 * Manages the question pool for each training module (Activity).
 * Questions belong to an Activity (module), not to a specific session.
 * Trainers and Ops team upload questions; sessions randomly draw from the pool.
 */
import { prisma } from '@/lib/prisma';

export interface QuestionInput {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'RATING';
  options?: Array<{ id: string; text: string; isCorrect?: boolean; competencyCode?: string }>;
  correctOptionId?: string;
  competencyCode?: string;
  difficultyLevel?: 1 | 2 | 3;
  targetCohort?: 'STUDENT' | 'PROFESSIONAL' | 'CORPORATE' | null;
}

export async function uploadQuestionsForModule(
  activityId: string,
  questions: QuestionInput[],
  uploadedBy: string
): Promise<{ created: number; skipped: number; errors: string[] }> {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Verify activity exists
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, name: true },
  });
  if (!activity) {
    return { created: 0, skipped: 0, errors: [`Activity ${activityId} not found`] };
  }

  for (const q of questions) {
    try {
      if (!q.questionText?.trim()) {
        errors.push(`Skipped: empty question text`);
        skipped++;
        continue;
      }
      if (q.questionType === 'MULTIPLE_CHOICE' && (!q.options || q.options.length < 2)) {
        errors.push(`Skipped: "${q.questionText.slice(0, 40)}" — needs ≥2 options`);
        skipped++;
        continue;
      }

      await prisma.trainingSessionQuestion.create({
        data: {
          activityId,
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          options: q.options ?? [],
          correctOptionId: q.correctOptionId ?? null,
          competencyCode: q.competencyCode ?? null,
          difficultyLevel: q.difficultyLevel ?? 2,
          targetCohort: q.targetCohort ?? null,
          uploadedBy,
          isActive: true,
        },
      });
      created++;
    } catch (err) {
      errors.push(`Error on "${q.questionText?.slice(0, 40)}": ${String(err)}`);
    }
  }

  console.log(`[QuestionBank] Activity ${activityId}: ${created} created, ${skipped} skipped`);
  return { created, skipped, errors };
}

export async function getQuestionBankStats(activityId: string) {
  const total = await prisma.trainingSessionQuestion.count({ where: { activityId, isActive: true } });
  const byDifficulty = await prisma.trainingSessionQuestion.groupBy({
    by: ['difficultyLevel'],
    where: { activityId, isActive: true },
    _count: { id: true },
  });
  const byCompetency = await prisma.trainingSessionQuestion.groupBy({
    by: ['competencyCode'],
    where: { activityId, isActive: true, competencyCode: { not: null } },
    _count: { id: true },
  });
  return { total, byDifficulty, byCompetency };
}

export async function deactivateQuestion(questionId: string): Promise<void> {
  await prisma.trainingSessionQuestion.update({
    where: { id: questionId },
    data: { isActive: false },
  });
}
```

### T6.3 — Create the API route for question upload
Create `apps/portal/app/api/training/questions/route.ts`:

```typescript
// POST { activityId, questions: QuestionInput[] }
// Requires: TRAINER | OPS_DELIVERY | SUDAKSHA_OBSERVER session
// Returns: { created, skipped, errors }
import { getServerSession } from 'next-auth';
import { uploadQuestionsForModule } from '@/lib/training/questionBankService';
import { hasPermission } from '@/lib/permissions/trainingPermissions';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });
  if (!hasPermission(session.user.role, 'questions:upload')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { activityId, questions } = await req.json();
  const result = await uploadQuestionsForModule(activityId, questions, session.user.id);
  return Response.json(result);
}
```

### T6.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "questionBank\|QuestionBank\|uploadQuestion" | head -10
```

## Acceptance Tests
- [ ] `uploadQuestionsForModule` creates records correctly
- [ ] Empty question text is rejected with informative error
- [ ] Multiple-choice question with <2 options is skipped
- [ ] API returns 403 for a role without `questions:upload` permission

---END STEP T6---


---BEGIN STEP T7---

# STEP T7 — RANDOMISED QUESTION SELECTION ENGINE

## Agent operating mode: NEW FILE only.

## Purpose
When a session is created, a fixed set of N questions is randomly selected
from the module's question bank. The selection uses a stored random seed so
the session can be reproduced if needed. Questions are drawn with stratified
sampling: balanced by difficulty level and competency coverage.
This is the patent-required per-cohort randomised item selection
(C-09 claim, also covered in Phase 2 Step G13 for ADAPT-16).
For TDAS the mechanism is adapted for live-session context.

## Pre-conditions
- Step T6 completed.

## Instructions

### T7.1 — Create the selection engine
Create `apps/portal/lib/training/sessionQuestionSelector.ts`:

```typescript
/**
 * Training Session Question Selector
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T7
 *
 * Stratified random selection of N questions from the module's question bank.
 * Stratification: balanced by difficulty level, then competency coverage.
 * Random seed is stored with the session for audit/reproducibility.
 */
import { prisma } from '@/lib/prisma';

interface SelectionConfig {
  sessionId: string;
  activityId: string;
  targetCount: number;          // e.g. 10
  targetCohort?: string | null; // filter by cohort if specified
  seed?: string;                // optional pre-set seed
}

function seededRandom(seed: string): () => number {
  // Simple deterministic PRNG from seed string (xorshift32)
  let state = seed.split('').reduce((acc, ch) => acc ^ ch.charCodeAt(0) * 2654435761, 0x12345678);
  return function () {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export async function selectQuestionsForSession(
  config: SelectionConfig
): Promise<{ questionIds: string[]; seed: string }> {
  const seed = config.seed ?? `${config.activityId}-${Date.now()}`;
  const rand = seededRandom(seed);

  // Fetch the active question bank for this module + cohort
  const pool = await prisma.trainingSessionQuestion.findMany({
    where: {
      activityId: config.activityId,
      isActive: true,
      OR: [
        { targetCohort: config.targetCohort ?? null },
        { targetCohort: null },
      ],
    },
    select: {
      id: true,
      difficultyLevel: true,
      competencyCode: true,
    },
  });

  if (pool.length === 0) return { questionIds: [], seed };
  if (pool.length <= config.targetCount) {
    // Not enough questions — return all, shuffled
    const shuffled = [...pool].sort(() => rand() - 0.5);
    return { questionIds: shuffled.map(q => q.id), seed };
  }

  // Stratified sampling: try to get equal distribution across difficulty levels
  const byDifficulty: Record<number, typeof pool> = { 1: [], 2: [], 3: [] };
  for (const q of pool) {
    const d = q.difficultyLevel ?? 2;
    if (!byDifficulty[d]) byDifficulty[d] = [];
    byDifficulty[d].push(q);
  }

  // Shuffle each difficulty bucket with seeded PRNG
  for (const d of [1, 2, 3]) {
    byDifficulty[d] = byDifficulty[d].sort(() => rand() - 0.5);
  }

  const selected: string[] = [];
  const perLevel = Math.floor(config.targetCount / 3);
  const remainder = config.targetCount - perLevel * 3;

  // Take perLevel from each difficulty; fill remainder from largest bucket
  for (const d of [1, 2, 3]) {
    selected.push(...byDifficulty[d].slice(0, perLevel).map(q => q.id));
  }

  // Fill remainder from difficulty 2 (medium — most questions typically)
  const remaining = byDifficulty[2].slice(perLevel);
  selected.push(...remaining.slice(0, remainder).map(q => q.id));

  // Final shuffle of the selected set
  const finalSelection = selected.sort(() => rand() - 0.5);

  return { questionIds: finalSelection.slice(0, config.targetCount), seed };
}
```

### T7.2 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "sessionQuestionSelector\|selectQuestions" | head -10
```

## Acceptance Tests
- [ ] Same seed always produces same question order
- [ ] Different seeds produce different orderings
- [ ] Pool smaller than targetCount returns all questions
- [ ] Selection respects cohort filter
- [ ] TypeScript compiles with no errors

---END STEP T7---


---BEGIN STEP T8---

# STEP T8 — SESSION START + RESPONSE SUBMISSION API

## Agent operating mode: NEW API ROUTES only.

## Purpose
Three API routes are needed:
1. POST /api/training/sessions — create a session (ops/trainer)
2. POST /api/training/sessions/[id]/start — activate session for participants
3. POST /api/training/sessions/[id]/respond — participant submits an answer

## Pre-conditions
- Step T7 completed.

## Instructions

### T8.1 — Create session route
Create `apps/portal/app/api/training/sessions/route.ts`:

```typescript
// POST — create a new TrainingSession for an activity
// Body: { activityId, sessionDate, questionCount, durationMinutes, moduleTitle }
// Requires: session:create permission
// Returns: { session }

import { getServerSession } from 'next-auth';
import { selectQuestionsForSession } from '@/lib/training/sessionQuestionSelector';
import { hasPermission } from '@/lib/permissions/trainingPermissions';

export async function POST(req: Request) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });
  if (!hasPermission(authSession.user.role, 'session:create')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { activityId, sessionDate, questionCount = 10, durationMinutes = 10, moduleTitle } = await req.json();

  // Select questions using stratified random selection
  const { questionIds, seed } = await selectQuestionsForSession({
    sessionId: 'pending',
    activityId,
    targetCount: questionCount,
    targetCohort: authSession.user.cohortType ?? null,
  });

  const session = await prisma.trainingSession.create({
    data: {
      activityId,
      tenantId: authSession.user.tenantId,
      clientId: authSession.user.clientId ?? null,
      trainerId: authSession.user.id,
      moduleTitle,
      sessionDate: new Date(sessionDate),
      questionCount: questionIds.length,
      durationMinutes,
      status: 'DRAFT',
      randomSeed: seed,
      createdBy: authSession.user.id,
    },
  });

  return Response.json({ session, questionIds, seed });
}
```

### T8.2 — Session start route
Create `apps/portal/app/api/training/sessions/[id]/start/route.ts`:

```typescript
// POST — activate session so participants can join and answer
// Sets status: ACTIVE, records startedAt
// Requires: session:activate permission

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });
  if (!hasPermission(authSession.user.role, 'session:activate')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await prisma.trainingSession.update({
    where: { id: params.id },
    data: { status: 'ACTIVE', startedAt: new Date() },
  });

  return Response.json({ session });
}
```

### T8.3 — Response submission route
Create `apps/portal/app/api/training/sessions/[id]/respond/route.ts`:

```typescript
// POST — participant submits answer for one question
// Body: { questionId, selectedOptionId?, shortAnswerText?, responseTimeMs }
// Stores response + marks correct/incorrect immediately for MCQ/T-F

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const session = await prisma.trainingSession.findUnique({ where: { id: params.id } });
  if (!session || session.status !== 'ACTIVE') {
    return Response.json({ error: 'Session not active' }, { status: 400 });
  }

  const { questionId, selectedOptionId, shortAnswerText, responseTimeMs } = await req.json();

  const question = await prisma.trainingSessionQuestion.findUnique({ where: { id: questionId } });
  const isCorrect = question?.correctOptionId
    ? selectedOptionId === question.correctOptionId
    : null;
  const points = isCorrect === true ? 1 : isCorrect === false ? 0 : null;

  await prisma.trainingSessionResponse.upsert({
    where: {
      sessionId_questionId_memberId: {
        sessionId: params.id,
        questionId,
        memberId: authSession.user.memberId,
      },
    },
    update: { selectedOptionId, shortAnswerText, isCorrect, pointsAwarded: points ?? 0, responseTimeMs },
    create: {
      sessionId: params.id,
      questionId,
      memberId: authSession.user.memberId,
      selectedOptionId,
      shortAnswerText,
      isCorrect,
      pointsAwarded: points ?? 0,
      responseTimeMs,
    },
  });

  return Response.json({ recorded: true, isCorrect });
}
```

### T8.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "training/sessions" | head -15
```

## Acceptance Tests
- [ ] Create session returns session + questionIds
- [ ] Start route sets status to ACTIVE
- [ ] Response route upserts correctly (idempotent on re-submit)
- [ ] Response to non-active session returns 400
- [ ] TypeScript compiles cleanly

---END STEP T8---


---BEGIN STEP T9---

# STEP T9 — SESSION COMPLETION + PHASE 2 SCORING WIRE-UP

## Agent operating mode: NEW ROUTE + WIRE INTO EXISTING SERVICES.

## Purpose
When a session ends (trainer closes it), compute per-participant results
using the Phase 2 scoring stack: BiasFlag detection, normative calibration,
CompetencyScore update, and AssessmentDelta computation.
This is the patent-critical integration step for TDAS.

## Pre-conditions
- Step T8 completed.
- Phase 2 services confirmed: `computeCompetencyScores.ts`, `calibrateScore.ts`,
  `detectBias.ts`, `computeAssessmentDelta.ts` all exist.

## Instructions

### T9.1 — Read Phase 2 service signatures
```bash
head -30 apps/portal/lib/scoring/computeCompetencyScores.ts
head -20 apps/portal/lib/scoring/calibrateScore.ts
head -20 apps/portal/lib/scoring/detectBias.ts
head -20 apps/portal/lib/scoring/computeAssessmentDelta.ts
```

### T9.2 — Create TDAS result computation service
Create `apps/portal/lib/training/computeSessionResults.ts`:

```typescript
/**
 * TDAS Session Result Computation Service
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T9
 *
 * Computes per-participant results for a completed TrainingSession,
 * then feeds results into the Phase 2 scoring pipeline:
 * - BiasFlag detection (response-time anomaly for live-session context)
 * - Normative calibration (using TDAS cohort type)
 * - CompetencyScore update (blended with existing scores)
 * - AssessmentDelta computation
 */
import { prisma } from '@/lib/prisma';
import { calibrateScore } from '@/lib/scoring/calibrateScore';
import { computeAndStoreDelta, flagAsBaseline } from '@/lib/scoring/computeAssessmentDelta';

const BLEND_WEIGHT = 0.3; // TDAS session score weight in CompetencyScore blend

export async function computeSessionResults(sessionId: string): Promise<void> {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { responses: { include: { question: true } } },
  });
  if (!session) return;

  // Get unique participant IDs
  const participantIds = [...new Set(session.responses.map(r => r.memberId))];

  for (const memberId of participantIds) {
    const memberResponses = session.responses.filter(r => r.memberId === memberId);
    if (!memberResponses.length) continue;

    const totalQuestions = memberResponses.length;
    const correctAnswers = memberResponses.filter(r => r.isCorrect === true).length;
    const rawScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // ── TIME ANOMALY CHECK ──────────────────────────────────────────────────
    // Flag suspiciously fast responses (< 3 seconds for any question)
    const tooFastCount = memberResponses.filter(r =>
      r.responseTimeMs !== null && r.responseTimeMs < 3000
    ).length;
    const biasFlags = tooFastCount > memberResponses.length * 0.3
      ? [{ type: 'RAPID_RESPONSE', severity: 'MEDIUM', count: tooFastCount }]
      : [];

    // ── NORMATIVE CALIBRATION ───────────────────────────────────────────────
    // Use dominant competencyCode from questions in this session
    const competencyCodes = [...new Set(
      memberResponses
        .map(r => r.question.competencyCode)
        .filter(Boolean) as string[]
    )];

    // Get member's cohort type for calibration
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { type: true },
    });
    const cohortType = member?.type ?? 'PROFESSIONAL';

    let normalisedScore: number | undefined;
    let proficiencyLevel: number | undefined;
    let percentileRank: number | undefined;

    if (competencyCodes.length > 0) {
      // Calibrate against the primary competency of this session
      const calibration = await calibrateScore(
        rawScore,
        competencyCodes[0],
        cohortType,
        'TDAS'
      );
      normalisedScore = calibration.normalisedScore;
      proficiencyLevel = calibration.proficiencyLevel;
      percentileRank = calibration.percentileRank;

      // ── UPDATE CompetencyScore (blended) ───────────────────────────────
      for (const competencyCode of competencyCodes) {
        const existing = await prisma.competencyScore.findFirst({
          where: {
            competencyCode,
            assessmentType: 'TDAS',
            memberAssessment: { member: { id: memberId } },
          },
          orderBy: { updatedAt: 'desc' },
        });

        if (existing) {
          // Blend: 70% existing + 30% new session
          const blendedScore = existing.compositeRawScore * (1 - BLEND_WEIGHT) +
            rawScore * BLEND_WEIGHT;
          await prisma.competencyScore.update({
            where: { id: existing.id },
            data: {
              compositeRawScore: Math.round(blendedScore * 100) / 100,
              normalisedScore,
              proficiencyLevel: proficiencyLevel ?? existing.proficiencyLevel,
              percentileRank,
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    // ── STORE TrainingSessionResult ────────────────────────────────────────
    await prisma.trainingSessionResult.upsert({
      where: { sessionId_memberId: { sessionId, memberId } },
      update: {
        totalQuestions, correctAnswers, rawScore,
        normalisedScore, proficiencyLevel, percentileRank,
        biasFlags,
        completedAt: new Date(),
      },
      create: {
        sessionId, memberId, totalQuestions, correctAnswers, rawScore,
        normalisedScore, proficiencyLevel, percentileRank,
        biasFlags,
        completedAt: new Date(),
      },
    });
  }

  // Update session status to COMPLETED
  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  console.log(`[TDAS] Session ${sessionId} completed. ${participantIds.length} results computed.`);
}
```

### T9.3 — Create session completion API route
Create `apps/portal/app/api/training/sessions/[id]/complete/route.ts`:

```typescript
// POST — trainer/ops closes the session
// Triggers result computation pipeline
// Requires: session:activate permission

import { computeSessionResults } from '@/lib/training/computeSessionResults';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });
  if (!hasPermission(authSession.user.role, 'session:activate')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fire-and-forget — don't block the response
  computeSessionResults(params.id)
    .catch(err => console.error('[TDAS] Result computation error:', err));

  return Response.json({ status: 'COMPLETING' });
}
```

### T9.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | head -20
```

## Acceptance Tests
- [ ] Completing a session creates TrainingSessionResult for each participant
- [ ] BiasFlags populated when >30% responses are too fast
- [ ] normalisedScore and proficiencyLevel populated when question has competencyCode
- [ ] Session status changes to COMPLETED
- [ ] No TypeScript errors introduced

---END STEP T9---


---BEGIN STEP T10---

# STEP T10 — TRAINER DASHBOARD — SESSION MANAGEMENT PAGE

## Agent operating mode: NEW PAGE.

## Purpose
The trainer's home view — shows all their assigned modules, upcoming sessions,
and quick-create session button. Scoped to trainer's own clients only.

## Pre-conditions
- Step T9 completed.
- Dashboard routing confirmed: TRAINER → `/assessments/dashboard/trainer`

## Instructions

### T10.1 — Check existing patterns
```bash
cat apps/portal/app/assessments/dashboard/team-lead/page.tsx | head -60
```

### T10.2 — Create trainer dashboard
Create `apps/portal/app/assessments/dashboard/trainer/page.tsx`:

This page shows:
1. **Summary row (4 metrics):**
   - Sessions conducted this month
   - Average class score %
   - Participants assessed (unique)
   - Next scheduled session (date + module)

2. **Upcoming sessions list** — sessions with status DRAFT or ACTIVE
   - Each row: module name, date, # questions, status badge, [Activate] / [View] button

3. **Recent sessions list** — last 5 COMPLETED sessions
   - Each row: module name, date, participants, avg score, [View Results] link

4. **Quick create button** — opens to module selection → session config

Data queries:
- `GET /api/training/sessions?trainerId=${session.user.id}&status=DRAFT,ACTIVE`
- `GET /api/training/sessions?trainerId=${session.user.id}&status=COMPLETED&limit=5`

**Create the supporting GET route** in `apps/portal/app/api/training/sessions/route.ts`:
Add a `GET` handler that returns sessions filtered by `trainerId`, `status`, and `limit`
query params. Enforce that non-observer roles only see their own sessions.

### T10.3 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "trainer" | head -10
```

## Acceptance Tests
- [ ] Page renders at `/assessments/dashboard/trainer`
- [ ] A trainer can only see their own sessions
- [ ] SUDAKSHA_OBSERVER role can see all sessions in the same route
- [ ] Empty states display correctly

---END STEP T10---


---BEGIN STEP T11---

# STEP T11 — TRAINER DASHBOARD — LIVE SESSION VIEW

## Agent operating mode: NEW PAGE + NEW API ROUTE.

## Purpose
Once a session is ACTIVE, the trainer sees a live view showing:
- Questions being presented (with current question highlighted)
- Real-time response count per question (how many participants have answered)
- Participant list with live checkmarks as they respond
- End Session button

This uses polling (every 5 seconds) — not websockets, to keep the agent
scope manageable and avoid infrastructure complexity.

## Pre-conditions
- Step T10 completed.

## Instructions

### T11.1 — Create live session status API
Create `apps/portal/app/api/training/sessions/[id]/status/route.ts`:

```typescript
// GET — returns real-time session status:
// - questionIds selected for this session
// - response counts per question
// - participant response map (memberId → answered question IDs)
// Requires: session:read permission
// SUDAKSHA_OBSERVER: always allowed
// TRAINER: must own this session

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const session = await prisma.trainingSession.findUnique({
    where: { id: params.id },
    include: { responses: { select: { questionId: true, memberId: true, isCorrect: true } } },
  });
  if (!session) return Response.json({ error: 'Not found' }, { status: 404 });

  // Non-observer trainers can only see their own sessions
  if (!isCrossTenantRole(authSession.user.role) &&
      session.trainerId !== authSession.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Aggregate response counts per question
  const responseCounts: Record<string, number> = {};
  const participantAnswered: Record<string, string[]> = {}; // memberId → [questionIds]
  for (const r of session.responses) {
    responseCounts[r.questionId] = (responseCounts[r.questionId] ?? 0) + 1;
    if (!participantAnswered[r.memberId]) participantAnswered[r.memberId] = [];
    participantAnswered[r.memberId].push(r.questionId);
  }

  return Response.json({
    sessionId: session.id,
    status: session.status,
    totalParticipants: session.totalParticipants,
    responseCounts,
    participantAnswered,
    startedAt: session.startedAt,
  });
}
```

### T11.2 — Create live session page
Create `apps/portal/app/assessments/training/sessions/[id]/live/page.tsx`:

This is a **Client Component** (`'use client'`) that:
1. Polls `/api/training/sessions/${sessionId}/status` every 5 seconds
2. Shows a question list with response count progress bars per question
3. Shows a participant grid with checkmarks as responses arrive
4. Shows elapsed time since session started
5. Shows "End Session" button (calls `/api/training/sessions/${id}/complete`)

Use `useEffect` with a `setInterval` for the 5-second polling.
Cancel the interval on unmount or when `status === 'COMPLETED'`.

## Acceptance Tests
- [ ] Page polls status every 5 seconds
- [ ] Response counts update in real time
- [ ] "End Session" triggers completion and navigates to results
- [ ] SUDAKSHA_OBSERVER can view any session's live status
- [ ] Page stops polling once status is COMPLETED

---END STEP T11---


---BEGIN STEP T12---

# STEP T12 — TRAINER DASHBOARD — SESSION RESULTS + CLASS REPORT

## Agent operating mode: NEW PAGE.

## Purpose
After session completion, the trainer sees the full class report:
per-participant scores, question-level correct/incorrect breakdown,
competency coverage summary, and export button.

## Pre-conditions
- Step T11 completed.

## Instructions

### T12.1 — Create results API
Create `apps/portal/app/api/training/sessions/[id]/results/route.ts`:

Returns:
- Session metadata
- Array of TrainingSessionResult (per participant)
- Question-level stats (correct % per question)
- Class average score, median, range

### T12.2 — Create session results page
Create `apps/portal/app/assessments/training/sessions/[id]/results/page.tsx`:

Sections:
1. **Class summary** — session name, date, total participants, avg score, questions
2. **Score distribution** — simple bar chart (reuse existing chart component) showing
   score bands: 0–40%, 41–60%, 61–80%, 81–100%
3. **Question breakdown** — table: question text (truncated), difficulty, correct %,
   flag if correct % < 40% (question may be too hard or poorly worded)
4. **Participant results table** — name, score %, pass/fail badge (>60% = pass),
   response time avg, bias flags if any
5. **Competency coverage** — if questions had competencyCode, show which
   ADAPT-16 competencies were covered in this session
6. **Export button** — triggers existing `/api/clients/[clientId]/reports/generate`
   with type TRAINING_SESSION

## Acceptance Tests
- [ ] Page shows all sections
- [ ] Questions with <40% correct rate flagged in yellow
- [ ] Participant list sorted by score descending
- [ ] Empty state handles session with no responses
- [ ] Competency coverage section hidden if no questions had competencyCode

---END STEP T12---


---BEGIN STEP T13---

# STEP T13 — OPS/DELIVERY TEAM DASHBOARD

## Agent operating mode: NEW PAGE.

## Purpose
The Ops/Delivery team oversees all training delivery across their
assigned clients. They can see all trainers' sessions, upload questions,
and manage the training calendar.

## Pre-conditions
- Step T12 completed.

## Instructions

Create `apps/portal/app/assessments/dashboard/ops/page.tsx`.

This page shows:
1. **4 metrics:** Sessions this month / Total participants assessed /
   Avg class score across all sessions / Active sessions now (real-time)
2. **Active sessions panel** — any session with status=ACTIVE across
   all their clients. Shows trainer name, module, participant count,
   and a [Monitor] link to the live view.
3. **Session calendar** — week view showing scheduled sessions per client
4. **Question bank health** — per module: total questions in bank,
   sessions run this month, recommendation if bank < 20 questions
   ("Upload more questions to maintain item variety")
5. **Trainer performance table** — per trainer: sessions conducted,
   avg participant score, modules covered this month

Data scope: OPS_DELIVERY role sees all sessions within their tenantId.
SUDAKSHA_OBSERVER sees all tenants.

The active sessions panel should poll every 30 seconds using the same
status API pattern from Step T11.

## Acceptance Tests
- [ ] Page renders at `/assessments/dashboard/ops` (add routing in T4 if needed)
- [ ] Active sessions update every 30 seconds
- [ ] Question bank warning appears when bank < 20 questions
- [ ] OPS_DELIVERY role only sees their own tenant's data

---END STEP T13---


---BEGIN STEP T14---

# STEP T14 — SUDAKSHA OBSERVER DASHBOARD — CROSS-TENANT VIEW

## Agent operating mode: NEW PAGE + NEW API ROUTE.

## Purpose
The Sudaksha Observer has the highest privilege in the platform —
full read+write access across ALL clients and ALL tenants simultaneously.
This dashboard is their command centre: a live operational view of every
training session happening across the entire SEPL customer base.

This is architecturally the most sensitive step. The API route must
explicitly enforce the SUDAKSHA_OBSERVER role — no fallback defaults.

## Pre-conditions
- Step T13 completed.
- `isCrossTenantRole()` function confirmed working from Step T4.

## Instructions

### T14.1 — Create cross-tenant session overview API
Create `apps/portal/app/api/training/observer/sessions/route.ts`:

```typescript
// GET — returns ALL sessions across ALL tenants
// STRICTLY requires SUDAKSHA_OBSERVER or SUDAKSHA_ADMIN role
// Query params: status (optional), date (optional), tenantId (optional filter)

export async function GET(req: Request) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  // Hard requirement — no fallback
  if (!isCrossTenantRole(authSession.user.role)) {
    return Response.json({ error: 'This endpoint requires SUDAKSHA_OBSERVER role' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const tenantId = searchParams.get('tenantId');
  const dateStr = searchParams.get('date');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (tenantId) where.tenantId = tenantId;
  if (dateStr) {
    const date = new Date(dateStr);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    where.sessionDate = { gte: date, lt: nextDay };
  }

  const sessions = await prisma.trainingSession.findMany({
    where,
    include: {
      activity: { select: { name: true } },
      results: { select: { memberId: true, rawScore: true } },
    },
    orderBy: { sessionDate: 'desc' },
    take: 200,
  });

  return Response.json({ sessions, total: sessions.length });
}
```

### T14.2 — Create cross-tenant tenant summary API
Create `apps/portal/app/api/training/observer/summary/route.ts`:

Returns per-tenant aggregates: session count, participant count, avg score,
question bank health. Used for the observer's top-level view.

### T14.3 — Create observer dashboard
Create `apps/portal/app/assessments/dashboard/observer/page.tsx`:

Sections:
1. **Platform-wide live metrics (4 large numbers):**
   - Active sessions right now (auto-refresh 15s)
   - Total sessions today across all clients
   - Total participants assessed today
   - Clients with sessions in progress
2. **Live session feed** — scrollable list of currently ACTIVE sessions
   across all tenants. Each card shows: client name, trainer, module,
   participant count, elapsed time, [Monitor] link to live view.
   Auto-refreshes every 15 seconds.
3. **Client health table** — per client: sessions this month, avg score,
   question bank quality (total questions in bank vs sessions conducted ratio),
   last active date.
4. **Trainer activity** — all trainers across all clients: name, client,
   sessions this month, last session date, quality flag if avg score < 50%.
5. **Alerts panel** — auto-generated alerts:
   - Sessions with high bias flag rates (>20% of participants)
   - Clients with no sessions in 14 days
   - Question banks with < 10 questions (depletion risk)

### T14.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "observer" | head -10
```

## Acceptance Tests
- [ ] Observer API endpoint returns 403 for any non-observer role
- [ ] Observer sees sessions from ALL tenants (verify with multi-tenant test data)
- [ ] Live feed auto-refreshes every 15 seconds
- [ ] Alerts panel shows real data-driven alerts
- [ ] No TypeScript errors

---END STEP T14---


---BEGIN STEP T15---

# STEP T15 — SUDAKSHA OBSERVER — CLIENT DRILL-DOWN + TRAINER MONITORING

## Agent operating mode: NEW PAGES.

## Purpose
The observer needs to drill into any client to see their full training
history, and into any trainer to see their individual performance and
session patterns. Full write access: the observer can correct sessions,
edit question banks, and reassign trainers.

## Pre-conditions
- Step T14 completed.

## Instructions

### T15.1 — Client drill-down page
Create `apps/portal/app/assessments/observer/clients/[clientId]/page.tsx`:

Shows for a specific client:
- All sessions ever conducted (paginated, 20 per page)
- Question bank per module (list all Activity/module banks)
- All trainer assignments for this client
- Score trends over time (sparkline using recharts)
- [Edit Question Bank] and [Add Session] CTAs (using observer's write permission)

### T15.2 — Trainer monitoring page
Create `apps/portal/app/assessments/observer/trainers/[trainerId]/page.tsx`:

Shows for a specific trainer (cross-client if needed):
- All sessions they have conducted
- Per-session score summary
- Client assignments
- Question bank contributions (questions uploaded by them)
- Performance pattern — is their class avg trending up or down?
- [Edit] capabilities: reassign to a different client, deactivate, add notes

### T15.3 — Write access enforcement
For any write actions in observer pages, verify the session role is
`isCrossTenantRole()` before rendering write CTAs and before submitting
write API calls. Read-only rendering must still work for future
role tiers that may have `session:read_all_tenants` without write.

## Acceptance Tests
- [ ] Client drill-down shows correct session history
- [ ] Trainer monitoring shows cross-client session history
- [ ] Write CTAs (Edit, Add Session) only visible when isCrossTenantRole
- [ ] Pagination works on session history (20 per page)

---END STEP T15---


---BEGIN STEP T16---

# STEP T16 — PARTICIPANT SESSION UI — TAKE ASSESSMENT

## Agent operating mode: NEW PAGE.

## Purpose
The participant (trainee) sees their questions and submits answers during
a live session. This is a simple, mobile-friendly quiz UI. No browser
lockdown (live classroom context), but response times are captured for
the Phase 2 anomaly detection.

## Pre-conditions
- Step T15 completed.

## Instructions

### T16.1 — Create participant session page
Create `apps/portal/app/assessments/training/take/[sessionId]/page.tsx`:

This is a **Client Component** (`'use client'`):

1. On mount, fetch session + questions from a new endpoint:
   `GET /api/training/sessions/[id]/questions` — returns
   the sessionId's selected question IDs + question text+options.
   This endpoint verifies the session is ACTIVE before returning questions.

2. Show one question at a time (not all at once).
   Record `startTime = Date.now()` when question is displayed.
   When participant selects an answer, compute `responseTimeMs = Date.now() - startTime`.

3. Submit via `POST /api/training/sessions/[id]/respond` with
   `{ questionId, selectedOptionId, responseTimeMs }`.

4. After submission, show brief feedback (correct/incorrect for MCQ)
   and auto-advance to next question after 1.5 seconds.

5. After all questions answered, show completion screen:
   "Assessment complete! Your responses have been submitted."
   Do NOT show the score — scores are revealed by the trainer
   at their discretion.

6. If session status is not ACTIVE when participant loads, show:
   "Session not yet started. Please wait for your trainer."

### T16.2 — Create questions fetch route
Create `apps/portal/app/api/training/sessions/[id]/questions/route.ts`:

Returns the selected questions for this session.
Verifies session status = ACTIVE.
Does NOT reveal correct answers (omit `correctOptionId` from response).

## Acceptance Tests
- [ ] Page shows "not started" message for DRAFT sessions
- [ ] Questions display one at a time
- [ ] Response time captured per question
- [ ] Correct answer NOT revealed in API response
- [ ] Completion screen shown after all questions answered
- [ ] Mobile layout works correctly

---END STEP T16---


---BEGIN STEP T17---

# STEP T17 — REAL-TIME SESSION STATE — POLLING + SESSION JOIN

## Agent operating mode: ADDITIVE to existing routes.

## Purpose
Two remaining real-time concerns:
1. Participants need to "join" a session so the trainer can see
   who is in the room (totalParticipants counter).
2. The trainer's live view needs a participant join event beyond
   just response submission.

## Pre-conditions
- Step T16 completed.

## Instructions

### T17.1 — Session join API
Create `apps/portal/app/api/training/sessions/[id]/join/route.ts`:

```typescript
// POST — participant joins a session
// Increments totalParticipants if first join
// Returns: { joined: true, questions: number }

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const session = await prisma.trainingSession.findUnique({ where: { id: params.id } });
  if (!session || session.status !== 'ACTIVE') {
    return Response.json({ error: 'Session not active' }, { status: 400 });
  }

  // Check if participant already joined (has any response or explicit join flag)
  const existingResponse = await prisma.trainingSessionResponse.findFirst({
    where: { sessionId: params.id, memberId: authSession.user.memberId },
  });

  if (!existingResponse) {
    // Increment participant count
    await prisma.trainingSession.update({
      where: { id: params.id },
      data: { totalParticipants: { increment: 1 } },
    });
  }

  return Response.json({ joined: true, questionCount: session.questionCount });
}
```

### T17.2 — Update participant page to call join on mount
In `apps/portal/app/assessments/training/take/[sessionId]/page.tsx`,
add a `useEffect` that calls `POST /api/training/sessions/${sessionId}/join`
when the component mounts and the session is ACTIVE. The join increments
the participant counter the trainer sees in real time.

### T17.3 — Status API enhancements
Update the status API (`/api/training/sessions/[id]/status`) to also
return `joinedParticipants: number` (the current `totalParticipants` value).

## Acceptance Tests
- [ ] Multiple participants joining increments totalParticipants correctly
- [ ] Joining twice (page refresh) does not double-increment
- [ ] Trainer's live view shows updated participant count
- [ ] Status API returns joinedParticipants field

---END STEP T17---


---BEGIN STEP T18---

# STEP T18 — MODULE QUESTION BANK ADMIN UI

## Agent operating mode: NEW PAGE.

## Purpose
The ops/delivery team and trainers need a UI to upload, view, and manage
the question bank for each module (Activity). This is the administrative
interface for the question pool that sessions draw from.

## Pre-conditions
- Step T17 completed.

## Instructions

Create `apps/portal/app/assessments/training/modules/[activityId]/questions/page.tsx`:

1. **Question bank header:**
   - Module name (Activity.name)
   - Stats from `getQuestionBankStats()` — total questions, by difficulty, by competency
   - Upload button

2. **Upload questions section:**
   - Toggle between two upload modes:
     - **Manual entry form:** questionText, questionType, options builder (add/remove options,
       mark correct, link to competency code)
     - **Bulk JSON upload:** drag-and-drop or file input for a JSON array of QuestionInput objects.
       Show a schema template button that downloads a sample JSON file.

3. **Question list table (paginated, 20 per page):**
   - Question text (truncated 80 chars), type badge, difficulty badge,
     competency code chip, active/inactive toggle, delete button
   - Filter by: difficulty, competency code, active status

4. **Import/export buttons:**
   - Export all questions as JSON (for backup)
   - Import from JSON (calls `POST /api/training/questions` in bulk)

Wire the upload form to `POST /api/training/questions`.
Wire the deactivate toggle to a new `PATCH /api/training/questions/[id]`
route that calls `deactivateQuestion()`.

## Acceptance Tests
- [ ] Manual entry form creates a question correctly
- [ ] Bulk JSON upload creates multiple questions
- [ ] Deactivate toggle removes question from active pool
- [ ] Export JSON contains all active questions
- [ ] Filter by difficulty works correctly

---END STEP T18---


---BEGIN STEP T19---

# STEP T19 — SESSION REPORT PAGES — INDIVIDUAL + CLASS VIEWS

## Agent operating mode: NEW PAGES.

## Purpose
Two report pages for post-session review:
1. Individual participant view — their own session performance
2. Class aggregate report — for trainer/ops export to client

## Pre-conditions
- Step T18 completed.

## Instructions

### T19.1 — Individual participant report
Create `apps/portal/app/assessments/training/sessions/[sessionId]/my-results/page.tsx`:

Shows a participant their own results (only accessible when session is COMPLETED):
- Score (X/Y correct, %)
- Per-question: question text, their answer, correct answer, correct/incorrect badge
- Competency coverage: which ADAPT-16 competencies this session addressed
- If `proficiencyLevel` was computed: show their current level on the competency

### T19.2 — Class aggregate report (enhanced from Step T12)
The Step T12 results page covers the trainer view.
Add a shareable/printable variant:

Create `apps/portal/app/assessments/training/sessions/[sessionId]/class-report/page.tsx`:

This is a print-optimised view (CSS `@media print` applied) containing:
- Header: module, date, trainer, client, participant count
- Class score distribution
- Question-by-question breakdown
- Participant results table (anonymised if required by client settings)
- Competency coverage summary
- Footer: SEPL branding + "Powered by ADAPT-16™ Assessment Platform"

Wire the "Download Board Brief" style button to generate a PDF using
the existing `/api/clients/[clientId]/reports/generate` with
`templateType: 'TRAINING_SESSION'` if the PDF renderer is connected,
otherwise show a print-browser dialog.

## Acceptance Tests
- [ ] Individual results page only shows to the session participant
- [ ] Class report accessible by trainer and observer only
- [ ] Print layout renders without overlapping elements
- [ ] Competency coverage chips display correctly

---END STEP T19---


---BEGIN STEP T20---

# STEP T20 — WIRE PHASE 2 BIAS DETECTION TO TDAS SESSIONS

## Agent operating mode: VERIFY + ADDITIVE WIRE.

## Purpose
Confirm that Phase 2 `detectAndStoreBias` is actually triggered for TDAS
sessions. Step T9 handles time-anomaly bias inline. This step wires the
full Phase 2 three-type bias detection (extreme response, acquiescence,
social desirability) for TDAS responses where applicable.

## Pre-conditions
- Step T19 completed.
- Phase 2 `detectAndStoreBias` service confirmed present.

## Instructions

### T20.1 — Check Phase 2 bias detection service
```bash
cat apps/portal/lib/scoring/detectBias.ts | head -40
```
Confirm it accepts: `memberAssessmentId`, `selfReportResponses`, `l2Scores`, `l1Scores`.

### T20.2 — Assess applicability to TDAS
TDAS questions are MCQ/T-F — not Likert self-report scales.
Therefore:
- **Extreme response bias** is not applicable (no 1–5 scale)
- **Acquiescence bias** is not applicable (no agree/disagree items)
- **Social desirability inflation** is not applicable in the same form
- **APPLICABLE: Rapid response time anomaly** (already in T9)
- **APPLICABLE: Pattern analysis** — participant who answers identically
  for all questions (e.g., always A) in a randomised MCQ set

### T20.3 — Add pattern bias detection to session results
In `apps/portal/lib/training/computeSessionResults.ts`, after existing
bias flag computation, add:

```typescript
// Check for uniform-selection pattern bias
// (always selecting option A or first option — likely not engaging)
const optionSelections = memberResponses
  .filter(r => r.selectedOptionId)
  .map(r => r.selectedOptionId);

if (optionSelections.length >= 5) {
  const uniqueSelections = new Set(optionSelections).size;
  if (uniqueSelections === 1) {
    // All responses were the same option — pattern bias
    biasFlags.push({
      type: 'UNIFORM_SELECTION',
      severity: 'HIGH',
      detail: `Participant selected the same option for all ${optionSelections.length} questions`
    });
  }
}
```

Also store the biasFlags in `BiasFlag` table for cross-instrument reporting:

```typescript
if (biasFlags.length > 0) {
  // We need a memberAssessmentId to link to — use a TDAS synthetic ID
  // Store flags with sessionId in the details JSON for traceability
  await prisma.biasFlag.createMany({
    data: biasFlags.map(f => ({
      memberAssessmentId: 'TDAS', // TODO: link to a MemberAssessment record when TDAS runner is built
      flagType: f.type,
      severity: f.severity,
      affectedLayer: 'TDAS_RESPONSE',
      correctionApplied: false,
      details: { sessionId, memberId, ...f },
    })),
    skipDuplicates: true,
  }).catch(() => {}); // Non-critical — log failure only
}
```

## Acceptance Tests
- [ ] Participant who selects same option for all questions gets UNIFORM_SELECTION flag
- [ ] Participant with varied responses gets no pattern bias flag
- [ ] Bias flags stored in TrainingSessionResult.biasFlags JSON
- [ ] No existing Phase 2 bias detection logic modified

---END STEP T20---


---BEGIN STEP T21---

# STEP T21 — WIRE PHASE 2 NORMATIVE CALIBRATION TO TDAS

## Agent operating mode: VERIFY + ADDITIVE CONFIGURATION.

## Purpose
Phase 2 `calibrateScore` is already called in Step T9's
`computeSessionResults`. This step verifies the NormativeProfile
table has TDAS-specific entries and seeds placeholder values for TDAS.

## Pre-conditions
- Step T20 completed.
- Phase 2 NormativeProfile table exists and has data.

## Instructions

### T21.1 — Check current normative profiles
```bash
cd packages/db-assessments
npx prisma db execute --stdin <<EOF
SELECT "assessmentType", COUNT(*) as count
FROM "NormativeProfile"
GROUP BY "assessmentType";
EOF
```

### T21.2 — Seed TDAS normative profiles
The `assessmentType = 'TDAS'` profiles do not exist yet.
Add to `apps/portal/prisma/seeds/normative-profiles.ts`:

```typescript
// TDAS normative profiles — placeholder until pilot data accumulates
const TDAS_COMPETENCY_CODES = [
  'A-01','A-02','A-03','A-04',
  'D-01','D-02','D-03',
  'AL-01','AL-02','AL-03',
  'P-01','P-02','P-03',
  'T-01','T-02','T-03',
];

for (const code of TDAS_COMPETENCY_CODES) {
  for (const cohort of COHORT_TYPES) {
    // TDAS sessions tend to score lower (10-minute quiz context)
    // Adjust mean down by ~5 points from ADAPT-16 defaults
    const { mean, std } = {
      STUDENT: { mean: 40.0, std: 14.0 },
      PROFESSIONAL: { mean: 50.0, std: 15.0 },
      CORPORATE: { mean: 55.0, std: 14.0 },
    }[cohort];

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
  }
}
```

**Do NOT run this seed yet — create the additions to the file for Binu's review.**

### T21.3 — Verify calibrateScore accepts TDAS type
In `apps/portal/lib/scoring/calibrateScore.ts`, the function signature
accepts `assessmentType: string = 'ADAPT_16'`. The TDAS call in T9
passes `'TDAS'` — confirm this is handled by the FALLBACK path until
the seed runs, and that the FALLBACK does not error.

## Acceptance Tests
- [ ] `calibrateScore(rawScore, 'A-01', 'PROFESSIONAL', 'TDAS')` returns without error
- [ ] Returns FALLBACK source before seed is run
- [ ] Returns NORMATIVE source after seed is run
- [ ] Seed file updated but NOT yet executed

---END STEP T21---


---BEGIN STEP T22---

# STEP T22 — WIRE PHASE 2 AssessmentDelta TO TDAS

## Agent operating mode: VERIFY + ADDITIVE.

## Purpose
The AssessmentDelta system (Phase 2 G4) tracks pre/post change per subject.
For TDAS, the delta should track improvement session-to-session within
the same Activity/module — did participants improve compared to the
previous time they took a session for this module?

## Pre-conditions
- Step T21 completed.

## Instructions

### T22.1 — Check current delta computation
```bash
head -50 apps/portal/lib/scoring/computeAssessmentDelta.ts
```
Note: it currently operates on `MemberAssessment` records.
TDAS uses `TrainingSessionResult` records.

### T22.2 — Add TDAS-specific delta to computeSessionResults
In `apps/portal/lib/training/computeSessionResults.ts`,
after storing `TrainingSessionResult`, add:

```typescript
// Compute session-over-session delta for this participant + module
const previousResult = await prisma.trainingSessionResult.findFirst({
  where: {
    session: { activityId: session.activityId },
    memberId,
    id: { not: /* the newly created result id */ undefined },
    completedAt: { lt: new Date() },
  },
  orderBy: { completedAt: 'desc' },
  take: 1,
});

let deltaFromLastSession: number | null = null;
if (previousResult) {
  deltaFromLastSession = rawScore - previousResult.rawScore;

  // Update the stored result with the delta
  await prisma.trainingSessionResult.update({
    where: { sessionId_memberId: { sessionId, memberId } },
    data: { deltaFromLastSession },
  });
}
```

### T22.3 — Surface delta in participant results page
In `apps/portal/app/assessments/training/sessions/[sessionId]/my-results/page.tsx`,
if `deltaFromLastSession` is not null, show:
- If positive: green badge "↑ +N% vs last session"
- If negative: amber badge "↓ N% vs last session"
- If zero: grey badge "Same as last session"

## Acceptance Tests
- [ ] Second session for same member + module shows a delta
- [ ] First session shows delta as null (no previous)
- [ ] Positive delta shown in green on participant results page
- [ ] Negative delta shown in amber

---END STEP T22---


---BEGIN STEP T23---

# STEP T23 — TDAS ANTI-CHEAT — RESPONSE-TIME FLAGGING FOR LIVE SESSIONS

## Agent operating mode: VERIFY + ADDITIVE.

## Purpose
Phase 2 G12 built response-time anomaly detection for ADAPT-16 self-administered
assessments (minimum plausible times: MCQ 8s, SJT 20s, etc.).
For TDAS live-session context, the time thresholds are different:
- Trainer controls pace in the room
- Questions are simpler (10-minute quiz format)
- Minimum plausible time is lower (5s for MCQ in live context)

This step adds TDAS-specific time thresholds without modifying the
existing Phase 2 `detectTimeAnomaly.ts`.

## Pre-conditions
- Step T22 completed.
- Phase 2 `detectTimeAnomaly.ts` confirmed present.

## Instructions

### T23.1 — Read Phase 2 anomaly detection
```bash
cat apps/portal/lib/assessment/detectTimeAnomaly.ts
```

### T23.2 — Create TDAS-specific time anomaly config
Create `apps/portal/lib/training/detectSessionTimeAnomaly.ts`:

```typescript
/**
 * TDAS Session Time Anomaly Detection
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T23
 *
 * Lower thresholds than Phase 2 detectTimeAnomaly.ts —
 * live classroom context allows faster responses.
 * These are separate functions — do NOT modify detectTimeAnomaly.ts.
 */

// Minimum plausible response times for LIVE SESSION context (milliseconds)
const TDAS_MIN_RESPONSE_MS: Record<string, number> = {
  MULTIPLE_CHOICE: 3000,   // 3s — read question + pick option
  TRUE_FALSE: 2000,        // 2s — binary decision
  SHORT_ANSWER: 10000,     // 10s — minimal typing
  RATING: 2000,            // 2s — slider/star selection
};

export function isTDASAnomalouslyFast(
  questionType: string,
  responseTimeMs: number
): boolean {
  const min = TDAS_MIN_RESPONSE_MS[questionType] ?? 3000;
  return responseTimeMs < min;
}

export function computeTDASSessionAnomalyScore(
  responses: Array<{ questionType: string; responseTimeMs: number | null }>
): { anomalyScore: number; flagged: boolean } {
  const timed = responses.filter(r => r.responseTimeMs !== null);
  if (!timed.length) return { anomalyScore: 0, flagged: false };

  const anomalousCount = timed.filter(r =>
    isTDASAnomalouslyFast(r.questionType, r.responseTimeMs!)
  ).length;

  const anomalyScore = anomalousCount / timed.length;
  return {
    anomalyScore: Math.round(anomalyScore * 100) / 100,
    flagged: anomalyScore > 0.5, // flag if > 50% of responses too fast (higher threshold for live)
  };
}
```

### T23.3 — Wire into computeSessionResults
In Step T9's `computeSessionResults`, replace the inline time check with a call
to `computeTDASSessionAnomalyScore` from this service. This makes the logic
testable and consistent.

## Acceptance Tests
- [ ] `isTDASAnomalouslyFast('MULTIPLE_CHOICE', 2500)` returns `true`
- [ ] `isTDASAnomalouslyFast('MULTIPLE_CHOICE', 4000)` returns `false`
- [ ] Threshold is lower than Phase 2 equivalent (3000 vs 8000 for MCQ)
- [ ] Phase 2 `detectTimeAnomaly.ts` unchanged

---END STEP T23---


---BEGIN STEP T24---

# STEP T24 — TDAS REPORTING — WRI IMPACT OF TRAINING SESSIONS

## Agent operating mode: ADDITIVE to existing analytics.

## Purpose
Training sessions now update CompetencyScore records (Step T9).
These updated scores feed into the Phase 2 Workforce Readiness Index (G7).
This step verifies the WRI correctly incorporates TDAS scores and updates
the relevant dashboards to show training-session-driven WRI improvement.

## Pre-conditions
- Step T23 completed.
- Phase 2 `computeWorkforceReadinessIndex.ts` confirmed present.

## Instructions

### T24.1 — Check WRI computation scope
```bash
grep -n "assessmentType" apps/portal/lib/analytics/computeWorkforceReadinessIndex.ts | head -10
```

The WRI currently filters on `assessmentType: 'ADAPT_16'`.
TDAS scores are stored with `assessmentType: 'TDAS'`.

### T24.2 — Decide: include or separate TDAS in WRI
The recommended approach: **keep WRI as ADAPT-16-only** for strategic
accuracy (WRI measures future-readiness, not training completion scores),
but add a parallel **Training Readiness Index (TRI)** metric for the
Ops and Observer dashboards.

Create `apps/portal/lib/analytics/computeTrainingReadinessIndex.ts`:

```typescript
/**
 * Training Readiness Index (TRI)
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T24
 *
 * Measures average module assessment performance across training sessions
 * for a client/tenant. Separate from WRI (which uses ADAPT-16 only).
 * TRI = weighted average of CompetencyScore.normalisedScore where
 * assessmentType = 'TDAS', across all active members of the tenant.
 */
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function computeTRI(tenantId: string): Promise<{
  tri: number;
  sessionsIncluded: number;
  memberCount: number;
}> {
  const cacheKey = `tri:${tenantId}`;
  const cached = await cacheGet<{ tri: number; sessionsIncluded: number; memberCount: number }>(cacheKey);
  if (cached) return cached;

  const scores = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: { member: { tenantId } },
      assessmentType: 'TDAS',
      normalisedScore: { not: null },
    },
    select: { normalisedScore: true, memberAssessmentId: true },
  });

  if (!scores.length) {
    const result = { tri: 0, sessionsIncluded: 0, memberCount: 0 };
    await cacheSet(cacheKey, result, 1800); // 30-min cache
    return result;
  }

  const total = scores.reduce((sum, s) => sum + (s.normalisedScore ?? 0), 0);
  const tri = Math.round(total / scores.length);
  const memberCount = new Set(scores.map(s => s.memberAssessmentId)).size;

  const result = { tri, sessionsIncluded: scores.length, memberCount };
  await cacheSet(cacheKey, result, 1800);
  return result;
}
```

### T24.3 — Add TRI to observer and ops dashboards
In `apps/portal/app/assessments/dashboard/observer/page.tsx` (T14),
add TRI as a 5th metric: "Training Readiness Index: X%".

In `apps/portal/app/assessments/dashboard/ops/page.tsx` (T13),
add TRI as a metric card showing "Avg Training Score across all sessions: X%".

### T24.4 — TypeScript check
```bash
cd apps/portal && npx tsc --noEmit 2>&1 | grep "TrainingReadiness\|computeTRI" | head -10
```

## Acceptance Tests
- [ ] WRI remains ADAPT-16-only (verify no changes to computeWorkforceReadinessIndex.ts)
- [ ] TRI computed from TDAS CompetencyScore records
- [ ] TRI cached for 30 minutes
- [ ] TRI appears in observer and ops dashboards
- [ ] TRI = 0 when no TDAS sessions have been completed

---END STEP T24---


---BEGIN STEP T25---

# STEP T25 — PHASE 3 MASTER VALIDATION (READ-ONLY)

## Agent operating mode: READ-ONLY verification. Write nothing.

## Purpose
Confirm all Phase 3 components are correctly wired, no regressions
introduced, and the full platform remains stable.

## Pre-conditions
- Steps T1–T24 all completed.

## Instructions

```bash
# 1. TypeScript — full check
cd apps/portal && npx tsc --noEmit 2>&1 | tail -5

# 2. Schema validation
cd packages/db-assessments && npx prisma validate 2>&1
cd ../db-core && npx prisma validate 2>&1

# 3. New tables present
cd packages/db-assessments
npx prisma db execute --stdin <<EOF
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'TrainingSession', 'TrainingSessionQuestion',
  'TrainingSessionResponse', 'TrainingSessionResult'
);
EOF

# 4. New routes exist
find apps/portal/app/api/training -name "route.ts" | sort
find apps/portal/app/assessments/training -name "*.tsx" | sort
find apps/portal/app/assessments/dashboard/trainer -name "*.tsx" | sort
find apps/portal/app/assessments/dashboard/observer -name "*.tsx" | sort
find apps/portal/app/assessments/dashboard/ops -name "*.tsx" | sort

# 5. Key service files present
ls apps/portal/lib/training/
ls apps/portal/lib/permissions/

# 6. Phase 1 + Phase 2 regressions check
# These should still be untouched:
grep -l "computeCompetencyScores\|computeCareerFitScores\|detectBias\|calibrateScore" \
  apps/portal/lib/scoring/ | sort

# 7. Role routing
grep -n "TRAINER\|SUDAKSHA_OBSERVER\|OPS_DELIVERY" apps/portal/lib/dashboardRouting.ts
```

## Output format required
```
T25 PHASE 3 VALIDATION
TypeScript error count: [number — ideally 0 or same baseline as Phase 2]
Both schemas validate: [YES/NO]
4 new tables in DB: [YES/NO]
Training API routes: [count]
Training UI pages: [count]
trainer/ directory: [exists YES/NO]
observer/ directory: [exists YES/NO]
ops/ directory: [exists YES/NO]
lib/training/ files: [list]
lib/permissions/ files: [list]
Phase 2 scoring services untouched: [YES/NO]
TRAINER role in dashboard routing: [YES/NO]
SUDAKSHA_OBSERVER in dashboard routing: [YES/NO]
```

## Master Acceptance Checklist

**Schema:**
- [ ] `TrainingSession` table exists
- [ ] `TrainingSessionQuestion` table exists
- [ ] `TrainingSessionResponse` table exists
- [ ] `TrainingSessionResult` table exists
- [ ] Both schemas validate with no errors
- [ ] No existing tables modified

**RBAC:**
- [ ] SUDAKSHA_OBSERVER gets cross-tenant access on every read/write API
- [ ] TRAINER is scoped to own sessions only
- [ ] OPS_DELIVERY sees all sessions within their tenant
- [ ] `isCrossTenantRole('SUDAKSHA_OBSERVER')` returns true
- [ ] Observer API returns 403 for non-observer roles

**Session lifecycle:**
- [ ] Create session → questions randomly selected + seed stored
- [ ] Start session → status = ACTIVE
- [ ] Participant joins → totalParticipants incremented (non-duplicate)
- [ ] Participant answers → response stored with timing
- [ ] Complete session → TrainingSessionResult created per participant
- [ ] Results include normalisedScore and proficiencyLevel

**Patent compliance (TDAS-specific):**
- [ ] Bias detection: UNIFORM_SELECTION + RAPID_RESPONSE flags created
- [ ] Normative calibration: TDAS normative profiles seeded (or FALLBACK used cleanly)
- [ ] Delta: session-over-session delta stored in TrainingSessionResult
- [ ] Anti-cheat: response-time anomaly uses TDAS thresholds (3s MCQ, not 8s)

**Dashboards:**
- [ ] Trainer dashboard renders at `/assessments/dashboard/trainer`
- [ ] Ops dashboard renders at `/assessments/dashboard/ops`
- [ ] Observer dashboard renders at `/assessments/dashboard/observer`
- [ ] Live session view polls every 5/15 seconds
- [ ] Participant UI hides correct answers during live session

**No regression:**
- [ ] Phase 1 individual dashboard still shows all 5 sections
- [ ] Phase 2 ADAPT-16 / RBCA / SCIP scoring unchanged
- [ ] Phase 2 WRI unchanged (ADAPT-16 only — TDAS has its own TRI)
- [ ] Role routing for CEO, HR Head, Team Lead etc. unchanged

**Outstanding manual steps (Binu / DBA):**
- [ ] Run Prisma migrations: `phase3_training_delivery` in both packages
- [ ] Update normative-profiles.ts seed file to include TDAS entries (T21)
- [ ] Run seed after review: `npx ts-node prisma/seeds/normative-profiles.ts`
- [ ] Configure env if not done: REDIS_URL, AWS keys (from Phase 2 G19/G20)
- [ ] Wire a real PDF renderer for session report export (from Phase 2 G20)

---END STEP T25---


---

## PHASE 3 SUMMARY

| Component | Steps | Description |
|---|---|---|
| Schema | T2, T3, T4, T5 | 4 new tables + RBAC roles + migrations |
| Core services | T6, T7, T9 | Question upload, random selection, result computation |
| Session APIs | T8, T17 | Create / start / respond / complete / join / status |
| Trainer UI | T10, T11, T12 | Dashboard + live view + results |
| Ops UI | T13, T18 | Ops dashboard + question bank admin |
| Observer UI | T14, T15 | Cross-tenant command centre + drill-downs |
| Participant UI | T16 | Take assessment during live class |
| Phase 2 integration | T20, T21, T22, T23, T24 | Bias, calibration, delta, anti-cheat, TRI |
| Reports | T19 | Individual + class report pages |
| Validation | T25 | Full acceptance checklist |

---

*SEPL/INT/2026/IMPL-PHASE3-01 | April 2026 | STRICTLY CONFIDENTIAL*
*Total Phase 3 steps: 25 (T1–T25)*
*Prerequisite: Phase 1 (IMPL-STEPS-01, 25 steps ✅) + Phase 2 (IMPL-GAPS-01, G1–G20 ✅)*
*Combined implementation series: 70 steps across all three phases*
