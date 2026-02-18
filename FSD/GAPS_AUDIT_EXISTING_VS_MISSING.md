# Gaps Audit: What Exists vs What’s Missing

**Date:** Per user request to continue with gaps without impacting current features.

This document records what already exists (UI and functionality) and what is missing for each gap area, so implementation can be done safely.

---

## Gap 1: Employee/Student Career Portal

| Item | Exists? | Location / Notes |
|------|---------|------------------|
| **My Details (profile form)** | ✅ Yes | `app/assessments/individuals/profile/page.tsx` → ProfileWizard; `app/api/profile` GET/PATCH |
| **Individuals dashboard** | ✅ Yes | `app/assessments/individuals/dashboard/page.tsx` (server), mode switcher, assessments |
| **My Career section** | ✅ Yes | `app/assessments/individuals/career/page.tsx` – Overview, Profile summary, Dev Plan, Hierarchy tab |
| **Current / Aspirational role** | ✅ Yes | Profile API includes currentRole/aspirationalRole with competencies; career page shows cards + gap % |
| **Development plan** | ✅ Yes | `GET/POST/PATCH /api/career/plan/generate`; career page uses member.developmentPlan from profile when present |
| **Profile tab on Career** | ✅ Yes | Read-only summary + “Edit in My Details” link (no duplicate form) |
| **Hierarchy (individuals)** | ⚠️ Placeholder | Career page has “Hierarchy” tab with “Coming soon”; no `/individuals/hierarchy` page |
| **My Previous Roles** | ❌ No | Nav has “My Previous Roles” but it links to career; no dedicated previous-roles UI |
| **My Competencies (self-assigned)** | ❌ No | Nav has “My Competencies” → career; no self-assign competencies UI |

**Summary:** Career portal is largely implemented. Missing: dedicated Previous Roles UI, self-assign Competencies, and a real Hierarchy view (currently placeholder). No change to existing career/profile/dashboard behavior required.

---

## Gap 2: Department/Team Dedicated Pages

| Item | Exists? | Location / Notes |
|------|---------|------------------|
| **Departments list page** | ✅ Yes | `app/assessments/clients/[clientId]/departments/page.tsx` – server component, search, Active/Inactive/All, DepartmentCard grid |
| **Department detail page** | ✅ Yes | `app/assessments/clients/[clientId]/departments/[deptId]/page.tsx` – stats, teams, members, projects, Edit/Delete |
| **Department settings** | ✅ Yes | `app/assessments/clients/[clientId]/departments/[deptId]/settings/page.tsx` |
| **CreateDepartmentDialog** | ✅ Yes | Used on departments page; tenant labels (orgUnitPlural) |
| **Teams list page** | ✅ Yes | `app/assessments/clients/[clientId]/teams/page.tsx` – tabs by department, TeamCard, CreateTeamDialog |
| **Team detail page** | ✅ Yes | `app/assessments/clients/[clientId]/teams/[teamId]/page.tsx` |
| **Departments API** | ✅ Yes | `GET /api/clients/[clientId]/departments` (list with filters) |
| **Teams API** | ✅ Yes | `GET /api/clients/[clientId]/teams` (and route exists) |
| **Institution redirect** | ✅ Yes | Teams page redirects INSTITUTION to `org/[slug]/classes` |
| **tenant-labels** | ✅ Yes | `lib/tenant-labels.ts`; departments/teams pages use getLabelsForTenant / resolveTenantLabels |

**Summary:** Department and Team pages and APIs are implemented. No new pages needed for this gap. Any “missing” items in the plan refer to enhancements (e.g. richer dashboards), not absence of pages.

---

## Gap 3: Role Request Workflow UI

| Item | Exists? | Location / Notes |
|------|---------|------------------|
| **Role Request page** | ✅ Yes | `app/assessments/clients/[clientId]/roles/request/page.tsx` – renders RoleRequestForm |
| **RoleRequestForm component** | ✅ Yes | `components/Roles/RoleRequestForm.tsx` – form fields: title, department, level, description, justification |
| **Form submit** | ❌ Simulated | onSubmit only `console.log` + toast; no API call |
| **My Requests / tracking page** | ❌ No | No route `roles/my-requests` or equivalent; no list of user’s submitted requests |
| **Nav link to Role Request** | ❌ No | navigation-config has “Roles” → `/roles` but no “Request Role” or “My Requests” |
| **Backend for role definition request** | ⚠️ Partial | ApprovalRequest (type ROLE), Role.status DRAFT exist; no API that creates Role (DRAFT) + ApprovalRequest from client |
| **Profile role-request API** | ✅ Yes | `POST /api/profile/role-request` creates RoleAssignmentRequest (member requesting role for self – different flow) |

**Summary:** UI for “request new role” exists; submit is not wired to backend. “My Requests” page and nav entries are missing. Safe additions: (1) API to create role request (Role DRAFT + ApprovalRequest), (2) Wire RoleRequestForm to that API, (3) Add “My Requests” page and nav links.

---

## Gap 4: Institution-Specific UI Terminology

| Item | Exists? | Location / Notes |
|------|---------|------------------|
| **tenant-labels lib** | ✅ Yes | `lib/tenant-labels.ts` – CORPORATE / INSTITUTION / SYSTEM with member, orgUnit, subUnit, activity, etc. |
| **getLabelsForTenant** | ✅ Yes | Used in departments page, teams page, navigation-config |
| **resolveTenantLabels** | ✅ Yes | `lib/tenant-resolver.ts` (async by clientId); used in department detail |
| **Nav dynamic labels** | ✅ Yes | navigation-config uses TENANT_LABELS for orgUnit, subUnitPlural, facultyPlural, activityPlural |
| **Institution-specific nav items** | ✅ Yes | faculty, curriculum, courses, classes shown for INSTITUTION only |
| **Label provider / useTenantLabels hook** | ❌ No | No React context/hook that injects labels into arbitrary components; pages that need labels use server-side getLabels or direct import |

**Summary:** Terminology is driven by tenant-labels and used on key pages and nav. Remaining work is optional: a client-side LabelProvider/useTenantLabels for components that don’t have access to server-side labels. No change to existing label usage required.

---

## Gap 5: Granular RBAC for Managers

| Item | Exists? | Location / Notes |
|------|---------|------------------|
| **RLS for roles/competencies** | ✅ Yes | buildRoleVisibilityFilter, buildCompetencyVisibilityFilter; scope + tenantId + departmentId + teamId + classId |
| **Permission util** | ✅ Yes | `src/lib/permissions/role-competency-permissions.ts` – creatableScope, canEdit, canDelete, classId |
| **Dept Head dashboard redirect** | ✅ Yes | navigation-config: DEPARTMENT_HEAD dashboard → `my-department` |
| **Team Lead dashboard redirect** | ✅ Yes | TEAM_LEAD dashboard → `my-team` |
| **my-department page** | ✅ Yes | `app/assessments/clients/[clientId]/my-department/page.tsx` |
| **my-team page** | ✅ Yes | `app/assessments/clients/[clientId]/my-team/page.tsx` |
| **Departments API scope** | ⚠️ Not RLS | GET departments returns all for tenantId; no filter by user’s departmentId |
| **Teams API scope** | ⚠️ Not RLS | GET teams returns all for tenantId; no filter by user’s teamId/departmentId |

**Summary:** Role/competency RLS and dept/team dashboard redirects exist. Departments/teams list APIs do not yet restrict by user’s department/team; adding that would be an enhancement and must be done so SUPER_ADMIN/TENANT_ADMIN still see all.

---

## Safe Implementation Order (No Breaking Changes)

1. **Gap 3 – Role request (additive only)**  
   - Add `POST /api/clients/[clientId]/roles/request` (create Role with status DRAFT + ApprovalRequest type ROLE).  
   - Wire RoleRequestForm to this API (replace simulate with fetch).  
   - Add `GET /api/clients/[clientId]/roles/my-requests` and page `roles/my-requests`.  
   - Add nav: “Request Role” (or under Roles) and “My Requests”.

2. **Gap 4 – Labels (optional)**  
   - Add useTenantLabels hook / LabelProvider only where new components need it; leave existing server-side label usage as-is.

3. **Gap 5 – Dept/Team API scope (optional)**  
   - Add optional query or scope in departments/teams APIs so DEPARTMENT_HEAD sees only their department, TEAM_LEAD only their team; keep full list for SUPER_ADMIN and TENANT_ADMIN.

4. **Gap 1 – Hierarchy / Previous Roles (optional)**  
   - Hierarchy: replace “Coming soon” with read-only org tree or link to existing org hierarchy if one exists.  
   - Previous Roles: add a small section or tab on career page; no removal of current overview/dev plan.

---

## Files Touched for Reference (Existing – Do Not Remove)

- **Individuals:** `individuals/layout.tsx`, `individuals/dashboard/page.tsx`, `individuals/profile/page.tsx`, `individuals/career/page.tsx`, `individuals/onboarding/page.tsx`, `individuals/results/page.tsx`, `individuals/browse/page.tsx`
- **Clients:** `clients/[clientId]/layout.tsx`, `clients/[clientId]/departments/page.tsx`, `clients/[clientId]/departments/[deptId]/page.tsx`, `clients/[clientId]/teams/page.tsx`, `clients/[clientId]/teams/[teamId]/page.tsx`, `clients/[clientId]/roles/page.tsx`, `clients/[clientId]/roles/request/page.tsx`, `clients/[clientId]/my-department/page.tsx`, `clients/[clientId]/my-team/page.tsx`
- **APIs:** `api/profile/route.ts`, `api/career/plan/generate/route.ts`, `api/clients/[clientId]/departments/route.ts`, `api/clients/[clientId]/teams/route.ts`, `api/profile/role-request/route.ts`
- **Config:** `lib/tenant-labels.ts`, `lib/tenant-resolver.ts`, `lib/navigation-config.ts`
