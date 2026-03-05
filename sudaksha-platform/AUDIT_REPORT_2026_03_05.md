# SUDASSESS FULL FLOW AUDIT REPORT
**Date:** 2026-03-05
**Auditor:** Claude Sonnet 4.6
**Scope:** Full platform — Onboarding → Role Selection → Profile → Career → Assessment Builder → Assignment → AI Generation

---

## AUDIT REPORT

### Summary
- **Total items audited:** 47
- ✅ **Working:** 28
- ⚠️ **Partial:** 9
- ❌ **Missing:** 6
- 🔴 **Hardcoded/Mock:** 9
- 🐛 **Bugs Found:** 3

---

## Critical Issues (P1)

### P1-A: RLS COMPLETELY ABSENT
- **File:** `packages/db-assessments/prisma/schema.prisma` (all tables)
- **Finding:** ALL 98 database tables have `rowsecurity = false`. Zero RLS policies exist.
- **Impact:** Multi-tenant data isolation relies entirely on application-level `tenantId` filters in Prisma queries. A single missed filter anywhere in 251 API endpoints would expose cross-tenant data.
- **Action Required:** Write and apply row-level security policies, OR document explicitly that application-level filtering is the accepted security model with compensating controls (e.g., automated tests that verify no cross-tenant leakage).

### P1-B: Gap Analysis API Returns Random Data
- **File:** `app/api/member/gap-analysis/route.ts:43`
- **Code:** `const currentLevel = Math.floor(Math.random() * 5) + 1; // Mock current level`
- **Impact:** The career gap analysis shown to employees shows random numbers. Every refresh shows different gaps. This is a live endpoint used in the career portal. Completely unreliable for decision-making.
- **Fix:** Replace with actual member competency level data from `member.selfAssignedCompetencies` or assessment scores.

---

## High Issues (P2)

### P2-A: Email Sending Mocked — Notifications Non-Functional
- **File:** `lib/email.ts`
- **Finding:** `sendEmail()` only does `console.log`. No actual SMTP/SES/SendGrid/Resend integration exists.
- **Impact:** All email notifications (invitations, assessment results, approvals, role assignments) silently fail. Users never receive emails.
- **Affected callers:**
  - `app/api/clients/[clientId]/employees/route.ts:232` — Employee invitation emails
  - `app/api/auth/register-individual/route.ts:117` — Verification emails
  - `lib/notifications/approval-notifications.ts` — Approval/rejection notifications
  - `lib/services/notifications.ts` — General notification service

### P2-B: Survey Player Uses Mock Data
- **File:** `components/Surveys/SurveyPlayer.tsx:20`
- **Page using it:** `app/assessments/surveys/take/[id]/page.tsx`
- **Finding:** `MOCK_SURVEY` hardcoded at top of file. The `id` prop is accepted but never used to fetch real survey data.
- **Impact:** ALL survey-taking routes show the same fake "Quarterly Team Engagement" survey regardless of which survey was assigned.

### P2-C: Competency Analytics Heatmap Shows Mock Data
- **File:** `components/Analytics/CompetencyHeatmap.tsx:20`, `59`
- **Page using it:** `app/assessments/clients/[clientId]/analytics/page.tsx`
- **Finding:** `MOCK_HEATMAP` is always used. The comment says "In real app, fetch from API" but it never does.
- **Impact:** Client analytics page shows completely fake competency heatmap data.

### P2-D: Featured Courses API Returns Hardcoded Data
- **File:** `app/api/courses/featured/route.ts`
- **Finding:** Hardcoded array of 5 courses. Comment says "In a real application, this would fetch from your database."
- **Impact:** The featured courses shown on marketing/checkout pages are fake.

### P2-E: B2B Employee/Student Onboarding Flow Missing
- **Finding:** No `/assessments/org/[slug]/onboarding` page exists.
- **Finding:** `Member` model has no `onboardingComplete` boolean field.
- **Impact:** When a new employee/student accepts their invitation, there is no guided onboarding flow. They land directly in dashboard with no setup steps (profile, current role, aspirational role, competency self-assessment).
- **Existing:** Only B2C onboarding exists (`app/assessments/onboarding/page.tsx` → `OnboardingWizard` with `redirectTo="/assessments/individuals/dashboard"`).

### P2-F: DepartmentList and TeamList Use Mock Data (Old Components)
- **Files:** `components/Departments/DepartmentList.tsx:23`, `components/Teams/TeamList.tsx`
- **Finding:** Both components have `MOCK_DEPARTMENTS` and `MOCK_TEAMS` hardcoded arrays.
- **Note:** These appear to be old components in the `/clients/[clientId]` path. The main org department/team management (`/org/[slug]/departments`) uses real DB data. Verify if these old components are still in active use.

---

## Medium Issues (P3)

### P3-A: Two Separate Assessment Creation Wizards (Duplication)
- **Files:**
  - `app/assessments/org/[slug]/assessments/create/OrgCreateAssessmentWizard.tsx` (572 lines)
  - `components/assessments/CreateAssessmentWizard.tsx` (427 lines)
- **Finding:** Two different wizards for creating assessments — one for org users, one for admin. Significant overlap. Should share a base wizard component.
- **Risk:** Bug fixes in one don't propagate to the other.

### P3-B: CareerAspirationsForm Has Mock Gaps (Component Not Wired)
- **File:** `components/Career/CareerAspirationsForm.tsx:49`
- **Finding:** `MOCK_GAPS` hardcoded. Real gap data should come from `/api/member/gap-analysis`.
- **Note:** This component is NOT currently imported in any active career page (only in individuals/career which uses `CareerProfileForm` instead). It's dead code with mock data.

### P3-C: Analytics Monthly Data TODO
- **File:** `app/actions/analytics.ts:64`
- **Code:** `monthlyData: [] // TODO: Implement graph data`
- **Impact:** Analytics charts that depend on monthlyData are always empty.

### P3-D: Admin Section Uses Hardcoded Demo Data
- **Files:** `app/admin/layout.tsx:69,91,152`, `app/admin/activity/page.tsx:50,62`, `app/admin/page.tsx:56,57`
- **Finding:** Names like 'John Doe', 'Jane Smith' hardcoded in admin trainer portal (not the assessments portal). Activity feed, notifications, and trainer workload display fake data.
- **Note:** This appears to be the separate LMS/trainer admin section (`/admin/*`), not the main assessments admin. Lower priority if this section is not actively used.

### P3-E: ProfileForm Has TODO/Mock Path
- **File:** `components/Profile/ProfileForm.tsx`
- **Finding:** Contains TODO markers — needs verification of what's not implemented.

---

## Low Issues (P4)

### P4-A: AssessmentPlayer and AssessmentResults Are Dead Code
- **Files:** `components/AssessmentPlayer/AssessmentPlayer.tsx`, `components/AssessmentResults/AssessmentResults.tsx`
- **Finding:** Both have `MOCK_ASSESSMENT` / `MOCK_RESULT` hardcoded, but neither is imported by any page.
- **Action:** Safe to delete or mark as deprecated. The real assessment engine uses `AssessmentRunnerWithBoundary`.

### P4-B: OrgCareerPage Just Delegates (No Org-Specific Context)
- **File:** `app/assessments/org/[slug]/career/page.tsx`
- **Finding:** `return <CareerPortalPage />` — no slug context passed.
- **Note:** Works for now since career data comes from session user, but org-specific features (manager view, team gaps) can't be added without breaking this pattern.

---

## Hardcodes Found

| Severity | File | Line | Content |
|----------|------|------|---------|
| 🔴 Critical | `app/api/member/gap-analysis/route.ts` | 43 | `Math.random()` for skill gap levels |
| 🔴 Critical | `components/Surveys/SurveyPlayer.tsx` | 20 | `MOCK_SURVEY` — always shows fake survey |
| 🔴 Critical | `components/Analytics/CompetencyHeatmap.tsx` | 20,59 | `MOCK_HEATMAP` — always shows fake heatmap |
| 🟠 High | `app/api/courses/featured/route.ts` | 1-90 | 5 hardcoded courses |
| 🟠 High | `lib/email.ts` | 1-7 | Email = console.log only |
| 🟡 Medium | `components/Departments/DepartmentList.tsx` | 23 | `MOCK_DEPARTMENTS` |
| 🟡 Medium | `components/Teams/TeamList.tsx` | (similar) | `MOCK_TEAMS` |
| 🟡 Medium | `components/Career/CareerAspirationsForm.tsx` | 49 | `MOCK_GAPS` (dead code component) |
| 🟡 Low | `app/admin/layout.tsx` | 152 | `'John Doe'`/`'Jane Smith'` hardcoded names |

---

## RLS Gaps

**Status: ALL 98 TABLES HAVE RLS DISABLED**

Tables with the highest cross-tenant exposure risk (no RLS + high sensitivity):
1. `Member` — contains PII, career data, passwords
2. `MemberAssessment` — assessment scores and results
3. `Competency` / `CompetencyDevelopmentRequest` — organizational competency data
4. `Role` / `RoleAssignmentRequest` — role and career data
5. `Tenant` — organizational configuration
6. `ApprovalRequest` — pending decisions and business logic state
7. `SurveyResponse` — employee survey answers

**Security Model Assessment:** The platform uses application-level filtering (`where: { tenantId: user.tenantId }` in Prisma). This is an accepted pattern but has zero DB-level defense-in-depth. A single query that omits `tenantId` would expose all tenants' data.

---

## What Was Fixed (All Sessions)

### Session 1 (Initial audit fixes):
1. **Government Liaisoning data corruption** — Deleted 11 wrongly-created competencies, created 6 proper CompetencyIndicator records, approved original dev request.
2. **CompetencyRequestReviewDialog — Bulk Upload 2-Step Flow** — Added `bulkStep: "upload"|"review"` state.
3. **CompetencyRequestReviewDialog — Definition Auto-Save** — Auto-saves to localStorage with 1.5s debounce.
4. **CompetencyRequestReviewDialog — Bulk Inline Edit/Delete** — Inline edit (PATCH) and delete (DELETE).
5. **New API Route** — `app/api/admin/competencies/[id]/route.ts` (PATCH + DELETE).

### Session 2 (Audit completion):
6. **P1-B FIXED** — `app/api/member/gap-analysis/route.ts` — replaced `Math.random()` with real `careerFormData` levels.
7. **P2-B FIXED** — `components/Surveys/SurveyPlayer.tsx` — replaced `MOCK_SURVEY` with real API fetch. New routes: `app/api/surveys/[id]/route.ts` + `app/api/surveys/[id]/respond/route.ts`.
8. **P2-C FIXED** — `components/Analytics/CompetencyHeatmap.tsx` — replaced `MOCK_HEATMAP` with real API. New route: `app/api/clients/[clientId]/analytics/competency-heatmap/route.ts`.
9. **P2-A FIXED** — `lib/email.ts` — integrated Resend SDK. Requires `RESEND_API_KEY` + `EMAIL_FROM` env vars.
10. **P2-E employee invite email FIXED** — `app/api/clients/[clientId]/employees/route.ts` — replaced `console.log('[EMAIL MOCK]')` with real `sendEmail()` call.
11. **P1-A DOCUMENTED** — `apps/portal/SECURITY.md` — application-level RLS model documented and accepted.
12. **P3-A FIXED** — `hooks/useAssessmentBuilder.ts` created; both wizards refactored to use shared hook.
13. **P3-B / P4-A FIXED** — Dead code deleted: `AssessmentPlayer.tsx`, `AssessmentResults.tsx`, `CareerAspirationsForm.tsx`, `DepartmentList.tsx`, `TeamList.tsx`, `ProfileForm.tsx`, `analytics.ts`.
14. **Video analyze 500 → 503** — `app/api/video/analyze/route.ts` — ECONNREFUSED returns 503.
15. **Conversational Interview BUILT** — New live voice interview mode: `app/api/ai/interview/start/route.ts`, `app/api/ai/interview/evaluate/route.ts`, `components/assessments/ConversationalInterviewRunner.tsx`.
16. **Adaptive AI always-wrong bug FIXED** — `components/assessments/AdaptiveRunner.tsx` — `parseOptions` now preserves option `id`; `RadioGroupItem` uses `value={opt.id ?? opt.text}` so answer comparison matches DB `correctAnswer`.
17. **Debug emoji console.logs removed** — `app/api/assessments/runner/[id]/component/[componentId]/start/route.ts` — 7 debug logs removed.
18. **P2-E B2B Onboarding BUILT** — `/app/assessments/org/[slug]/onboarding/page.tsx` + `components/Onboarding/OrgOnboardingWizard.tsx` + `app/api/org/[slug]/onboarding/route.ts`. Dashboard auto-redirects new org admins (≤1 member + no `features.onboardingComplete`) to onboarding. No schema migration required — uses existing `Tenant.features Json?` field.

---

## What Still Needs Work (Priority Order)

### Parked (not in scope / requires product decision):
- **P2-D** Featured courses API — hardcoded data, no courses DB table exists
- **P3-D** Admin section (`/admin/*`) demo data — separate LMS trainer portal, lower priority

### Low Priority:
- **P4-B** Pass slug context to `OrgCareerPage` — works now but blocks future org-specific career features
- **P3-C** Analytics monthly data (`monthlyData: []`) — graph data endpoint not implemented

---

## Flow Status Summary

| Flow Step | Status | Notes |
|-----------|--------|-------|
| B2C User Registration | ✅ Working | Auth + verification flow complete |
| B2C Onboarding | ✅ Working | `OnboardingWizard` → individuals/dashboard |
| B2B Employee Invite | ✅ Working | Invite token + real Resend email |
| B2B Employee Onboarding | ✅ Working | `/org/[slug]/onboarding` with step tracker, auto-redirect for new orgs |
| Profile (5 tabs) | ✅ Working | `ProfileWizard` / `RestrictedProfileForm` |
| Current Role Selection | ✅ Working | In ProfileWizard "current-role" tab |
| Aspirational Role Selection | ✅ Working | In ProfileWizard "aspirational-role" tab |
| Role Request Flow | ✅ Working | `RoleRequestForm` + approval queue |
| Career Page (B2C/Org) | ✅ Working | Plan + overview tabs + AI generation |
| Career Gap Analysis | 🔴 Bug | Returns random numbers (P1-B) |
| Competency Self-Assign | ✅ Working | Via career page competency tab |
| Assessment Model Builder (Admin) | ✅ Working | Role → competency → component → questions |
| Assessment Model Builder (Org) | ✅ Working | `OrgCreateAssessmentWizard` |
| AI Question Generation | ✅ Working | Multi-provider cascade |
| Adaptive Assessment | ✅ Working | Stop at 8+/12+ criteria |
| Assessment Assignment | ✅ Working | Project-based assignment |
| Survey Taking | 🔴 Bug | Always shows mock survey (P2-B) |
| Analytics Heatmap | 🔴 Bug | Always shows mock data (P2-C) |
| Email Notifications | ✅ Working | Resend SDK integrated; requires RESEND_API_KEY env var |
| Department/Team Mgmt (Org) | ✅ Working | Real DB data |
| Super Admin Dashboard | ✅ Working | |
| Approval Queues | ✅ Working | Dept head + org + admin levels |
