# Institution Hierarchy – Implementation Plan v2.0

**Goal:** Implement **Department (HoD) → Course → Class → Students/Faculty** with correct ADD, MODIFY, DELETE by role, plus bulk uploads and clear UI hierarchy.

**Reference:** 
- FSD logic (Department → Course → Class; semesters/years; curriculum link; student in one class; faculty per class/course)
- Enhancement Specification v2.0 (Polymorphic roles, student restrictions, staff capabilities)

**Key Decisions Made:**
1. ✅ Course slug: Auto-generated from `code-yearBegin`, editable if needed
2. ✅ Division: Enum (SEMESTER/YEAR/BOTH) + numeric fields for counts
3. ✅ Multiple faculty: Single Class Teacher in v1 via managerId
4. ✅ Class without course: courseId optional initially, required before assigning students
5. ✅ Delete course: Soft-delete with validation (block if students exist)
6. ✅ URL structure: `/org/:slug` for institutions, `/clients/:clientId` for corporates

---

## 1. Current State vs Target

| Concept | Current | Target | Changes |
|---------|---------|--------|---------|
| **Department** | `OrganizationUnit` type DEPARTMENT, parentId null | Same. HoD = managerId. | ✅ No change |
| **Class** | `OrganizationUnit` type CLASS, parentId = department | Same. Link to Course via ActivityOrgUnit. | ⚠️ Add courseId validation |
| **Course** | No dedicated type | **NEW:** ActivityType COURSE with yearBegin, yearEnd, division, semesterCount, yearCount | 🆕 New entity |
| **Course ↔ Department** | — | Course scoped to Department via ActivityOrgUnit(course, department, relationship='SCOPED_TO') | 🆕 New relationship |
| **Course ↔ Class** | — | Many classes per course via ActivityOrgUnit(course, class, relationship='CONTAINS') | 🆕 New relationship |
| **Student** | Member with orgUnitId (any unit) | orgUnitId = Class only; validated on create/update/bulk | ⚠️ Add validation |
| **Faculty** | Member (CLASS_TEACHER); managerId on Class | Assign to Class via managerId; LIMITED profile (from Enhancement #3) | ⚠️ Add profile restrictions |
| **Curriculum** | CurriculumNode; ActivityCurriculum links Activity to nodes | Course (Activity) links to curriculum via ActivityCurriculum | ✅ Reuse existing |

---

## 2. Schema Changes (Prisma)

### 2.1 ActivityType enum
```prisma
enum ActivityType {
  PROJECT
  CURRICULUM
  BOOTCAMP
  INITIATIVE
  COURSE        // 🆕 NEW: Institution academic program
}
```

### 2.2 Activity model (Course fields)
```prisma
model Activity {
  // ... existing fields ...
  
  // 🆕 NEW: Course-specific fields (nullable for backward compatibility)
  yearBegin       Int?           // e.g., 2023
  yearEnd         Int?           // e.g., 2027
  division        CourseDivision? // SEMESTER | YEAR | BOTH
  semesterCount   Int?           // e.g., 8 for B.Tech (if division includes SEMESTER)
  yearCount       Int?           // e.g., 4 for B.Tech (if division includes YEAR)
  
  // Soft delete (for all activities, not just courses)
  deletedAt       DateTime?
  deletedBy       String?
}

enum CourseDivision {
  SEMESTER      // Only semesters (e.g., MBA: Sem 1-4)
  YEAR          // Only years (e.g., Certificate: Year 1)
  BOTH          // Both semesters and years (e.g., B.Tech: 4 years = 8 semesters)
}
```

### 2.3 ActivityOrgUnit (Enhanced relationship tracking)
```prisma
model ActivityOrgUnit {
  // ... existing fields ...
  
  // 🆕 NEW: Relationship type for clarity
  relationship    String?  // 'SCOPED_TO' (course→dept), 'CONTAINS' (course→class), 'ASSIGNED_TO' (faculty→class)
}
```

**Why relationship field?**
- `ActivityOrgUnit(courseId, deptId, 'SCOPED_TO')` → "Course belongs to Department"
- `ActivityOrgUnit(courseId, classId, 'CONTAINS')` → "Course contains Class"
- Clear semantic meaning when querying

### 2.4 OrganizationUnit (No schema change, validation only)
```prisma
model OrganizationUnit {
  // ... existing fields ...
  // No new columns needed
  // courseId is derived from ActivityOrgUnit, not stored directly
}
```

### 2.5 Member (Student validation)
```prisma
model Member {
  // ... existing fields ...
  // No new columns needed
  
  // Validation rule (enforced in API layer):
  // IF tenant.type = 'INSTITUTION' AND member.role = 'STUDENT'
  // THEN member.orgUnitId MUST point to OrganizationUnit.type = 'CLASS'
}
```

### 2.6 Migration Strategy for Existing Data
```sql
-- Step 1: Add new fields to Activity table
ALTER TABLE "Activity" 
  ADD COLUMN "yearBegin" INTEGER,
  ADD COLUMN "yearEnd" INTEGER,
  ADD COLUMN "division" TEXT,
  ADD COLUMN "semesterCount" INTEGER,
  ADD COLUMN "yearCount" INTEGER,
  ADD COLUMN "deletedAt" TIMESTAMP,
  ADD COLUMN "deletedBy" TEXT;

-- Step 2: Add relationship column to ActivityOrgUnit
ALTER TABLE "ActivityOrgUnit" 
  ADD COLUMN "relationship" TEXT;

-- Step 3: Update existing ActivityOrgUnit records (if any need migration)
-- (Most likely none exist for courses yet, so this is for safety)

-- Step 4: No migration needed for students - validation added in API layer
-- Existing students remain in their current orgUnits until manually moved
```

---

## 3. Role-Based Permissions (ADD / MODIFY / DELETE)

### 3.1 Permission Matrix

| Entity | SUPER_ADMIN | TENANT_ADMIN / CLIENT_ADMIN | DEPARTMENT_HEAD (HoD) | CLASS_TEACHER |
|--------|-------------|-----------------------------|-----------------------|---------------|
| **Department** | All | All (own tenant) | View own; Edit own dept info | View only |
| **Course** | All | All (own tenant) | Add/Edit/Delete in own dept only | View only |
| **Class** | All | All (own tenant) | Add/Edit/Delete in own dept only | View own; Edit own class details |
| **Student** | All | All (own tenant) | Add/Edit/Delete in own dept | Add/Edit/Delete in own classes only |
| **Faculty Assignment** | All | All | Assign to classes in own dept | View only |

### 3.2 Specific Rules

**DEPARTMENT_HEAD (HoD):**
- Can manage courses ONLY in departments they manage (`managedUnits` contains deptId)
- Can manage classes ONLY in their departments
- Can manage students ONLY in classes within their departments
- Cannot access courses/classes/students from other departments

**CLASS_TEACHER:**
- Can view courses and classes they're assigned to
- Can add/edit/delete students ONLY in classes where they are the `managerId`
- Cannot create courses or classes
- Cannot assign other faculty
- Has LIMITED profile (no career planning) per Enhancement #3

**Validation Logic:**
```typescript
// Department Head authorization
async function canManageDepartment(userId: string, deptId: string): boolean {
  const member = await getMemberByUserId(userId);
  return member.managedUnits.includes(deptId);
}

// Class Teacher authorization
async function canManageClass(userId: string, classId: string): boolean {
  const cls = await getClass(classId);
  const member = await getMemberByUserId(userId);
  return cls.managerId === member.id;
}

// Course authorization (derives from department)
async function canManageCourse(userId: string, courseId: string): boolean {
  const course = await getCourse(courseId);
  const deptLink = await getActivityOrgUnit(courseId, 'SCOPED_TO');
  return canManageDepartment(userId, deptLink.orgUnitId);
}
```

---

## 4. API Layer (CRUD + Bulk)

### 4.1 URL Structure Decision

**INSTITUTIONS:** Use `/assessments/org/:slug/...`  
**CORPORATES:** Use `/assessments/clients/:clientId/...`

**Rationale:**
- Clean, semantic URLs for institutions (e.g., `/org/stanford-university/courses`)
- Maintains backward compatibility for corporates
- Clear separation of tenant types in codebase
- Better SEO and user experience

**Implementation:**
```typescript
// Shared API functions used by both routes
// app/api/lib/courses.ts (shared logic)

// Institution-specific routes
// app/api/org/[slug]/courses/route.ts → calls shared logic

// Corporate-specific routes (if needed)
// app/api/clients/[clientId]/courses/route.ts → calls shared logic
```

### 4.2 Courses API (Activity type COURSE)

| Method | Route | Description | Roles | Request Body |
|--------|------|-------------|-------|--------------|
| GET | `/api/org/:slug/courses` | List courses (filter by departmentId optional) | All org roles | — |
| GET | `/api/org/:slug/courses/:courseId` | Course detail + linked classes + curriculum | All org roles | — |
| POST | `/api/org/:slug/courses` | Create course | Admin, HoD | `CreateCourseRequest` |
| PATCH | `/api/org/:slug/courses/:courseId` | Update course | Admin, HoD | `UpdateCourseRequest` |
| DELETE | `/api/org/:slug/courses/:courseId` | Soft-delete course (with validation) | Admin, HoD | — |
| POST | `/api/org/:slug/courses/bulk` | Bulk create from CSV | Admin, HoD | CSV file |

**Request Types:**
```typescript
interface CreateCourseRequest {
  name: string;                    // e.g., "B.Tech Computer Science Engineering"
  code: string;                    // e.g., "BTECH-CSE"
  slug?: string;                   // Optional; auto-generated if not provided
  departmentId: string;            // UUID of department
  yearBegin: number;               // e.g., 2023
  yearEnd: number;                 // e.g., 2027
  division: 'SEMESTER' | 'YEAR' | 'BOTH';
  semesterCount?: number;          // Required if division includes SEMESTER
  yearCount?: number;              // Required if division includes YEAR
  curriculumNodeIds?: string[];    // Optional array of curriculum node UUIDs
  description?: string;
}

interface UpdateCourseRequest {
  name?: string;
  description?: string;
  yearEnd?: number;                // Allow extending course duration
  // Note: yearBegin, division cannot be changed once created
}
```

**Slug Generation:**
```typescript
function generateCourseSlug(code: string, yearBegin: number): string {
  return `${code.toLowerCase()}-${yearBegin}`;
  // Example: "btech-cse-2023"
}
```

**Course Creation Logic:**
```typescript
async function createCourse(req: CreateCourseRequest, tenantId: string) {
  // 1. Validate requester has permission for this department
  await validateDepartmentAccess(req.departmentId);
  
  // 2. Generate slug if not provided
  const slug = req.slug || generateCourseSlug(req.code, req.yearBegin);
  
  // 3. Validate uniqueness
  await validateUniqueSlug(tenantId, slug);
  
  // 4. Validate division + count fields
  if (req.division === 'SEMESTER' || req.division === 'BOTH') {
    if (!req.semesterCount) throw new Error("semesterCount required");
  }
  if (req.division === 'YEAR' || req.division === 'BOTH') {
    if (!req.yearCount) throw new Error("yearCount required");
  }
  
  // 5. Create Activity
  const course = await prisma.activity.create({
    data: {
      type: 'COURSE',
      tenantId,
      slug,
      name: req.name,
      description: req.description,
      yearBegin: req.yearBegin,
      yearEnd: req.yearEnd,
      division: req.division,
      semesterCount: req.semesterCount,
      yearCount: req.yearCount,
    }
  });
  
  // 6. Link to department (SCOPED_TO)
  await prisma.activityOrgUnit.create({
    data: {
      activityId: course.id,
      orgUnitId: req.departmentId,
      relationship: 'SCOPED_TO'
    }
  });
  
  // 7. Link to curriculum nodes if provided
  if (req.curriculumNodeIds?.length) {
    await prisma.activityCurriculum.createMany({
      data: req.curriculumNodeIds.map(nodeId => ({
        activityId: course.id,
        curriculumNodeId: nodeId
      }))
    });
  }
  
  return course;
}
```

**Course Deletion Logic (Soft-Delete with Validation):**
```typescript
async function deleteCourse(courseId: string, userId: string) {
  // 1. Check if course has linked classes
  const linkedClasses = await prisma.activityOrgUnit.findMany({
    where: {
      activityId: courseId,
      relationship: 'CONTAINS'
    },
    include: {
      orgUnit: {
        include: {
          members: true  // Include students in class
        }
      }
    }
  });
  
  // 2. Check if any class has students
  const hasStudents = linkedClasses.some(
    link => link.orgUnit.members.length > 0
  );
  
  if (hasStudents) {
    throw new Error(
      "Cannot delete course with enrolled students. " +
      "Please move students to other classes first or archive the course."
    );
  }
  
  // 3. If classes exist but are empty, unlink them
  if (linkedClasses.length > 0) {
    await prisma.activityOrgUnit.deleteMany({
      where: {
        activityId: courseId,
        relationship: 'CONTAINS'
      }
    });
  }
  
  // 4. Soft-delete the course
  await prisma.activity.update({
    where: { id: courseId },
    data: {
      deletedAt: new Date(),
      deletedBy: userId
    }
  });
  
  return { success: true, message: "Course deleted successfully" };
}
```

### 4.3 Classes API (OrganizationUnit type CLASS)

| Method | Route | Description | Roles | Request Body |
|--------|------|-------------|-------|--------------|
| GET | `/api/org/:slug/departments/:deptId/classes` | List classes under department (filter by courseId optional) | All org roles | — |
| GET | `/api/org/:slug/classes/:classId` | Class detail | All org roles | — |
| POST | `/api/org/:slug/classes` | Create class | Admin, HoD, Class Teacher | `CreateClassRequest` |
| PATCH | `/api/org/:slug/classes/:classId` | Update class | Admin, HoD, Class Teacher (own) | `UpdateClassRequest` |
| DELETE | `/api/org/:slug/classes/:classId` | Delete if no members | Admin, HoD | — |
| POST | `/api/org/:slug/classes/bulk` | Bulk create from CSV | Admin, HoD | CSV file |

**Request Types:**
```typescript
interface CreateClassRequest {
  name: string;              // e.g., "Section A"
  code: string;              // e.g., "CSE-A-2023"
  slug?: string;             // Optional; auto-generated if not provided
  departmentId: string;      // UUID
  courseId?: string;         // Optional; can be linked later
  managerId?: string;        // Optional; Class Teacher member UUID
  description?: string;
}

interface UpdateClassRequest {
  name?: string;
  description?: string;
  courseId?: string;         // Can link/unlink course
  managerId?: string;        // Can assign/change Class Teacher
}
```

**Class Creation Logic:**
```typescript
async function createClass(req: CreateClassRequest, tenantId: string) {
  // 1. Validate department access
  await validateDepartmentAccess(req.departmentId);
  
  // 2. Create OrganizationUnit
  const cls = await prisma.organizationUnit.create({
    data: {
      type: 'CLASS',
      tenantId,
      name: req.name,
      slug: req.slug || generateSlug(req.code),
      parentId: req.departmentId,
      managerId: req.managerId,
      description: req.description
    }
  });
  
  // 3. Link to course if provided
  if (req.courseId) {
    // Validate course exists and belongs to same department
    await validateCourseInDepartment(req.courseId, req.departmentId);
    
    await prisma.activityOrgUnit.create({
      data: {
        activityId: req.courseId,
        orgUnitId: cls.id,
        relationship: 'CONTAINS'
      }
    });
  }
  
  return cls;
}
```

**Class Validation Before Student Assignment:**
```typescript
async function validateClassForStudentAssignment(classId: string) {
  const cls = await prisma.organizationUnit.findUnique({
    where: { id: classId },
    include: {
      activityOrgUnits: {
        where: { relationship: 'CONTAINS' }
      }
    }
  });
  
  if (!cls) throw new Error("Class not found");
  
  // Check if class is linked to a course
  if (cls.activityOrgUnits.length === 0) {
    throw new Error(
      "This class must be linked to a course before assigning students. " +
      "Please link the class to a course first."
    );
  }
  
  return true;
}
```

### 4.4 Students API (Members in Class)

| Method | Route | Description | Roles | Request Body |
|--------|------|-------------|-------|--------------|
| POST | `/api/org/:slug/members` | Create student member | Admin, HoD, Class Teacher | `CreateStudentRequest` |
| PATCH | `/api/org/:slug/members/:id` | Update student; allow class change | Admin, HoD, Class Teacher | `UpdateStudentRequest` |
| POST | `/api/org/:slug/members/bulk-upload` | Bulk add students with class codes | Admin, HoD, Class Teacher | CSV file |

**Request Types:**
```typescript
interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNumber: string;        // From Enhancement #4
  orgUnitId: string;               // Must be a CLASS UUID
  hasGraduated?: boolean;          // From Enhancement #2
  graduationDate?: string;         // From Enhancement #2
  // ... other member fields
}
```

**Student Creation Validation:**
```typescript
async function createStudent(req: CreateStudentRequest, tenantId: string) {
  // 1. Validate orgUnitId is a CLASS
  const orgUnit = await prisma.organizationUnit.findUnique({
    where: { id: req.orgUnitId }
  });
  
  if (!orgUnit || orgUnit.type !== 'CLASS') {
    throw new Error("orgUnitId must be a CLASS for students");
  }
  
  // 2. Validate class is linked to a course
  await validateClassForStudentAssignment(req.orgUnitId);
  
  // 3. Validate enrollment number is unique
  const existing = await prisma.member.findFirst({
    where: {
      tenantId,
      enrollmentNumber: req.enrollmentNumber
    }
  });
  
  if (existing) {
    throw new Error(`Enrollment number ${req.enrollmentNumber} already exists`);
  }
  
  // 4. Create member
  const student = await prisma.member.create({
    data: {
      ...req,
      tenantId,
      role: 'STUDENT',
      hasGraduated: req.hasGraduated || false
    }
  });
  
  return student;
}
```

**Bulk Student Upload Logic:**
```typescript
async function bulkUploadStudents(csvFile: File, tenantId: string) {
  // 1. Parse CSV
  const rows = await parseCSV(csvFile);
  
  // Expected columns: first_name, last_name, email, enrollment_number, class_code
  
  // 2. Validate and collect class codes
  const classCodes = [...new Set(rows.map(r => r.class_code))];
  
  // 3. Lookup classes by code
  const classes = await prisma.organizationUnit.findMany({
    where: {
      tenantId,
      type: 'CLASS',
      slug: { in: classCodes }
    }
  });
  
  const classCodeToId = new Map(
    classes.map(c => [c.slug, c.id])
  );
  
  // 4. Process each row
  const results = {
    success: [],
    errors: []
  };
  
  for (const row of rows) {
    try {
      const classId = classCodeToId.get(row.class_code);
      
      if (!classId) {
        results.errors.push({
          row: row,
          error: `Class code '${row.class_code}' not found`
        });
        continue;
      }
      
      // Validate class is linked to course
      await validateClassForStudentAssignment(classId);
      
      // Create student
      const student = await createStudent({
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        enrollmentNumber: row.enrollment_number,
        orgUnitId: classId
      }, tenantId);
      
      results.success.push(student);
      
    } catch (error) {
      results.errors.push({
        row: row,
        error: error.message
      });
    }
  }
  
  return results;
}
```

### 4.5 Bulk Upload CSV Formats

**Courses CSV:**
```csv
name,code,department_code,year_begin,year_end,division,semester_count,year_count,description
"B.Tech Computer Science Engineering","BTECH-CSE","IT","2023","2027","BOTH","8","4","4-year undergraduate program"
"MBA","MBA","BM","2024","2026","SEMESTER","4","","2-year postgraduate program"
"Certificate in AI","CERT-AI","IT","2024","2025","YEAR","","1","1-year certificate course"
```

**Classes CSV:**
```csv
name,code,course_code,department_code,manager_email
"Section A","CSE-A-2023","btech-cse-2023","IT","hod.it@university.edu"
"Section B","CSE-B-2023","btech-cse-2023","IT","hod.it@university.edu"
"MBA Section 1","MBA-1-2024","mba-2024","BM","teacher1@university.edu"
```

**Students CSV:**
```csv
first_name,last_name,email,enrollment_number,class_code,has_graduated
"John","Doe","john.doe@university.edu","CS2023001","CSE-A-2023","false"
"Jane","Smith","jane.smith@university.edu","CS2023002","CSE-A-2023","false"
"Bob","Johnson","bob.j@university.edu","CS2020100","CSE-A-2020","true"
```

---

## 5. UI Hierarchy and Flows

### 5.1 URL Structure

**Institution Routes:**
- Base: `/assessments/org/:slug`
- Departments list: `/assessments/org/:slug/departments`
- Department detail: `/assessments/org/:slug/departments/:deptId`
- Course detail: `/assessments/org/:slug/courses/:courseId`
- Class detail: `/assessments/org/:slug/classes/:classId`

**Corporate Routes (Unchanged):**
- Base: `/assessments/clients/:clientId`
- All existing routes remain the same

### 5.2 Department Detail Page

**Route:** `/assessments/org/:slug/departments/:deptId`

**Tabs:**
1. **Overview** - Department info, HoD, statistics
2. **Courses** - List of courses in this department
3. **Classes** - List of classes in this department
4. **Members** - Students and faculty in this department

**Courses Tab:**
- **List View:**
  - Columns: Name, Code, Year Range, Division, # of Classes, # of Students, Actions
  - Each row shows: "B.Tech CSE | BTECH-CSE | 2023-2027 | 8 Semesters / 4 Years | 3 classes | 120 students"
  
- **Actions (Top):**
  - ➕ Add Course (button) → Opens CreateCourseDialog
  - 📤 Upload Courses (button) → Opens BulkUploadCoursesDialog
  
- **Actions (Per Row):**
  - 👁️ View (link to course detail)
  - ✏️ Edit (for HoD only)
  - 🗑️ Delete (for HoD only, with validation)

**Classes Tab:**
- **List View:**
  - Columns: Name, Code, Course, Class Teacher, # of Students, Actions
  - Each row shows: "Section A | CSE-A-2023 | B.Tech CSE | Prof. Smith | 40 students"
  
- **Actions (Top):**
  - ➕ Add Class (button) → Opens CreateClassDialog
  - 📤 Upload Classes (button) → Opens BulkUploadClassesDialog
  
- **Filter:** Dropdown to filter by course
  
- **Warning Badge:** If class has no course linked, show ⚠️ "Not linked to course"

**Members Tab:**
- **List View:**
  - Columns: Name, Enrollment #, Email, Class, Course, Role, Actions
  - Filter by: Role (Student/Faculty), Class, Course
  
- **Actions (Top):**
  - ➕ Add Student (button)
  - 📤 Upload Students (button)

### 5.3 Course Detail Page

**Route:** `/assessments/org/:slug/courses/:courseId`

**Breadcrumb:** Home > Departments > [Dept Name] > [Course Name]

**Content:**
- **Header Section:**
  - Course name, code
  - Department (link back)
  - Year range: "2023 - 2027"
  - Division: "8 Semesters (4 Years)"
  
- **Stats Cards:**
  - Total Classes: 3
  - Total Students: 120
  - Completion Rate: 0% (calculated based on year progress)

- **Linked Curriculum Section:**
  - Shows program → subjects → topics hierarchy
  - Button: "Link Curriculum" (opens curriculum selector)

- **Classes Section:**
  - Table: Class Name, Code, Class Teacher, # Students, Actions
  - Button: "Add Class to Course"
  
- **Actions (Top):**
  - ✏️ Edit Course
  - 🗑️ Delete Course (with validation)

### 5.4 Class Detail Page

**Route:** `/assessments/org/:slug/classes/:classId`

**Breadcrumb:** Home > Departments > [Dept Name] > [Course Name] > [Class Name]

**Content:**
- **Header Section:**
  - Class name, code
  - Department (link)
  - Course (link) - OR ⚠️ "Not linked to course - Click to link"
  - Class Teacher (link to profile)
  
- **Stats Cards:**
  - Total Students: 40
  - Current Semester/Year: Auto-calculated from course + date
  - Assessments Completed: 5/10

- **Students Section:**
  - Table: Name, Enrollment #, Email, Joined Date, Actions
  - Search/filter by name, enrollment number
  - Button: ➕ Add Students | 📤 Upload Students
  
- **Actions (Top):**
  - ✏️ Edit Class
  - 🔗 Link to Course (if not linked)
  - 👤 Assign Class Teacher

### 5.5 Navigation & Breadcrumbs

**Consistent Pattern:**
```
Home > Departments > [Department] > Courses > [Course]
Home > Departments > [Department] > Classes > [Class]
Home > Departments > [Department] > Courses > [Course] > Classes > [Class]
```

**Sidebar (Institution):**
```
📊 Dashboard
🏢 Departments
  └─ [List of departments HoD manages]
📚 Courses (all courses in managed departments)
🎓 Classes (all classes in managed departments)
👥 Students (all students in managed classes)
📋 Assessments
📊 Reports
```

---

## 6. Implementation Phases (Revised Order)

### Phase 1 – Schema Foundation (2-3 days)
**Goal:** Database ready for courses and classes

**Tasks:**
1. Add `COURSE` to `ActivityType` enum
2. Add to `Activity`: `yearBegin`, `yearEnd`, `division`, `semesterCount`, `yearCount`, `deletedAt`, `deletedBy`
3. Add to `ActivityOrgUnit`: `relationship` field
4. Run migration
5. Write migration script for existing data (if needed)

**Deliverables:**
- ✅ Migration file executed
- ✅ Schema updated in production
- ✅ No breaking changes to existing features

---

### Phase 2 – Course Backend (3-4 days)
**Goal:** Full CRUD for courses with proper validation

**Tasks:**
1. Create shared course service (`lib/services/course-service.ts`)
2. Implement course CRUD functions with validation
3. Implement soft-delete with validation (block if students exist)
4. Create API routes: `/api/org/:slug/courses/*`
5. Add role-based permission checks
6. Write unit tests for course creation/deletion logic

**Deliverables:**
- ✅ POST/GET/PATCH/DELETE `/courses` working
- ✅ Course correctly scoped to department via ActivityOrgUnit
- ✅ Slug generation working
- ✅ Soft-delete validation working

---

### Phase 3 – Class-Course Linking (2-3 days)
**Goal:** Classes can be linked to courses

**Tasks:**
1. Update class creation to accept optional `courseId`
2. Create/update ActivityOrgUnit(course, class, 'CONTAINS') when linking
3. Add validation: class can only link to course in same department
4. Implement "link class to course" endpoint
5. Add validation: student cannot be assigned to class without course

**Deliverables:**
- ✅ Class creation includes optional courseId
- ✅ Linking validation working
- ✅ Cannot assign students to unlinked classes

---

### Phase 4 – Student Validation (1-2 days)
**Goal:** Students properly validated and restricted

**Tasks:**
1. Add validation in member create/update: orgUnitId must be CLASS for students
2. Add validation: class must have course before accepting students
3. Update existing student assignment logic
4. Add clear error messages for validation failures

**Deliverables:**
- ✅ Student creation validates orgUnitId is CLASS
- ✅ Student creation validates class has course
- ✅ Clear error messages displayed

---

### Phase 5 – Department Detail UI (3-4 days)
**Goal:** Department detail page with Courses and Classes tabs

**Tasks:**
1. Create/update department detail page component
2. Implement Courses tab with list + Add + Upload
3. Implement Classes tab with list + Add + Upload + course filter
4. Implement Members tab with role/class/course filters
5. Add permission checks in UI (show/hide buttons based on role)

**Deliverables:**
- ✅ Department detail page with 3 tabs
- ✅ Course list showing all department courses
- ✅ Class list showing all department classes with course names
- ✅ Add buttons functional
- ✅ Upload buttons present (bulk functionality in next phase)

---

### Phase 6 – Course and Class Detail Pages (2-3 days)
**Goal:** Individual pages for course and class entities

**Tasks:**
1. Create course detail page component
2. Create class detail page component
3. Implement breadcrumbs for navigation
4. Add edit dialogs for course and class
5. Add delete functionality with confirmation

**Deliverables:**
- ✅ `/courses/:courseId` page working
- ✅ `/classes/:classId` page working
- ✅ Breadcrumbs functional
- ✅ Edit/delete working with proper permissions

---

### Phase 7 – Bulk Upload (3-4 days)
**Goal:** CSV upload for courses, classes, students

**Tasks:**
1. Implement course bulk upload API
2. Implement class bulk upload API
3. Extend student bulk upload to accept class_code
4. Create BulkUploadCoursesDialog component
5. Create BulkUploadClassesDialog component
6. Update BulkUploadStudentsDialog to support class_code
7. Implement error handling and partial success reporting

**Deliverables:**
- ✅ POST `/courses/bulk` working
- ✅ POST `/classes/bulk` working
- ✅ Student bulk upload supports class_code
- ✅ UI shows success/error counts
- ✅ Download error report for failed rows

---

### Phase 8 – Faculty Assignment & Polish (2-3 days)
**Goal:** Complete faculty assignment and UI refinements

**Tasks:**
1. Implement "Assign Class Teacher" functionality
2. Add Class Teacher profile restrictions (from Enhancement #3)
3. Update class detail to show assigned teacher
4. Add validation: only institution faculty can be assigned
5. Polish UI: loading states, error messages, empty states
6. Add help tooltips for complex features

**Deliverables:**
- ✅ Class Teacher assignment working
- ✅ Limited profiles for staff implemented
- ✅ UI polished and user-friendly
- ✅ Help documentation in place

---

### Phase 9 – Testing & Documentation (2-3 days)
**Goal:** Comprehensive testing and documentation

**Tasks:**
1. Write integration tests for course/class workflows
2. Test all permission scenarios (HoD, Class Teacher, Admin)
3. Test bulk upload with various CSV formats
4. Create user documentation (how to create courses, classes, etc.)
5. Create technical documentation for API
6. Perform UAT with sample institution data

**Deliverables:**
- ✅ All tests passing
- ✅ User guide published
- ✅ API documentation updated
- ✅ UAT sign-off received

---

## Total Timeline: 21-29 days

---

## 7. Success Criteria

### Functional Requirements ✅
- [x] HoD can add/edit/delete courses and classes ONLY in their department
- [x] Class Teacher can add/edit students ONLY in their assigned class(es)
- [x] Each student has exactly one class (orgUnitId = class)
- [x] Student cannot be assigned to class without linked course
- [x] Course shows year begin/end, division, semester/year counts
- [x] Course can optionally link to curriculum
- [x] Soft-delete courses with validation (block if students exist)

### Bulk Upload Requirements ✅
- [x] Bulk upload: Courses (with validation)
- [x] Bulk upload: Classes (with course linking)
- [x] Bulk upload: Students (with class_code column)
- [x] Partial success handling (some rows succeed, some fail)
- [x] Download error report for failed rows

### UI Requirements ✅
- [x] Department → Course → Class breadcrumb navigation
- [x] Department detail with Courses, Classes, Members tabs
- [x] Course detail showing linked classes and students
- [x] Class detail showing course, teacher, students
- [x] Add/Upload buttons visible and functional by role
- [x] Clear error messages for validation failures
- [x] Warning badges for classes without courses

### Permission Requirements ✅
- [x] Department Head scoped to managed departments only
- [x] Class Teacher scoped to assigned classes only
- [x] Super Admin and Tenant Admin have full access
- [x] API endpoints enforce role-based permissions
- [x] UI shows/hides buttons based on user role

### Data Integrity Requirements ✅
- [x] Course slug uniqueness enforced
- [x] Enrollment number uniqueness enforced
- [x] Student orgUnitId must be CLASS type
- [x] Class must have course before accepting students
- [x] Course cannot be deleted if students exist
- [x] All relationships properly maintained in ActivityOrgUnit

---

## 8. Migration & Rollback Plan

### Forward Migration
```sql
-- Run in production after testing in staging
BEGIN;

-- Add new columns
ALTER TABLE "Activity" 
  ADD COLUMN "yearBegin" INTEGER,
  ADD COLUMN "yearEnd" INTEGER,
  ADD COLUMN "division" TEXT,
  ADD COLUMN "semesterCount" INTEGER,
  ADD COLUMN "yearCount" INTEGER,
  ADD COLUMN "deletedAt" TIMESTAMP,
  ADD COLUMN "deletedBy" TEXT;

ALTER TABLE "ActivityOrgUnit" 
  ADD COLUMN "relationship" TEXT;

-- No data migration needed (all new fields nullable)

COMMIT;
```

### Rollback Plan
```sql
-- If migration needs to be reverted
BEGIN;

-- Remove new columns
ALTER TABLE "Activity" 
  DROP COLUMN "yearBegin",
  DROP COLUMN "yearEnd",
  DROP COLUMN "division",
  DROP COLUMN "semesterCount",
  DROP COLUMN "yearCount",
  DROP COLUMN "deletedAt",
  DROP COLUMN "deletedBy";

ALTER TABLE "ActivityOrgUnit" 
  DROP COLUMN "relationship";

COMMIT;
```

**Rollback Safety:**
- ✅ No existing data affected (all fields nullable)
- ✅ No foreign key constraints added
- ✅ Can roll back without data loss

---

## 9. File / Component Checklist

### Backend Files
- [x] `prisma/schema.prisma` - Add ActivityType.COURSE, Activity fields, relationship field
- [x] `prisma/migrations/` - Migration files
- [x] `lib/services/course-service.ts` - Course CRUD logic
- [x] `lib/services/class-service.ts` - Class CRUD logic (extend existing)
- [x] Permission checks in course-service, class-service (canManageCourseDepartment)
- [x] `app/api/org/[slug]/courses/route.ts` - GET, POST courses
- [x] `app/api/org/[slug]/courses/[courseId]/route.ts` - GET, PATCH, DELETE course
- [x] `app/api/org/[slug]/courses/bulk/route.ts` - POST bulk courses
- [x] `app/api/org/[slug]/classes/route.ts` - GET, POST classes
- [x] `app/api/org/[slug]/classes/[classId]/route.ts` - GET, PATCH, DELETE class
- [x] `app/api/org/[slug]/classes/[classId]/members/route.ts` - GET class students
- [x] `app/api/org/[slug]/classes/bulk/route.ts` - POST bulk classes
- [x] `app/api/org/[slug]/departments/[deptId]/members/route.ts` - GET department members
- [x] `app/api/org/[slug]/members/bulk-upload/route.ts` - Student bulk upload with class_code

### Frontend Files
- [x] `app/assessments/org/[slug]/departments/[deptId]/page.tsx` - Department detail with tabs
- [x] `app/assessments/org/[slug]/courses/[courseId]/page.tsx` - Course detail
- [x] `app/assessments/org/[slug]/classes/[classId]/page.tsx` - Class detail
- [x] `components/courses/CreateCourseDialog.tsx` - Create course form
- [x] `components/courses/EditCourseDialog.tsx` - Edit course
- [x] `components/courses/LinkCurriculumDialog.tsx` - Link curriculum to course
- [x] `components/courses/BulkUploadCoursesDialog.tsx` - Bulk upload courses
- [x] `components/classes/CreateClassDialog.tsx` - Create class form (supports courseId)
- [x] `components/classes/EditClassDialog.tsx` - Edit class
- [x] `components/classes/AssignClassTeacherDialog.tsx` - Assign class teacher
- [x] `components/classes/BulkUploadClassesDialog.tsx` - Bulk upload classes
- [x] `components/classes/LinkClassToCourseDialog.tsx` - Link class to course
- [x] `components/members/BulkUploadStudentsDialog.tsx` - Student bulk upload with class_code + error report download

### Test Files
- [ ] `tests/api/courses.test.ts` - Course API tests
- [ ] `tests/api/classes.test.ts` - Class API tests
- [ ] `tests/api/students.test.ts` - Student validation tests
- [ ] `tests/permissions/org-permissions.test.ts` - Permission tests
- [ ] `tests/integration/course-workflow.test.ts` - End-to-end tests

### Implementation Status (Feb 2026)
- **Done:** Schema, course/class APIs, department/course/class detail pages, Department Members tab (list + filters + Add/Upload Students), Course Link Curriculum + Add Class to Course + Completion rate, Class Assign Class Teacher + Students table + Add/Upload Students, Student bulk upload with class_code, UI permission checks (hide Edit/Delete/Add by role), Bulk upload error report download (BulkUploadStudentsDialog). Build fix: duplicate `tenant` in employees route resolved.
- **Class Teacher profile:** Nav already restricts (Departments/Settings not shown to CLASS_TEACHER). Further “limited profile” (e.g. career planning) can be added when that feature exists.
- **Tests/docs:** Manual testing recommended; automated tests and user docs can be added in a follow-up.

---

## 10. Risk Mitigation

### Risk 1: Performance with Large Datasets
**Risk:** Queries slow with thousands of students across hundreds of classes

**Mitigation:**
- Add indexes: `(tenantId, orgUnitId)` on members
- Add index: `(activityId, relationship)` on ActivityOrgUnit
- Implement pagination on all list endpoints
- Add caching for frequently accessed course/class lists

### Risk 2: Data Integrity During Bulk Upload
**Risk:** Partial failures during bulk upload leave data in inconsistent state

**Mitigation:**
- Use database transactions for bulk operations
- Validate ALL rows before starting any inserts
- Provide clear error messages with row numbers
- Allow download of error report for corrections

### Risk 3: Permission Bypass via Direct API Calls
**Risk:** Users circumvent UI restrictions by calling API directly

**Mitigation:**
- ALL permission checks in API layer, not just UI
- Validate tenant/department/class scope on every request
- Log all permission-denied attempts for security monitoring
- Rate limit API endpoints to prevent abuse

### Risk 4: Course Deletion Cascade Errors
**Risk:** Deleting course orphans related data

**Mitigation:**
- Soft-delete by default (preserves history)
- Block deletion if students exist (hard validation)
- Provide "Archive" option instead of delete
- Implement data retention policy

### Risk 5: Class Without Course Edge Cases
**Risk:** Students get assigned to classes without courses due to race conditions

**Mitigation:**
- Database-level validation in member create transaction
- Re-validate in UI before showing "Add Student" button
- Show warning badge on unlinked classes
- Periodic cleanup job to detect and alert on orphaned data

---

## 11. Open Questions & Decisions Log

| Question | Answer | Decided By | Date |
|----------|--------|------------|------|
| Course slug: auto or manual? | Auto-generated from code+year, editable | Product Team | 2026-02-05 |
| Division: enum or text? | Enum (SEMESTER/YEAR/BOTH) + counts | Product Team | 2026-02-05 |
| Multiple faculty per class? | Single managerId in v1, multiple in v2 | Product Team | 2026-02-05 |
| Class without course? | Optional initially, required for students | Product Team | 2026-02-05 |
| Delete course? | Soft-delete, block if students exist | Product Team | 2026-02-05 |
| URL structure? | /org/:slug for institutions | Product Team | 2026-02-05 |

---

## 12. Future Enhancements (Out of Scope for v1)

🔮 **Phase 2 Features:**
- Multiple faculty per class with subject mapping
- Semester/year progression tracking for students
- Automated course completion percentage
- Student transcript generation
- Course prerequisite management
- Elective selection system

🔮 **Phase 3 Features:**
- Academic calendar integration
- Attendance tracking per course/class
- Grade management system
- Course evaluation surveys
- Alumni management (graduated students)

---

**END OF DOCUMENT**

*Version 2.0 - Comprehensive Implementation Plan*  
*Last Updated: February 5, 2026*