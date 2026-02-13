# Institution Hierarchy – Implementation Plan

**Goal:** Implement **Department (HoD) → Course → Class → Students/Faculty** with correct ADD, MODIFY, DELETE by role, plus bulk uploads and clear UI hierarchy.

**Reference:** FSD logic (Department → Course → Class; semesters/years; curriculum link; student in one class; faculty per class/course).

---

## 1. Current State vs Target

| Concept | Current | Target |
|--------|---------|--------|
| **Department** | `OrganizationUnit` type DEPARTMENT, parentId null | Same. HoD = managerId. |
| **Class** | `OrganizationUnit` type CLASS, parentId = department | Same. **Add:** link to Course (see below). |
| **Course** | No dedicated type; Activity has PROJECT, CURRICULUM, BOOTCAMP, INITIATIVE | **Add** ActivityType COURSE; Activity (course) has yearBegin, yearEnd, division. |
| **Course ↔ Department** | — | Course scoped to one Department via ActivityOrgUnit(course, department). |
| **Course ↔ Class** | — | Many classes per course via ActivityOrgUnit(course, class). |
| **Student** | Member with orgUnitId (any unit) | orgUnitId = Class only for students; validation. |
| **Faculty** | Member (CLASS_TEACHER); managerId on Class | Assign faculty to Class (manager or dedicated relation); optional ActivityMember for course. |
| **Curriculum** | CurriculumNode; ActivityCurriculum links Activity to nodes | Course (Activity) links to curriculum via existing ActivityCurriculum. |

---

## 2. Schema Changes (Prisma) — Product Decisions Applied

### 2.1 ActivityType enum
- **Add** value: `COURSE` (institution “Course” = academic program e.g. B.Tech CSE 2023–27).

### 2.2 CourseDivision enum (new)
```prisma
enum CourseDivision {
  SEMESTER
  YEAR
  BOTH
}
```

### 2.3 Activity model (Course usage)
- **Add** (nullable for backward compatibility):
  - `yearBegin` Int?
  - `yearEnd` Int?
  - `division` CourseDivision? (SEMESTER | YEAR | BOTH)
  - `numberOfSemesters` Int? (e.g. 8 for B.Tech)
  - `numberOfYears` Int? (e.g. 4 for B.Tech)
- **Slug:** Auto-generated on create as `${code.toLowerCase()}-${yearBegin}` (e.g. `btech-cse-2023`). Allow manual override; validate uniqueness (tenantId, slug).
- **Soft-delete:** Add `deletedAt` DateTime?, `deletedBy` String?; treat `isActive` or `deletedAt` for “active” listing. DELETE course = soft-delete (set deletedAt, deletedBy, isActive = false).
- **Optional:** `curriculumRootId` String? (FK to CurriculumNode); else keep using ActivityCurriculum only.

**Examples:**
- B.Tech CSE: division BOTH, numberOfSemesters 8, numberOfYears 4
- MBA: division SEMESTER, numberOfSemesters 4, numberOfYears null
- Certificate: division YEAR, numberOfSemesters null, numberOfYears 1

### 2.4 OrganizationUnit (Class)
- **No new column.** Class ↔ Course link via **ActivityOrgUnit only**: ActivityOrgUnit(activityId=courseId, orgUnitId=classId). Class without course = no such row; “link course” = create row; “unlink” = delete row.

### 2.5 Member (Student)
- **Validation:** For type STUDENT (institution), enforce `orgUnitId` is a CLASS. **Class-level rule:** Cannot assign students to a class until that class is linked to a course (i.e. until ActivityOrgUnit(course, class) exists). UI warning: “Link this class to a course before assigning students.”

### 2.6 Faculty–Class
- **Phase 1:** Single Class Teacher only — use existing `OrganizationUnit.managerId` (1:1).
- **Phase 2 (later):** New junction table `class_faculty` (class_id, faculty_id, subject_id optional) for multiple faculty per class when needed.

**Summary of schema work:**
1. Add `COURSE` to `ActivityType` enum.
2. Add `CourseDivision` enum (SEMESTER, YEAR, BOTH).
3. Add to `Activity`: `yearBegin`, `yearEnd`, `division`, `numberOfSemesters`, `numberOfYears`, `deletedAt`, `deletedBy`; ensure slug generation and uniqueness.
4. No new column on OrganizationUnit; Class ↔ Course via ActivityOrgUnit.
5. No new table for faculty–class in Phase 1 (use managerId).

---

## 3. Role-Based Permissions (ADD / MODIFY / DELETE)

| Entity | SUPER_ADMIN | TENANT_ADMIN / CLIENT_ADMIN | DEPARTMENT_HEAD / HoD | CLASS_TEACHER |
|--------|-------------|-----------------------------|------------------------|---------------|
| **Department** | All | All (own tenant) | View own; Edit own dept | View |
| **Course** | All | All (own tenant) | Add/Edit/Delete in own dept | View; optional Edit (e.g. own courses) |
| **Class** | All | All (own tenant) | Add/Edit/Delete in own dept | Add/Edit classes in own dept; assign students |
| **Student** | All | All (own tenant) | Add/Edit/Delete in own dept | Add/Edit in own class(es) |
| **Faculty (assign to class)** | All | All | Assign in own dept | View; optional self-assign to class |

**Rules:**
- **Tenant scope:** All mutations scoped by tenantId (and for HoD/Class Teacher by department/class they manage).
- **Department scope:** DEPARTMENT_HEAD can only manage org units (and courses/classes) under their managed department (managedUnits).
- **Class scope:** CLASS_TEACHER can only manage members (students) and possibly class details for classes they manage (managerId = their member id).

**Implementation:** Centralize checks in API layer (e.g. `canManageDepartment(tenantId, deptId)`, `canManageCourse(tenantId, courseId)`, etc.) and reuse in all Course/Class/Department APIs.

---

## 4. API Layer (CRUD + Bulk)

### 4.1 Courses (Activity type COURSE)

| Method | Route | Description | Roles |
|--------|------|--------------|--------|
| GET | `/api/clients/:clientId/courses` or `/api/org/:slug/courses` | List courses (exclude soft-deleted; filter by department optional) | All org roles |
| GET | `/api/clients/:clientId/courses/:courseId` | Course detail + linked classes + curriculum | All org roles |
| POST | `/api/clients/:clientId/courses` | Create course (name, code, departmentId, yearBegin, yearEnd, division, numberOfSemesters?, numberOfYears?, slug?) | Admin, HoD |
| PATCH | `/api/clients/:clientId/courses/:courseId` | Update course (slug editable for manual override) | Admin, HoD |
| DELETE | `/api/clients/:clientId/courses/:courseId` | **Soft-delete** (see rules below) | Admin, HoD |
| POST | `/api/clients/:clientId/courses/bulk` | Bulk create from CSV | Admin, HoD |

**Slug:** Auto = `${code.toLowerCase()}-${yearBegin}` (e.g. `btech-cse-2023`). Optional manual override; validate (tenantId, slug) unique.

**Delete rules (soft-delete):**
- **BLOCK** if course has classes that have students enrolled. Return error: “Cannot delete course with enrolled students. Move students first or archive.”
- **WARN + ALLOW** if course has linked classes but no students: confirm “Unlink X empty classes and delete course?” → unlink classes (remove ActivityOrgUnit rows), then soft-delete course.
- **ALLOW** if no linked classes: set deletedAt, deletedBy, isActive = false.

**Logic:** Create Activity type COURSE; ActivityOrgUnit(courseId, departmentId). Link curriculum via ActivityCurriculum.

### 4.2 Classes (OrganizationUnit type CLASS)

| Method | Route | Description | Roles |
|--------|------|--------------|--------|
| GET | `/api/clients/:clientId/departments/:deptId/classes` | List classes under department (optional filter by courseId) | All org roles |
| POST | `/api/clients/:clientId/classes` | Create class (name, code, departmentId, courseId **optional**) | Admin, HoD, Class Teacher |
| PATCH | `/api/clients/:clientId/classes/:classId` | Update class (name, code, courseId, managerId) | Admin, HoD, Class Teacher (own class) |
| DELETE | `/api/clients/:clientId/classes/:classId` | Delete if no members | Admin, HoD |
| POST | `/api/clients/:clientId/classes/bulk` | Bulk create from CSV (name, code, courseCode?, departmentCode) | Admin, HoD |

**Logic:**
- Class: parentId = departmentId. Link to course: create ActivityOrgUnit(courseId, classId). courseId **optional** at create; can link later.
- **Validation:** Cannot assign students (set member.orgUnitId = classId) until class is linked to a course (ActivityOrgUnit exists for this class). Same for assessments. UI: “⚠️ Link this class to a course before assigning students.”

### 4.3 Students (Members in Class)

| Method | Route | Description | Roles |
|--------|------|--------------|--------|
| POST | `/api/clients/:clientId/employees` or members | Create member with orgUnitId = classId | Admin, HoD, Class Teacher |
| PATCH | `/api/clients/:clientId/employees/:id` | Update member; allow changing orgUnitId only to another class | Admin, HoD, Class Teacher |
| POST | `/api/clients/:clientId/employees/bulk-upload` | Bulk add; CSV must include class code column; assign orgUnitId from class | Admin, HoD, Class Teacher |

**Validation:** On create/update, if type is STUDENT (or institution), require orgUnitId and ensure that org unit’s type is CLASS.

### 4.4 Faculty Assignment

- **Class teacher:** Set OrganizationUnit.managerId = memberId for the class. Use existing PATCH department/unit API or new PATCH class API.
- **Course faculty (optional):** Use ActivityMember(activityId=courseId, memberId=facultyId) for “faculty teaches this course”. Add/remove via existing or new ActivityMember API.

### 4.5 Department (Existing)

- Keep existing GET/POST/PATCH for departments. Ensure HoD can only PATCH departments they manage (managedUnits). Bulk upload already added.

---

## 5. UI Hierarchy and Flows

### 5.1 Org routes (institution)

- **Base path:** `/assessments/org/:slug`
- **Departments list:** `/departments` (existing) — Add Faculty, Upload Faculties CSV.
- **Department detail:** `/departments/:deptId` (create if missing under org)
  - Tabs: **Overview**, **Courses**, **Classes**, **Members** (students + faculty).
  - **Courses tab:** List courses scoped to this department (Activity type COURSE + ActivityOrgUnit with this dept). Buttons: Add Course, Upload Courses CSV.
  - **Classes tab:** List classes (children of this dept). Buttons: Add Class, Upload Classes CSV. Each row shows linked Course name.
  - **Members tab:** List members in this department (direct + in classes). Optional filter by class/course.

### 5.2 Course detail page

- **Route:** `/assessments/org/:slug/courses/:courseId` (new)
- **Content:** Name, code, department, year begin/end, division; linked curriculum nodes; list of classes (ActivityOrgUnit with this course); list of faculty (ActivityMember or class teachers of those classes).
- **Actions:** Edit course, Add class to course, Link curriculum, (optional) Add faculty to course.

### 5.3 Class detail page

- **Route:** `/assessments/org/:slug/departments/:deptId/classes/:classId` or `/assessments/org/:slug/classes/:classId` (new or reuse existing team detail under org)
- **Content:** Class name, code, course name (from ActivityOrgUnit), Class Teacher (managerId); list of students (members with orgUnitId = this class).
- **Actions:** Edit class, Assign students, Set class teacher, Bulk add students (CSV with class code).

### 5.4 Breadcrumbs

- Department list → Department detail → Course detail (Department → Course).
- Department detail → Class detail (Department → Class); show Course name on class card/detail.
- Consistent pattern: **Org Home > Faculties > [Faculty] > Courses / Classes > [Course] / [Class].**

### 5.5 URL structure (Product decision)

- **Institutions:** Use `/assessments/org/:slug` only for institution flows (departments, courses, classes). Human-readable slugs; clear tenant type.
- **Corporates:** Use `/assessments/clients/:clientId` for corporate flows (departments, teams, employees). No change.
- **API:** Single backend (e.g. `/api/clients/:clientId/...`) with tenantId from session or from org slug resolution; org pages call same API with resolved clientId.

---

## 6. Bulk Uploads

| Entity | CSV columns | API | Notes |
|--------|-------------|-----|--------|
| **Faculties (departments)** | name, code, description | POST `/api/clients/:clientId/departments/bulk` | Done. |
| **Courses** | name, code, department_code, year_begin, year_end, division, number_of_semesters?, number_of_years? | POST `/api/clients/:clientId/courses/bulk` | division = SEMESTER \| YEAR \| BOTH. Slug auto from code + year_begin. |
| **Classes** | name, code, course_code?, department_code | POST `/api/clients/:clientId/classes/bulk` | course_code optional; link to course if provided. |
| **Students** | first_name, last_name, email, class_code, ... | Existing or extended POST bulk-upload | class_code required; resolve to class; reject if class has no course linked. |

---

## 7. Implementation Phases (Order)

### Phase 1 – Schema and course entity
1. Add `COURSE` to `ActivityType` enum.
2. Add `CourseDivision` enum (SEMESTER, YEAR, BOTH).
3. Add to `Activity`: `yearBegin`, `yearEnd`, `division`, `numberOfSemesters`, `numberOfYears`, `deletedAt`, `deletedBy`.
4. Slug: auto `${code}-${yearBegin}` with manual override; unique (tenantId, slug).
5. Run migration.

### Phase 2 – Course CRUD and scope
1. Implement POST/GET/PATCH/DELETE for “courses” (Activity type COURSE; GET excludes soft-deleted).
2. Slug auto-generation on create; optional override on PATCH; uniqueness check.
3. Enforce role checks (Admin, HoD for create/update/delete).
4. Link course to department: on create, add ActivityOrgUnit(courseId, departmentId).
5. DELETE = soft-delete with validation: block if classes have students; warn and unlink empty classes then soft-delete.

### Phase 3 – Class ↔ Course link
1. On class create: **courseId optional**; if provided, create ActivityOrgUnit(courseId, classId). Allow linking course later via PATCH.
2. Validation: do not allow assigning students to a class until ActivityOrgUnit(course, class) exists; API and UI warning.
3. Update “list classes” to optionally filter by courseId and to return course name (from ActivityOrgUnit).
4. Department detail: “Classes” tab shows classes under dept with course name (or “Not linked”); “Courses” tab shows courses under dept.

### Phase 4 – Department detail under org
1. Add route `/assessments/org/:slug/departments/:deptId` (or ensure it exists and uses same component as clients).
2. Tabs: Overview, Courses, Classes, Members. Courses tab: list + Add Course + Upload CSV. Classes tab: list + Add Class + Upload CSV.

### Phase 5 – Course and class bulk upload
1. POST `/api/clients/:clientId/courses/bulk` (parse CSV, create activities + ActivityOrgUnit to dept).
2. POST `/api/clients/:clientId/classes/bulk` (parse CSV, create org units with parentId = dept, then ActivityOrgUnit(course, class)).
3. UI: “Upload Courses from CSV” and “Upload Classes from CSV” on department detail.

### Phase 6 – Student validation and bulk
1. Validate on member create/update: if institution and type STUDENT, orgUnitId must be a CLASS.
2. Extend students bulk upload to accept class_code and set orgUnitId.

### Phase 7 – Faculty assignment and UI polish
1. Class teacher: ensure PATCH class can set managerId (existing or new endpoint).
2. Optional: ActivityMember for “faculty teaches course” and UI to add/remove.
3. Breadcrumbs and navigation consistency (Department → Course → Class).

---

## 8. Product Decisions (Confirmed)

| # | Question | Decision |
|---|----------|----------|
| 1 | **Course slug** | Auto-generate `slug = \`${code.toLowerCase()}-${yearBegin}\`` (e.g. `btech-cse-2023`). Allow manual override; validate (tenantId, slug) unique. |
| 2 | **Division** | Enum `CourseDivision` (SEMESTER, YEAR, BOTH) + `numberOfSemesters` Int?, `numberOfYears` Int?. Enables “Student in Semester 3 of 8” and UI dropdowns. |
| 3 | **Multiple faculty per class** | Phase 1: single Class Teacher only (`managerId`). Phase 2: add `class_faculty` junction table (class_id, faculty_id, subject_id?) when needed. |
| 4 | **Class without course** | courseId (link) **optional** at create. Cannot assign students or assessments until class is linked to a course. UI warning: “Link this class to a course before assigning students.” |
| 5 | **Delete course** | **Soft-delete.** Block if any linked class has students. If linked classes are empty: warn, confirm, unlink classes then soft-delete (deletedAt, deletedBy, isActive = false). |
| 6 | **Clients vs org** | **Institutions:** `/assessments/org/:slug` (departments, courses, classes). **Corporates:** `/assessments/clients/:clientId` (departments, teams, employees). Single API layer with tenant resolution. |

---

## 9. File / Component Checklist (High Level)

- **Schema:** `prisma/schema.prisma` (ActivityType, Activity fields).
- **APIs:**  
  - `app/api/clients/[clientId]/courses/route.ts` (GET, POST),  
  - `app/api/clients/[clientId]/courses/[courseId]/route.ts` (GET, PATCH, DELETE),  
  - `app/api/clients/[clientId]/courses/bulk/route.ts` (POST),  
  - `app/api/clients/[clientId]/classes/route.ts` (GET, POST),  
  - `app/api/clients/[clientId]/classes/bulk/route.ts` (POST),  
  - `app/api/clients/[clientId]/classes/[classId]/route.ts` (GET, PATCH, DELETE),  
  - Extend `app/api/clients/[clientId]/employees/bulk-upload` for class_code.
- **Pages (org):**  
  - `app/assessments/org/[slug]/departments/[deptId]/page.tsx` (department detail with Courses, Classes, Members tabs),  
  - `app/assessments/org/[slug]/courses/[courseId]/page.tsx` (course detail),  
  - Class detail (under departments or shared).
- **Components:**  
  - CreateCourseDialog, BulkUploadCoursesDialog, CreateClassDialog, BulkUploadClassesDialog; reuse/extend member bulk for class_code.
- **Permissions:** Shared helpers (e.g. `lib/org-permissions.ts` or inside API) for canManageDepartment, canManageCourse, canManageClass.

---

## 10. Success Criteria

- HoD can add/edit/delete courses and classes only in their department; students only in their dept/class.
- Class Teacher can add/edit students in their class(es) and optionally edit class details.
- Each student has exactly one class (orgUnitId = class); validated on create/update and bulk.
- Course shows year begin/end and division; optionally linked to curriculum.
- Bulk upload: faculties (done), courses, classes, students (with class code).
- UI: Department → Course → Class breadcrumb and tabs; Add/Upload for courses and classes visible and working by role.
