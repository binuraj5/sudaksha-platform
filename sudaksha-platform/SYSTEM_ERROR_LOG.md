# SYSTEM ERROR LOG — TRA Portal Fixes

**Date:** 2026-03-07
**Engineer:** Claude (Sudaksha AI Pair)
**Scope:** Tanzania Revenue Authority (TRA) ICT Department — Assessment Portal Fixes

---

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

## Competencies Covered in Training Map

Network Administration, Cybersecurity, Database Management, Systems Analysis, IT Project Management, Software Development, Cloud Computing, Leadership, Communication, Problem Solving, Data Analysis.
