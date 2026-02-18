# ROLES & COMPETENCIES RLS — AUDIT REPORT

**Date:** Per ROLES_COMPETENCIES_RLS_POLYMORPHIC.md mandatory first step.

---

## 1. Existing file paths

| Purpose | Path |
|--------|------|
| SuperAdmin roles page | `app/assessments/admin/roles/page.tsx` |
| SuperAdmin competencies page | `app/assessments/admin/competencies/page.tsx` |
| Client roles page | `app/assessments/clients/[clientId]/roles/page.tsx` |
| Client competencies page | `app/assessments/clients/[clientId]/competencies/page.tsx` |
| Permission utility | `src/lib/permissions/role-competency-permissions.ts` |
| Permissions hook | `hooks/useRoleCompetencyPermissions.ts` |
| Admin roles API | `app/api/admin/roles/route.ts` |
| Admin roles submit-global | `app/api/admin/roles/[id]/submit-global/route.ts` |
| Admin roles approve-global | `app/api/admin/roles/[id]/approve-global/route.ts` |
| Admin competencies API | `app/api/admin/competencies/route.ts` |

---

## 2. Schema: Role & Competency

**Role model** (`prisma/schema.prisma` ~1733):  
Scope/tenant/dept/team and global approval fields **already exist**:
- `scope`, `tenantId`, `departmentId`, `teamId`, `createdByUserId`
- `allowedLevels` (String[])
- `globalSubmissionStatus`, `globalSubmittedBy`, `globalSubmittedAt`, `globalApprovedBy`, `globalApprovedAt`, `globalRejectionReason`
- Indexes on `scope`, `tenantId`, `globalSubmissionStatus`

**Competency model** (~1798):  
Same pattern **already present** (scope, tenantId, departmentId, teamId, createdByUserId, allowedLevels, globalSubmissionStatus, globalSubmittedBy/At, globalApprovedBy/At, globalRejectionReason).

**Naming vs doc:**  
Doc uses `globalReviewedBy` / `globalReviewNotes`. Schema uses `globalApprovedBy` / `globalRejectionReason`. No schema change; API uses existing field names.

---

## 3. GlobalApprovalRequest

**Exists** at ~2938: `entityType`, `entityId`, `tenantId`, `submittedBy`, `submittedAt`, `status`, `reviewedBy`, `reviewedAt`, `reviewNotes`, `entitySnapshot`, relations to Tenant, User (submitter, reviewer). Indexes on status, tenantId, (entityType, entityId).

---

## 4. User / auth context

- Session from `getApiSession()` (NextAuth) provides: `user.id`, `user.role`, `user.tenantId`, `user.tenant` (for type), `user.departmentId`, `user.teamId`, `user.classId` (for Class Teacher).
- **Auth role values:** Auth sets `DEPT_HEAD` and `TEAM_LEAD`; permission util uses `DEPARTMENT_HEAD` and `TEAM_LEADER`. **Action:** Normalize in permission layer (treat DEPT_HEAD like DEPARTMENT_HEAD, TEAM_LEAD like TEAM_LEADER).
- Session does **not** include `tenant.type` by default; APIs use `user.tenant?.type || 'CORPORATE'` (tenant may need to be loaded for type). Permission util expects `tenantType: TenantType`.

---

## 5. Client vs admin pages

| Aspect | Admin roles | Client roles | Admin competencies | Client competencies |
|--------|-------------|--------------|--------------------|---------------------|
| Data source | `GET /api/admin/roles` (RLS) | Direct Prisma (global + tenantId) | `GET /api/admin/competencies` (no RLS) | `GET /api/clients/[clientId]/competencies` |
| UI | Table, scope tabs, _canEdit/_canDelete, ScopeBadge | Cards, Global / My Custom tabs | Tabs: Competency Library + Role Frameworks | Cards, Create button |
| Create | Link to create page | CreateRoleDialog (clientId) | CreateCompetencyDialog | CreateCompetencyDialog (clientId) |

**Gap:** Client roles/competencies are different UIs and different APIs. Doc goal: same UI and same API (admin), with RLS so client users see scoped data.

---

## 6. Implemented vs TODO

- **Roles API:** GET uses `buildRoleVisibilityFilter` and returns `_canEdit`, `_canDelete`, `_canSubmitGlobal`. POST enforces scope and creatableScope. **Done.**
- **Roles submit-global / approve-global:** Routes exist but are **stubs** (return “implementation pending”). **Action:** Implement using Role + GlobalApprovalRequest.
- **Competencies API:** No RLS; only `isAdmin` check. No scope on GET/POST, no _permissions, no submit-global/approve-global. **Action:** Add RLS, scope on POST, permissions, and submit/approve endpoints.
- **useRoleCompetencyPermissions:** Does not pass `classId`; CLASS scope may be wrong for Class Teachers. **Action:** Pass `classId` from session.
- **Permission util:** Uses `TEAM_LEADER`/`DEPARTMENT_HEAD`; auth sends `TEAM_LEAD`/`DEPT_HEAD`. **Action:** Normalize role in util or hook.

---

## 7. Summary

- **DB:** No migration needed for Role/Competency/GlobalApprovalRequest; fields and table exist.
- **Roles API:** RLS and POST scope done; submit-global and approve-global need real implementation.
- **Competencies API:** Needs full RLS treatment (visibility filter, scope on create, _permissions, submit-global, approve-global).
- **Client pages:** Should render the same content as admin (shared RolesPageContent / CompetenciesPageContent), using admin APIs so RLS alone scopes data.
- **Permission hook:** Add classId; normalize DEPT_HEAD/TEAM_LEAD to DEPARTMENT_HEAD/TEAM_LEADER for permission util.

Implementation order follows doc Part 10 (audit → no DB migration → permission/hook fixes → API submit/approve → shared components → client pages → competencies mirror).

---

## IMPLEMENTATION COMPLETED (POST-AUDIT)

### 1. Permission utility (`src/lib/permissions/role-competency-permissions.ts`)
- **Normalized roles:** `normalizeUserRole()` maps `DEPT_HEAD` → `DEPARTMENT_HEAD`, `TEAM_LEAD` → `TEAM_LEADER` so auth role names match the permission util.
- **UserContext:** `role` type allows string (auth can send DEPT_HEAD/TEAM_LEAD); all permission functions use normalized role via `withNormalizedRole()` or `normalizeUserRole()`.

### 2. Hook (`hooks/useRoleCompetencyPermissions.ts`)
- **classId:** Passes `classId` from session into `getRoleCompetencyPermissions()` so CLASS scope and Class Teacher permissions work correctly.

### 3. Roles API
- **submit-global** (`app/api/admin/roles/[id]/submit-global/route.ts`): Implemented: sets role `globalSubmissionStatus` to PENDING, creates `GlobalApprovalRequest` with entitySnapshot; uses `params: Promise<{ id }>` and `await params`.
- **approve-global** (`app/api/admin/roles/[id]/approve-global/route.ts`): Implemented: Super Admin only; APPROVE → role becomes GLOBAL (tenantId/departmentId/teamId null), REJECT/REQUEST_CHANGES → status and notes; updates `GlobalApprovalRequest`; uses `normalizeUserRole()` for role check.
- **Admin roles page:** Handlers moved in-component so `fetchRoles()` is called after submit/approve/reject. Pending tab filter fixed to `r.globalSubmissionStatus === 'PENDING'`. CLASS tab and ScopeBadge added.

### 4. Shared Roles UI
- **RolesPageContent** (`components/Roles/RolesPageContent.tsx`): New shared client component with full roles list UI (header, filters, scope tabs including CLASS and Pending Review, table, scope badges, action dropdown with Edit/Go Global/Approve/Reject/Delete). Fetches from `/api/admin/roles`; RLS scopes data by session.
- **Admin roles page** (`app/assessments/admin/roles/page.tsx`): Now only renders `<RolesPageContent />`.
- **Client roles page** (`app/assessments/clients/[clientId]/roles/page.tsx`): Now renders `<RolesPageContent />` (same UI; data scoped by same API).

### 5. Competencies API
- **GET** (`app/api/admin/competencies/route.ts`): Uses `buildCompetencyVisibilityFilter(userContext)` for RLS; returns `{ competencies: annotated, permissions }`; each competency has `_canEdit`, `_canDelete`, `_canSubmitGlobal`.
- **POST:** Uses `getRoleCompetencyPermissions()` and `creatableScope`; enforces scope, tenantId, departmentId, teamId, createdByUserId, allowedLevels (institution → JUNIOR only).
- **submit-global** (`app/api/admin/competencies/[id]/submit-global/route.ts`): Same pattern as roles: PENDING + GlobalApprovalRequest with entityType COMPETENCY.
- **approve-global** (`app/api/admin/competencies/[id]/approve-global/route.ts`): Same pattern as roles: Super Admin only; APPROVE → GLOBAL, REJECT/REQUEST_CHANGES → status and notes.
- **Admin competencies page:** Response handling updated to use `data?.competencies` for the list.

### 6. Client competencies page
- **Fetch:** Now uses `/api/admin/competencies` instead of `/api/clients/[clientId]/competencies` so list is RLS-scoped. Response shape: `data.competencies`.
- **CreateCompetencyDialog:** Same component used on client page; POSTs to `/api/admin/competencies`, so create is RLS-scoped (no client-specific create endpoint).

### 7. Not done (per doc optional / existing)
- **DB migration:** Not run; schema already had Role/Competency scope fields and GlobalApprovalRequest.
- **GlobalApprovalRequest.submittedBy:** References User.id; member-only logins use member.id as session user id, so submit for global may fail for member-only users unless they have a linked User (acceptable for current design).
- **CompetenciesPageContent:** Done. Shared component `components/Competencies/CompetenciesPageContent.tsx` contains the full admin competencies UI (Competency Library + Role Frameworks tabs). Both admin and client competencies pages now render `<CompetenciesPageContent />`; data is scoped by the same APIs (RLS).