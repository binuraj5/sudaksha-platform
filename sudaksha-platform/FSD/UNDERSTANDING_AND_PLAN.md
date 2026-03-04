# Understanding: Polymorphic Tenants & My Profile

## What I Understood from the Documents

### 1. Polymorphic Architecture (ANTIGRAVITY_FINAL_IMPLEMENTATION_GUIDE.md)

- **Same tables** serve Corporate, Institution, and B2C
- **Configuration-driven** labels and UI (no hardcoding)
- **Role-based permissions** control feature access
- **Implement once, reuse** – M2 (Dept Head) = M1 + scope, M3 (Team Lead) = M1 + scope

### 2. Tenant Types

| Type        | Labels (Members, Activity, SubUnit)   | Unique Feature   |
|------------|---------------------------------------|------------------|
| **Corporate**   | Employees, Projects, Teams            | –                |
| **Institution** | Students, Courses, Classes            | Curriculum hierarchy |

### 3. Role Mapping (DOC1 & DOC2)

| Corporate        | Institution      | Pattern                     |
|------------------|------------------|-----------------------------|
| M1 Corporate Admin | M5 Institution Admin | Same code, label change    |
| M2 Department Head | M6 Department Head   | Same code, scoped         |
| M3 Team Lead       | M7 Class Teacher     | Same code, scoped         |
| M4 Employee        | M8 Student           | Same code + Curriculum    |
| –                 | –                    | M15 B2C Individual = M4 - org |

### 4. My Profile (Shared Across Roles)

Same structure for all tenant users; visibility driven by roles:

- **My Details** – profile
- **My Hierarchy** – org chart
- **My Projects** – projects/courses
- **My Career** – Current Role, Previous Roles, Aspirational Role, Competencies
- **My Assessments** – Take Assessment, Role-Wise, Competency-Wise, Scores
- **Take Survey**

Corporate Super Admin, Corporate Dept Head, Corporate Employees, and B2C Individual all see this structure with role-appropriate items.

### 5. Implementation Plan

1. **lib/tenant-labels.ts** – Already present; ensure CORPORATE and INSTITUTION mappings are complete
2. **Navigation** – Use `getLabelsForTenant(tenant.type)` for all nav labels
3. **Curriculum** – Show only when `tenant.type === 'INSTITUTION'`
4. **Permission scoping** – Department Head: `WHERE orgUnitId = user.managedOrgUnitId`; Team Lead: same at team level
5. **Single codebase** – No separate implementations per tenant type; use config and role checks
