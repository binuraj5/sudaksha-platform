# Assessment Assignment Flows

How assessments are assigned by **Super Admin**, **Department Head**, **Team Leader**, **Class Teachers**, and how **B2C Individual** users receive assignments.

---

## 1. Who Can Assign (Roles)

| Role | Scope | How they assign |
|------|--------|------------------|
| **Super Admin** | Any tenant; any project/department/individual | Client assessments page or project assignments; full access. |
| **Tenant Admin / Client Admin** | Their tenant (clientId) | Same APIs; restricted to their `clientId`. |
| **Department Head (DEPARTMENT_HEAD / DEPT_HEAD)** | Their department | Assign to project (all project users), or to **individual** (memberId). API: `POST /api/clients/[clientId]/assessments/assign`. |
| **Team Leader (TEAM_LEAD) / Manager** | Their team/project | Same: assign to **project** or **individual** (member). |

**Class Teachers (institutions)**  
- If your org model uses **Organization Units** (e.g. Class = org unit): use **assign to org unit** so every member in that class gets a **MemberAssessment** (see §3).  
- If your org model uses **Client + Projects/Departments**: class can be represented as a project or department; then **Department Head** or **Team Leader** assigns at **project** or **department** level (or individual).

---

## 2. Corporate / Client Flow (Users + Projects)

**Data model:**  
- **User** (accountType CLIENT_USER) belongs to a **Client**, optionally to a **Project** and **Department**.  
- **ProjectAssessmentModel** = “this assessment model is assigned to this project (and optionally department).”  
- **ProjectUserAssessment** = “this user has this assignment” (one per user per assignment).

**APIs:**

- **Create project-level assignment (all project users, or department, or specific users)**  
  `POST /api/clients/[clientId]/projects/[projectId]/assignments`  
  Body: `{ modelId, assignmentLevel, departmentId?, userIds?, dueDate?, isMandatory? }`  
  - `assignmentLevel`: **PROJECT** (all users in project), **DEPARTMENT** (all users in department), **INDIVIDUAL** (list of `userIds`).  
  - Creates one **ProjectAssessmentModel** and multiple **ProjectUserAssessment** records.

- **Assign to project (activity) or to one individual (member)**  
  `POST /api/clients/[clientId]/assessments/assign`  
  Body: `{ modelId, targetType, projectId?, memberId? }`  
  - `targetType`: **PROJECT** → links model to project via **ActivityAssessment** (project gets the assessment).  
  - `targetType`: **INDIVIDUAL** → creates **MemberAssessment** for that **memberId** (`assignmentType: 'ASSIGNED'`).  
  - Allowed roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `DEPARTMENT_HEAD`, `DEPT_HEAD`, `TEAM_LEAD`, `MANAGER`.

**UI (current):**  
- **Client assessments:** `/assessments/clients/[clientId]/assessments` – list models; “Assign” can open a dialog that calls the assign API (e.g. **AssignAssessmentDialog**: project or individual member).  
- **Project assignments:** `/assessments/clients/[clientId]/projects/[projectId]/assignments` – create assignment with level PROJECT / DEPARTMENT / INDIVIDUAL; users get **ProjectUserAssessment** and see the assessment in their dashboard.  
- **Assignment details:** `/assessments/clients/[clientId]/projects/[projectId]/assignments/[assignmentId]` – see who is assigned and status.

**How the employee sees it:**  
- User logs in → dashboard (e.g. org dashboard or “my assessments”) lists **ProjectUserAssessment** for their `userId`.  
- “Take” link goes to `/assessments/take/[id]` where `id` = **ProjectUserAssessment.id**.  
- Runner uses **ProjectUserAssessment** + **projectAssignment.model** to run the assessment.

---

## 3. Institution Flow (Members + Org Units / Classes)

**Data model:**  
- **Member** (e.g. student/faculty) belongs to an **Organization Unit** (department, class, etc.).  
- **MemberAssessment** = one assessment assigned to one member (`memberId`, `assessmentModelId`, `assignmentType: ASSIGNED`).

**Assign to whole hierarchy (e.g. department or class):**  
- Use **assignToOrgUnit(orgUnitId, assessmentModelId, assignedBy)** in `lib/assessment-engine.ts`.  
- It recursively gets all members in that org unit (and child units), optionally skips students for SENIOR/EXPERT models, and creates a **MemberAssessment** (ASSIGNED) for each eligible member.  
- **Class Teacher** can assign to a class by calling this with the class’s org unit ID (if class is an org unit).  
- You need an API and UI that call `assignToOrgUnit` (e.g. “Assign to class” / “Assign to department” in the institution UI).

**How the member (e.g. student) sees it:**  
- Member logs in (or has a link tied to their Member identity).  
- Dashboard lists **MemberAssessment** where `memberId` = their Member.id.  
- “Take” link: `/assessments/take/[id]` where `id` = **MemberAssessment.id**.  
- Runner resolves **MemberAssessment** and uses **assessmentModel** to run (same runner as B2C; see §4).

---

## 4. B2C Individual – How They Get an Assignment

**B2C Individual** = a consumer user (e.g. job seeker) represented as **User** + **Member** (type **INDIVIDUAL**). Same email ties User and Member.

Two ways they can have an assessment:

### A. Assigned by someone (assignmentType = ASSIGNED)

- An assigner (Super Admin, Dept Head, Team Leader, etc.) must create a **MemberAssessment** for that individual’s **Member** id.  
- **API:** `POST /api/clients/[clientId]/assessments/assign` with `targetType: "INDIVIDUAL"` and `memberId: <that Member's id>`.  
- **Requirement:** The B2C individual must exist as a **Member** in a tenant the assigner can access (e.g. same `clientId`), or you need a separate “assign to B2C user by email” flow that:  
  - finds or creates a Member (type INDIVIDUAL) for that email,  
  - then creates **MemberAssessment** with `assignmentType: 'ASSIGNED'` and `assignedBy`.

So: **B2C individual gets an assignment** when someone with access calls the assign API for their **memberId** (or a flow that resolves their Member from email/identity).

### B. Self-selected (assignmentType = SELF_SELECTED)

- Individual browses **published** assessment models (e.g. from dashboard or catalog).  
- **API – list models:** `GET /api/individuals/assessments/browse` (returns active/published models for individuals).  
- **API – start:** `POST /api/individuals/assessments/start` with `{ modelId }`.  
  - Resolves **Member** by session user email + type INDIVIDUAL.  
  - Enforces B2C free-tier limit (e.g. `canTakeAssessment`).  
  - Creates **MemberAssessment** with `assignmentType: "SELF_SELECTED"`, status DRAFT.  
  - Returns `memberAssessmentId`.  
- Front-end then redirects to **Take** page: `/assessments/take/[id]` with `id` = **MemberAssessment.id**.

**How they see it:**  
- **Dashboard:** `/assessments` or `/assessments/my/dashboard` (or portal dashboard) loads **MemberAssessment** for the current user’s Member (by email).  
- List includes both **ASSIGNED** and **SELF_SELECTED**; each has a “Start” / “Continue” / “View Results” link to `/assessments/take/[id]`.

**Take page:**  
- `/assessments/take/[id]` accepts **ProjectUserAssessment.id** (org) or **MemberAssessment.id** (B2C).  
- Runner normalizes both to the same shape and runs the same **AssessmentRunner** (instructions → sections → submit).

---

## 5. Summary Table

| Actor | Assigns to | API / mechanism | Recipient sees |
|-------|------------|------------------|----------------|
| Super Admin | Any project, dept, or user/member | `POST .../projects/.../assignments` or `POST .../assessments/assign` | Project: User dashboard + `/assessments/take/[id]` (ProjectUserAssessment). Individual (member): Member dashboard + `/assessments/take/[id]` (MemberAssessment). |
| Department Head / Team Leader | Project, or one member | `POST /api/clients/[clientId]/assessments/assign` (PROJECT or INDIVIDUAL) | Same as above. |
| Class Teacher (institution) | Class (org unit) | "Assign assessment" on class detail → `POST /api/org/[slug]/assessments/assign-unit` with `orgUnitId: classId` | Members of that class get MemberAssessment; dashboard + `/assessments/take/[id]`. |
| B2C Individual (self) | Self | `POST /api/individuals/assessments/start` with `modelId` | MemberAssessment SELF_SELECTED; dashboard + `/assessments/take/[id]`. |

---

## 6. Implemented Extensions

- **Class Teacher UI:** If not present, add a screen under institution (org) that lists classes, lets the teacher pick a class and an assessment model, and calls an API that uses `assignToOrgUnit` for that class’s org unit.  
- **B2C “assign by email”:** If assigners don’t have the Member id, add an API that accepts email (and optionally tenant), finds or creates Member (INDIVIDUAL), and creates MemberAssessment ASSIGNED.  
- **Portal dashboard:** Ensure B2C dashboard fetches **MemberAssessment** by **Member.id** (resolve Member from session user email + type INDIVIDUAL), not by User.id, so assigned and self-selected assessments both appear.

This document reflects the current codebase including assign-unit API, assign-by-email API, Class Teacher assign dialog, and portal dashboard fix.
