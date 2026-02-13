# DOC1 Corporate Module – Implementation Status

Reference: `FSD/DOC1_CORPORATE_MODULE.md` and `FSD/COMPLETE_REQUIREMENTS_TABLE.md`.

---

## M1: Corporate Admin (10 requirements)

| ID    | Requirement           | Status   | Location / Notes |
|-------|------------------------|----------|-------------------|
| M1    | Corporate Admin Login  | Done     | `/assessments/login`, NextAuth + auth-config, redirect by role |
| M1-1  | Menu Items             | Done     | `lib/navigation-config.ts`, `components/Navigation/Sidebar.tsx`, `MobileNav.tsx` – role-based, Super Admin tab, My Page |
| M1-2  | Dashboard              | Done     | `app/assessments/clients/[clientId]/dashboard/page.tsx`, StatsGrid, GapAnalysisChart, RecentActivity, QuickActions; API: `api/clients/[clientId]/dashboard/stats` |
| M1-3  | Organization Setup     | Done     | `app/assessments/clients/[clientId]/settings/page.tsx`, Settings APIs |
| M1-4  | Department Management  | Done     | `app/assessments/clients/[clientId]/departments/` + API |
| M1-5  | Employee Management    | Done     | `app/assessments/clients/[clientId]/employees/` + bulk upload API |
| M1-6  | Projects Management    | Done     | `app/assessments/clients/[clientId]/projects/` + API |
| M1-7  | Teams Management       | Done     | `app/assessments/clients/[clientId]/teams/` + API |
| M1-8  | Add Roles (Approval)   | Done     | `app/assessments/clients/[clientId]/roles/`, request, submit APIs |
| M1-9  | Reports                | Done     | `app/assessments/clients/[clientId]/reports/` + generate/templates APIs |
| M1-10 | Survey Management      | Done     | `app/assessments/clients/[clientId]/surveys/` + API |

---

## M2: Department Head (8 requirements)

| ID   | Requirement      | Status | Notes |
|------|------------------|--------|--------|
| M2   | Dept Head Login  | Done  | Reuses M1 auth; role DEPARTMENT_HEAD |
| M2-1 | Menu Items       | Done  | navigation-config: Dept-scoped items |
| M2-2 to M2-8 | Scoped features | Done | Same pages as M1 with scope (orgUnitId / department) in APIs |

Dashboard override for Dept Head: `/assessments/clients/[id]/my-department` (in navigation-config).

---

## M3: Team Lead (9 requirements)

| ID   | Requirement   | Status | Notes |
|------|---------------|--------|--------|
| M3   | Team Lead Login | Done | Reuses M1 auth; role TEAM_LEAD |
| M3-1 to M3-9 | Scoped features | Done | Same pages as M1 with team scope |

Dashboard override for Team Lead: `/assessments/clients/[id]/my-team` (in navigation-config).

---

## M4: Employee (16 requirements)

| ID    | Requirement            | Status   | Location / Notes |
|-------|-------------------------|----------|-------------------|
| M4    | Employee Login          | Done     | Same auth; role EMPLOYEE |
| M4-1  | Menu Items              | Done     | Role-filtered; My Page items |
| M4-2  | My Details              | Done     | `app/assessments/(portal)/profile/page.tsx`, ProfileWizard |
| M4-3  | My Hierarchy            | Done     | `app/assessments/(portal)/hierarchy/page.tsx` – org tree from DB |
| M4-4  | My Projects             | Done     | Via client dashboard / activities (filtered) |
| M4-5  | My Career               | Done     | `app/assessments/(portal)/career/page.tsx` |
| M4-6  | My Current Role         | Partial  | In career profile; role CRUD can be extended |
| M4-7  | My Previous Roles       | Partial  | History in career/plan |
| M4-8  | Aspirational Role / Gap  | Partial  | Career plan, gap analysis API used where implemented |
| M4-9  | My Competencies         | Partial  | Role-based + self-assign where APIs support |
| M4-10 to M4-16 | Assessments, Surveys, etc. | Done / Partial | Per existing portal and APIs |

---

## Super Admin – Tenant & Institution detail (new)

| Feature | Status | Location |
|--------|--------|----------|
| Tenant (Corporate) list | Done | `app/assessments/admin/tenants/page.tsx` |
| Tenant (Corporate) detail | Done | `app/assessments/admin/tenants/[id]/page.tsx` |
| Institutions list        | Done | `app/assessments/admin/institutions/page.tsx` |
| Institution detail       | Done | `app/assessments/admin/institutions/[id]/page.tsx` |
| GET single tenant API    | Done | `app/api/admin/clients/[clientId]/route.ts` |

Navigation (Super Admin): `lib/navigation-config.ts` – All Tenants → `/assessments/admin/tenants`, Institutions → `/assessments/admin/institutions`, Approvals → `/assessments/admin/approvals`, Usage → `/assessments/admin/usage-analytics`.

---

## Suggested next steps (DOC1 gaps / enhancements)

1. **M4-6 / M4-7** – Full “My Current Role” and “My Previous Roles” CRUD and history in career flow.
2. **M4-8** – Complete aspirational role and gap analysis UI and wiring to gap-analysis API.
3. **M4-9** – Full competency self-assign and role-based competency views.
4. **M1-4** – Department delete with reassignment (soft delete + reassignTo) if not already in place.
5. **M1-5** – Employee detail tabs (Profile, Career, Assessments, Projects, Activity) and any missing API fields.

---

*Last updated from codebase audit. Implement any remaining DOC1 items from DOC1_CORPORATE_MODULE.md and COMPLETE_REQUIREMENTS_TABLE.md.*
