# SYSTEM ERROR LOG — TRA Portal Fixes

**Date:** 2026-03-07
**Engineer:** Claude (Sudaksha AI Pair)
**Scope:** Tanzania Revenue Authority (TRA) ICT Department — Assessment Portal Fixes

---

### [BUG-007] TNI Phantom Gaps
- **Issue:** Missing \`if (!scores || scores.length === 0) continue;\` check caused TNI generator to evaluate unassessed competencies, defaulting their scores to 0% and creating phantom "CRITICAL" gaps.
- **Root Cause:** Developer assumed \`role.competencies\` map would inherently filter by session scope. It does not.
- **Fix:** Added \`.filter\` bounds in \`tni/page.tsx\`, \`gap-analysis/route.ts\`, and \`results/[id]/page.tsx\` before gap computation. Centralized gap banding into \`lib/tni-utils.ts\`.

## FIX 1 (P0) — Full Workflow Verification

**Status:** VERIFIED
**Finding:** The take page at `apps/portal/app/assessments/(portal)/take/[id]/page.tsx` correctly handles both `ProjectUserAssessment` (org B2B) and `MemberAssessment` (B2C/B2B member) paths. The `AssessmentRunner` component handles all section types (MCQ, Voice, Video, Adaptive, Conversational, Panel). Completed/Submitted assessments correctly redirect to results page.

---

## FIX 2 (P0) — Multi-Section Assessment Resume Bug

**Status:** FIXED
**File Changed:** `apps/portal/app/api/assessments/runner/[id]/resume/route.ts`

**Problem:** The resume route only had a `POST` handler (which performs the actual resume action). There was no `GET` handler to query resume state, causing the browser-close scenario to have no recovery mechanism.

**Fix:** Added `GET /api/assessments/runner/[id]/resume` handler that:
- Resolves `email → member → memberAssessment → UAM`
- Calls existing `getResumeState(uam.id)` from `session-checkpoint.ts`
- Returns `{ canResume, resumeFromSection, completedSections, savedResponses }`
- Gracefully returns `{ canResume: false, resumeFromSection: 0, ... }` for missing/invalid state

---

## FIX 3 (P1) — Gap Score Calculation

**Status:** FIXED
**Files Changed:**
- `apps/portal/app/api/assessments/[id]/gap-analysis/route.ts`
- `apps/portal/components/assessments/CompetencyGapAnalysis.tsx`

**Problem (API):** `LEVEL_MAP` used `BEGINNER/INTERMEDIATE/ADVANCED/EXPERT` as keys with percentage values (25/50/75/100). Schema `ProficiencyLevel` enum is `JUNIOR/MIDDLE/SENIOR/EXPERT`. Gap was calculated as percentage difference, not integer level difference.

**Fix (API):**
- Changed to `LEVEL_INT: { JUNIOR:0, MIDDLE:1, SENIOR:2, EXPERT:3 }`
- Added `percentageToLevelInt()` to convert assessment % → proficiency integer: `<25%→JUNIOR, 25-49%→MIDDLE, 50-74%→SENIOR, ≥75%→EXPERT`
- Gap = `requiredLevelInt - achievedLevelInt` (integer)
- Priority: `gap≥2→HIGH, gap===1→MEDIUM, gap===0→NONE, gap<0→EXCEEDS`
- Added **MemberAssessment path**: if `ProjectUserAssessment` not found, resolves via `member.currentRole.competencies`
- Legacy percentage fields preserved for backward compatibility

**Fix (Component):**
- Added new integer-level table view: Competency | Required | Achieved | Gap | Priority
- Pip-chart UI (4 squares) replaces raw percentage bars when `requiredLevelInt` data present
- Legacy percentage bar view retained for older `ProjectUserAssessment` data
- Priority badges: HIGH (red), MEDIUM (amber), NONE (green), EXCEEDS (blue)

---

## FIX 4 (P1) — Admin Results View

**Status:** FIXED
**File Changed:** `apps/portal/app/assessments/org/[slug]/results/page.tsx`

**Problem:** Page only queried `session.user.id`'s own results regardless of role. No admin view to see all employees.

**Fix:**
- Detects `TENANT_ADMIN`, `DEPARTMENT_HEAD`, `SUPER_ADMIN` roles via session
- **Admin path:** queries ALL `MemberAssessment` records where `member.tenantId === tenant.id` with status COMPLETED; shows member name, email, role, department, score, date
- **Download CSV button** links to `GET /api/assessments/export/csv?tenantId=...`
- **Employee path:** unchanged — shows own assessments only

---

## FIX 5 (P2) — CSV Export

**Status:** IMPLEMENTED
**File Created:** `apps/portal/app/api/assessments/export/csv/route.ts`

**Route:** `GET /api/assessments/export/csv?tenantId=<id>`

**Behaviour:**
- Requires TENANT_ADMIN / DEPARTMENT_HEAD / SUPER_ADMIN
- Returns `text/csv` with `Content-Disposition: attachment` header
- Columns: Employee ID, Name, Email, Role, Department, Assessment, Score (%), Passed, Completed At
- Filename: `assessment-results-<tenant-name>-<date>.csv`

---

## FIX 6 (P3) — TNI Auto-Generation Page

**Status:** IMPLEMENTED
**Files Created:**
- `apps/portal/lib/training-recommendations.ts`
- `apps/portal/app/assessments/org/[slug]/tni/page.tsx`

**Route:** `/assessments/org/[slug]/tni`

**Behaviour:**
- Admin-only (same role check as results page)
- Iterates all completed assessments for the tenant
- Resolves each member's `currentRole.competencies` for required levels
- Fetches UAM component results to calculate achieved levels
- Computes gap + priority using same logic as FIX 3
- Groups gaps by competency, shows affected member count
- Maps each competency to training programmes via `COMPETENCY_TRAINING_MAP`
- `generateTNI()` function handles exact and partial competency name matching; falls back to generic Sudaksha programme if no match found
- Summary: total HIGH gaps, MEDIUM gaps, competencies needing dev, assessments analysed

---

## Pre-existing Build State

Both builds run before changes (captured in task output files) showed `exit code 0` with `✓ Compiled successfully`. No TypeScript errors in baseline. All new files follow existing TypeScript patterns.

---

Network Administration, Cybersecurity, Database Management, Systems Analysis, IT Project Management, Software Development, Cloud Computing, Leadership, Communication, Problem Solving, Data Analysis.

---

## Individual Assessment Report — Full Rebuild (2026-03-21)

**Files Changed:**
- `apps/portal/lib/tni-utils.ts` — Added `CareerContext`, `buildCareerContext`, `getExperienceStanding`, `computeOverallFitment`, `getReadinessVerdict`
- `apps/portal/lib/report-ai.ts` — NEW: parallelised Claude API narrative generation (executive summary, gap insight, capability trajectory) with graceful plaintext fallbacks
- `apps/portal/app/assessments/(portal)/results/[id]/page.tsx` — Complete rebuild

### [REPORT-001] Schema migration not required
- **Finding:** `AssessmentModelComponent.weight Float @default(1.0)` already exists in schema (line 932). No Prisma migration needed.

### [REPORT-002] Weighted score synthesis implemented
- **Fix:** `synthesizeCompetencyScores()` in the rebuilt page computes a weighted average across all components per competency using `component.weight`. Unlinked components (no `competencyId`) are skipped per Principle 3.

### [REPORT-003] Mode A / Mode B branching enforced
- **Fix:** `isRoleBased` flag gates all role-specific sections (Section 2 Gap Analysis, Section 4 TNI). Mode B (standalone) shows a flat competency list sorted by score.

### [REPORT-004] Career profile context integrated into AI narratives
- **Finding:** No separate `CareerProfile` table exists. All career data lives in `Member.careerFormData` (jsonb), `Member.previousRoles`, `Member.selfAssignedCompetencies`.
- **Fix:** `buildCareerContext()` extracts `certifications`, `strengths`, `areasToImprove`, `performanceRating`, `learningPreferences`, `selfAssessmentScores`, `goals`, `responsibilities` from `careerFormData`.
- **AI prompts** reference these exact fields for context-aware executive summary, gap insight, and capability trajectory narratives.

- **FO-001:** Wire the `aspirationalRole` into Mode B progression messaging once B2C career goals flow is complete.
- **FO-002:** Add PDF export of the 5-section report (print-friendly CSS or Puppeteer server action).
- **FO-003:** Consider caching AI narratives in `MemberAssessment.aiEvaluationResults` to avoid re-generating on every page load.
- **FO-004:** `previousRoles` and `experience` fields in `careerFormData` currently have no data. Enrich the career form to capture these and feed them into the trajectory prompt.

---

## Individual Assessment Report — Post-Rebuild Fixes (2026-03-21)

**File Changed:** `apps/portal/app/assessments/(portal)/results/[id]/page.tsx`

### [FIX-001] Instrument blocks removed (AT-1)
- **Problem:** `AIResultCard` rendered a full block per VIDEO/VOICE/ADAPTIVE_AI component result. These showed IRT scores, ability estimates, and per-dimension video scores directly in the UI.
- **Fix:** Removed all `AIResultCard` usage and the entire "Section Breakdowns" sub-section from the JSX. The entire Section 3 now iterates the synthesised `gapRows`/`standaloneCompetencies` maps only. No instrument block can appear.

### [FIX-002] Competency duplicates eliminated (AT-2)
- **Problem:** Section 3 iterated `componentResults` directly — one card per component row, not per competency. A competency assessed by two instruments (e.g. MCQ + SITUATIONAL) produced two separate cards.
- **Fix:** Section 3 JSX now iterates `gapRows` (Mode A) or `standaloneCompetencies` (Mode B) — both are derived from the synthesised `competencyScores` Map, which has exactly one entry per unique assessed competency.
- **Confirmed from Fix 6 DB data:** `Business Process Architecture` had MCQ=60% and SITUATIONAL=60% → single synthesis result: 60%.

### [FIX-003] Uncalibrated video scores excluded from synthesis (AT-5)
- **Problem:** VIDEO component for `Data-Driven Analysis` has `percentage: 70, score: 70, maxScore: 100` — the hardcoded default when AI analysis is unavailable. This 70% was entering synthesis and inflating the competency score.
- **Fix:** Added `isUncalibratedInstrument()` guard: any VIDEO/VOICE/ADAPTIVE_AI/ADAPTIVE_QUESTIONNAIRE result with `percentage === 70` is skipped from synthesis. `Data-Driven Analysis` now computes from the ADAPTIVE_AI component only (0%), giving a true 0% synthesised score.
- **DB evidence:** UAM `cmmd6rf8p000i12u1sy0fd2ln` — VIDEO result: `percentage: 70, score: 70` → excluded.

### [FIX-004] Fitment Index is the headline number (AT-3)
- **Problem:** `overallScore: 17%` was the large 4xl number. `fitmentPct: 69%` was secondary.
- **Fix:** Fitment Index is now the 6xl headline. Raw average component score (`17%`) appears as small muted text: `"Avg component score: 17%"`.

### [FIX-005] TNI justification always generated (AT-4)
- **Problem:** When `mainCr` was null (no calibrated component result for a competency), the else-branch returned the generic fallback string without calling `generateTNIJustification`. This affected competencies assessed only via uncalibrated video.
- **Fix:** `generateTNIJustification` is always called even when `mainCr` is null. The AI function handles its own fallback internally. Cache write to `userAssessmentComponent` is attempted only if `mainCr` exists and is wrapped in try/catch so cache failure is non-fatal.

### [FIX-006] Innovation & Solution Design 0% confirmed real (AT-6)
- **DB query on UAM `cmmd6rf8p000i12u1sy0fd2ln`:**

| Component | Type | Status | % | Score/Max |
|---|---|---|---|---|
| Innovation & Solution Design | PANEL | COMPLETED | **0%** | 0/100 |
| Innovation & Solution Design | VOICE | COMPLETED | **0%** | 0/100 |

- **Verdict: REAL SCORE.** The candidate scored 0 on both the panel interview and the voice component. This is not a phantom gap. No change needed — the 0% (Significant Gap) is correctly included in the gap analysis and TNI.
