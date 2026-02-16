# Admin Page Locations

## Current (older) root website admin — **SudakshaNWS**

| What | Where |
|------|--------|
| **URL** | `http://localhost:3000/admin` |
| **Page** | `app/admin/page.tsx` — `AdminDashboard` (batches, courses, trainers, revenue, activity feed) |
| **Layout** | `app/admin/layout.tsx` — "Sudaksha Admin" sidebar (Dashboard, Analytics, Courses, Batches, Trainers, Conflicts, Audit, Communication) |
| **Source** | Restored from `backup-stable-version/app/(admin)/admin/` (training/course management admin) |

**Sub-routes under `/admin`** (from backup; only root page + layout were restored):

- `/admin` → `app/admin/page.tsx` ✅
- `/admin/analytics` — not present under `app/admin/` (would 404)
- `/admin/courses` — not present
- `/admin/batches` — not present
- `/admin/trainers` — not present
- `/admin/conflicts` — not present
- `/admin/audit` — not present
- `/admin/communication` — not present

So the **current build** for the root admin is: **`app/admin/`** (only `page.tsx` + `layout.tsx`). Sidebar links to sub-routes will 404 unless you restore or refactor those routes.

---

## Newer admin — **SudAssess Super Admin**

| What | Where |
|------|--------|
| **URL** | `http://localhost:3000/assessments/admin` → redirects to dashboard |
| **Dashboard** | `http://localhost:3000/assessments/admin/dashboard` |
| **Login** | `http://localhost:3000/assessments/auth/admin/login` |
| **Page** | `app/assessments/admin/dashboard/page.tsx` — `GlobalAdminDashboard` (tenants, users, assessments, system health) |
| **Layout** | `app/assessments/admin/layout.tsx` — assessment admin nav (Global Overview, Tenants, Competencies, Models, Roles, etc.) |

**Sub-routes under `/assessments/admin`** (all under `app/assessments/admin/`):

- `dashboard/`, `approvals/`, `companies/`, `competencies/`, `components/`, `models/`, `reports/`, `roles/`, `surveys/`, `templates/`, `tools/` — these exist and are the newer version.

---

## Summary

- **Root website admin (older):** `app/admin/` → `localhost:3000/admin`
- **Newer admin (SudAssess):** `app/assessments/admin/` → `localhost:3000/assessments/admin` (and `.../admin/dashboard`)

To **dump the current (old) build and refactor**: remove or replace contents of `app/admin/` (and optionally make `/admin` redirect to `/assessments/admin` if the root site should only use the newer admin).
