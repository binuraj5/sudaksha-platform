# Strategic Implementation Checklist

**Source:** STRATEGIC_ACTION_PLAN.md  
**Purpose:** Map phased plan to current implementation status and files.

**Current phase:** **Phase 3 – Institution Module (M5–M8).** Phase 2 complete (code testing, scenario-based, AI voice/video done; Runtime AI deferred).

---

## Immediate Next Steps (Plan)

| Step | Action | Status | Notes |
|------|--------|--------|--------|
| 1 | Fix gray overlay (GLOBAL_OVERLAY_FIX.md) | ✅ Doc created | No global overlay in layout/globals as of last check |
| 2 | Audit current state (ANTIGRAVITY_AUDIT_PROMPT_COMPREHENSIVE.md) | ⚠️ Manual | Run audit when needed |
| 3 | Decide architecture (Monolith vs Turborepo) | ⚠️ Decision | Current: Monolith |

---

## Phase 1: Foundation

### Week 1: Core Authentication & Navigation

| Item | Requirement | Status | Location / Notes |
|------|-------------|--------|-------------------|
| Universal login | Username/password, role-based redirect | ✅ | `app/assessments/(auth)/login/page.tsx`, default callbackUrl `/assessments` |
| Post-login redirect | Super Admin → admin; Tenant Admin → clients/[id]; Employee → dashboard | ✅ | `app/assessments/page.tsx` (role-based redirect when session exists) |
| Auth config | NextAuth callbacks, session (role, clientId, tenantSlug) | ✅ | `src/lib/auth-config.ts` |
| Navigation (polymorphic) | Admin menu + My Profile, tenant labels | ✅ | `lib/navigation-config.ts`, `lib/tenant-labels.ts`, `hooks/useTenant.ts` |
| Sign-in page | NextAuth pages.signIn | ✅ | `authOptions.pages.signIn: "/assessments/login"` |

### Week 2: User Management (M1–M3)

| Item | Requirement | Status | Location / Notes |
|------|-------------|--------|-------------------|
| M1 Corporate Admin | Dashboard, Departments, Employees, Projects, Teams, Assessments, Reports, Settings | ✅ | `app/assessments/clients/[clientId]/` (dashboard, departments, employees, projects, teams, assessments, reports, settings) |
| M2 Department Head | Scoped to department | ✅ | Layout/API scope by `managedOrgUnitId`; my-department view |
| M3 Team Lead | Scoped to team | ✅ | my-team view; permissions in APIs |
| Polymorphic labels | Institution = Faculty/Classes/Students; Corporate = Department/Teams/Employees | ✅ | `lib/tenant-labels.ts`; employees/departments pages use tenant type |
| Org units by tenant | Only current tenant’s org units | ✅ | Entities API and departments page filter by tenantId |

### Week 3: Employee Portal & Basic Assessment (M4, M9)

| Item | Requirement | Status | Location / Notes |
|------|-------------|--------|-------------------|
| M4 Employee portal | My Profile, My Assessments, Take assessment, Results | ✅ | `app/assessments/(portal)/` (profile, dashboard, take, results) |
| M9 Basic assessment | Create model, assign, take, results | ✅ | Admin models, assignment flows, take/[id], results |
| Assessment creation | Role-based, level selection | ✅ | `app/assessments/admin/models/create/page.tsx`, from-role API |
| Student restrictions | Junior/Middle for students; Senior/Expert disabled for students | ✅ | `lib/assessment-student-restrictions.ts`, assessment create UI |

---

## Phase 2: Intelligent Assessment System

| Item | Status | Location / Notes |
|------|--------|-------------------|
| Role-based creation | ✅ | Existing |
| Competency pick & choose | ✅ | Existing |
| Template system | ✅ | `app/assessments/admin/templates/page.tsx` – list, search, seed, delete; API `/api/admin/assessment-models?visibility=SYSTEM` |
| Scenario-based questions | ✅ | Runner APIs (start/complete/response), ComponentQuestionRenderer SCENARIO_BASED, full take flow |
| Code testing integration | ✅ | Piston API in `/api/assessments/code/run`; CODING_CHALLENGE in runner; CodeChallengeRunner |
| AI Voice/Video interview | ✅ | `/api/ai/transcribe`; VOICE_RESPONSE/VIDEO_RESPONSE in runner (record → transcribe → store) |
| Recommendation engine | ✅ | `lib/recommendations/assessment-recommendations.ts`, RecommendationCard, API |
| Component scoring & overall | ✅ | Complete API scores from ComponentQuestionResponse; overallScore/passed/totalTimeSpent on finish |
| Gap analysis (org) | ✅ | `/api/assessments/[id]/gap-analysis` – fixed for competencyId and percentage-based score |

---

## Phase 3: Institution Module

| Item | Status | Location / Notes |
|------|--------|-------------------|
| Curriculum hierarchy | ✅ | CurriculumNode, ActivityCurriculum, curriculum pages/APIs |
| Institution polymorphic data | ✅ | Faculty/Classes/Students, tenant-labels, employees/departments by tenant type |
| Stream/industry templates | ⚠️ | Can be added via assessment templates |

---

## Phase 4: Career Advisory System

| Item | Status | Location / Notes |
|------|--------|-------------------|
| Career path / recommendations | ✅ | `lib/b2c/recommendation-engine.ts`, career pages |
| Gap analysis | ✅ | Gap analysis API and dashboard |
| Development plan | ⚠️ | Member.developmentPlan, career UI |

---

## Phase 5: Polish & Optimization

| Item | Status | Location / Notes |
|------|--------|-------------------|
| Survey module | ✅ | Surveys in nav, survey pages/APIs |
| Super Admin | ✅ | Admin layout, approvals, tenants, roles, competencies, models |
| B2C individual | ✅ | Individuals dashboard, assessments browse/start |
| Performance / UX | ⚠️ | Ongoing |

---

## Key Files Reference

| Area | Files |
|------|--------|
| Auth | `src/lib/auth-config.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/assessments/(auth)/login/page.tsx` |
| Post-login redirect | `app/assessments/page.tsx` |
| Navigation | `lib/navigation-config.ts`, `lib/tenant-labels.ts`, `hooks/useTenant.ts`, `components/Navigation/Sidebar.tsx` |
| Tenant polymorphism | `lib/tenant-labels.ts`, `lib/tenant-resolver.ts`, `app/api/clients/[clientId]/tenant/route.ts` |
| Corporate/Institution UI | `app/assessments/clients/[clientId]/` (departments, employees, dashboard, etc.) |
| Assessments | `app/assessments/admin/models/`, `lib/assessment-engine.ts`, `app/assessments/(portal)/take/` |
| Recommendations | `lib/recommendations/assessment-recommendations.ts`, `app/api/recommendations/assessment/route.ts` |

---

## How to Use This Checklist

1. **Run overlay fix** if needed: follow FSD/*.md.
2. **Run audit** when needed: use FSD/*
3. **Implement missing items** by phase: use DOC1–DOC6 and other enhancement related .md docs for detailed requirements.
4. **Update this checklist** as features are added or completed or scope changes.
