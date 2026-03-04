# DOCUMENT 2: INSTITUTION MODULE REQUIREMENTS
## Implementation Guide for Institution Tenant Features (M5-M8)

**Module Group:** Institution Tenant  
**Total Requirements:** 43  
**User Roles:** Institution Admin (M5), Department Head (M6), Class Teacher (M7), Student (M8)  
**Priority:** HIGH  
**Implementation Order:** 2 of 6 (Implement after Document 1)

---

## 🎯 OVERVIEW

**KEY INSIGHT:** 95% of this module is **REUSE from Document 1 (Corporate)**!

The only differences are:
1. **Labels change** (Employee → Student, Project → Course, Team → Class)
2. **One new feature**: Curriculum hierarchy (M8-11)
3. **Configuration-driven** (same code, different context)

**Time Estimate:** 5 days (vs 15 days for Document 1)

---

## 📊 REQUIREMENT SUMMARY

| Module | Role | Requirements | Reuse from Doc 1 |
|--------|------|--------------|------------------|
| M5 | Institution Admin | 9 | = M1 (100% reuse) |
| M6 | Department Head | 7 | = M2 (100% reuse) |
| M7 | Class Teacher | 8 | = M3 (100% reuse) |
| M8 | Student | 16 | = M4 + Curriculum |
| **TOTAL** | | **43** | **95% reuse** |

---

## 🔄 POLYMORPHIC MAPPING

### Direct Equivalents

| Corporate (M1-M4) | Institution (M5-M8) | Implementation |
|-------------------|---------------------|----------------|
| M1: Corporate Admin | M5: Institution Admin | **Same code** |
| M2: Department Head | M6: Department Head | **Same code** |
| M3: Team Lead | M7: Class Teacher | **Same code** |
| M4: Employee | M8: Student | Same + Curriculum |

### Database Mapping

| Concept | Corporate | Institution | Table | Field |
|---------|-----------|-------------|-------|-------|
| User Type | Employee | Student | `members` | `memberType` |
| Activity | Project | Course | `activities` | `type` |
| Sub-Unit | Team | Class | `organization_units` | `type` |
| Assignment | Project Assignment | Course Enrollment | `activity_assignments` | - |

**Result:** Same tables, same models, different labels!

---

## 🏗️ IMPLEMENTATION STRATEGY

### Phase 1: Dynamic Label System (Day 1)

**Goal:** Make all UI labels adapt to tenant type

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement Dynamic Label System for Institution Support

OBJECTIVE: Enable same codebase to show different labels based on tenant type

STEP 1: Create lib/tenant-labels.ts
───────────────────────────────────────────────────
export type TenantType = 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';

export interface TenantLabels {
  // Members
  member: string;
  memberPlural: string;
  memberCode: string; // "Employee ID" or "Student ID"
  
  // Organization
  orgUnit: string; // "Department"
  subUnit: string; // "Team" or "Class"
  subUnitPlural: string;
  
  // Activities
  activity: string; // "Project" or "Course"
  activityPlural: string;
  activityCode: string; // "Project Code" or "Course Code"
  
  // Roles
  admin: string; // "Corporate Admin" or "Institution Admin"
  subUnitLead: string; // "Team Lead" or "Class Teacher"
  
  // UI Elements
  dashboard: string;
  reports: string;
}

export const TENANT_LABELS: Record<TenantType, TenantLabels> = {
  CORPORATE: {
    member: 'Employee',
    memberPlural: 'Employees',
    memberCode: 'Employee ID',
    orgUnit: 'Department',
    subUnit: 'Team',
    subUnitPlural: 'Teams',
    activity: 'Project',
    activityPlural: 'Projects',
    activityCode: 'Project Code',
    admin: 'Corporate Admin',
    subUnitLead: 'Team Lead',
    dashboard: 'Dashboard',
    reports: 'Reports'
  },
  INSTITUTION: {
    member: 'Student',
    memberPlural: 'Students',
    memberCode: 'Student ID',
    orgUnit: 'Department',
    subUnit: 'Class',
    subUnitPlural: 'Classes',
    activity: 'Course',
    activityPlural: 'Courses',
    activityCode: 'Course Code',
    admin: 'Institution Admin',
    subUnitLead: 'Class Teacher',
    dashboard: 'Dashboard',
    reports: 'Reports'
  },
  SYSTEM: {
    member: 'User',
    memberPlural: 'Users',
    memberCode: 'User ID',
    orgUnit: 'Organization',
    subUnit: 'Group',
    subUnitPlural: 'Groups',
    activity: 'Goal',
    activityPlural: 'Goals',
    activityCode: 'Goal ID',
    admin: 'Administrator',
    subUnitLead: 'Group Lead',
    dashboard: 'Dashboard',
    reports: 'Reports'
  }
};

export function getLabelsForTenant(tenantType: TenantType): TenantLabels {
  return TENANT_LABELS[tenantType];
}
───────────────────────────────────────────────────

STEP 2: Create hooks/useTenantLabels.ts
───────────────────────────────────────────────────
'use client';

import { useTenant } from './useTenant';
import { getLabelsForTenant } from '@/lib/tenant-labels';

export function useTenantLabels() {
  const { tenant } = useTenant();
  
  if (!tenant) {
    return getLabelsForTenant('SYSTEM');
  }
  
  return getLabelsForTenant(tenant.type);
}
───────────────────────────────────────────────────

STEP 3: Update All Components to Use Dynamic Labels
───────────────────────────────────────────────────
Example: app/clients/[clientId]/employees/page.tsx

BEFORE (hardcoded):
  <h1>Employees</h1>
  <Button>Add Employee</Button>

AFTER (dynamic):
  const labels = useTenantLabels();
  <h1>{labels.memberPlural}</h1>
  <Button>Add {labels.member}</Button>

Apply this pattern to ALL components that show labels:
- Navigation items
- Page titles
- Button labels
- Form labels
- Table headers
- Error messages
───────────────────────────────────────────────────

COMPONENTS TO UPDATE:
1. app/clients/[clientId]/employees/page.tsx
2. app/clients/[clientId]/projects/page.tsx
3. app/clients/[clientId]/teams/page.tsx
4. app/clients/[clientId]/departments/page.tsx
5. components/Navigation/* (all navigation components)
6. components/Employees/* (all employee components)
7. components/Projects/* (all project components)
8. components/Teams/* (all team components)
9. All forms and dialogs

VALIDATION:
- Corporate tenant shows "Employees", "Projects", "Teams"
- Institution tenant shows "Students", "Courses", "Classes"
- No hardcoded labels remain in any component

SUCCESS CRITERIA:
✓ lib/tenant-labels.ts created with all label mappings
✓ useTenantLabels() hook created
✓ All components updated to use dynamic labels
✓ Corporate tenant still works (shows original labels)
✓ Institution tenant shows institution-specific labels
✓ No hardcoded "Employee", "Project", "Team" anywhere

Execute autonomously. Report when complete.
```

---

### Phase 2: M8-11 - Curriculum Hierarchy (Days 2-3)

**Goal:** Add curriculum/subject/topic structure for institutions

**NEW FEATURE:** This is the only unique feature for institutions.

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M8-11: Curriculum Hierarchy for Institutions

OBJECTIVE: Add multi-level curriculum structure for educational institutions

BACKGROUND:
Institutions need to organize assessments by:
- Program (e.g., Engineering)
- Department (e.g., Computer Science)
- Subject (e.g., Data Structures)
- Topic (e.g., Binary Trees)

This is ONLY for Institution tenants (tenantType = 'INSTITUTION').

STEP 1: Create Database Schema
───────────────────────────────────────────────────
-- Migration: add_curriculum_hierarchy.sql

CREATE TABLE curriculum_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Hierarchy
  type VARCHAR(20) NOT NULL CHECK (type IN ('PROGRAM', 'DEPARTMENT', 'SUBJECT', 'TOPIC')),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50),
  parent_id UUID REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  path LTREE NOT NULL, -- For efficient hierarchy queries
  level INT NOT NULL, -- 0=Program, 1=Dept, 2=Subject, 3=Topic
  
  -- Content
  description TEXT,
  credits DECIMAL(4,1), -- For subjects
  duration_weeks INT, -- For subjects
  
  -- Metadata
  metadata JSONB, -- { prerequisites: [], difficulty: 'INTERMEDIATE', syllabus_url: '' }
  
  -- Order
  display_order INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_curriculum_nodes_tenant ON curriculum_nodes(tenant_id);
CREATE INDEX idx_curriculum_nodes_parent ON curriculum_nodes(parent_id);
CREATE INDEX idx_curriculum_nodes_path ON curriculum_nodes USING GIST(path);
CREATE INDEX idx_curriculum_nodes_type ON curriculum_nodes(type);

-- Link assessments to curriculum
ALTER TABLE assessment_assignments ADD COLUMN curriculum_node_id UUID REFERENCES curriculum_nodes(id);
CREATE INDEX idx_assessment_assignments_curriculum ON assessment_assignments(curriculum_node_id);

-- Example hierarchy:
-- Engineering (PROGRAM)
--   └─ Computer Science (DEPARTMENT)
--       └─ Data Structures (SUBJECT)
--           ├─ Arrays (TOPIC)
--           ├─ Linked Lists (TOPIC)
--           └─ Trees (TOPIC)
--               ├─ Binary Trees (TOPIC)
--               └─ BST (TOPIC)
───────────────────────────────────────────────────

STEP 2: Create Prisma Model
───────────────────────────────────────────────────
// prisma/schema.prisma

model CurriculumNode {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  type        CurriculumNodeType
  name        String   @db.VarChar(200)
  code        String?  @db.VarChar(50)
  parentId    String?  @map("parent_id") @db.Uuid
  parent      CurriculumNode? @relation("CurriculumHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    CurriculumNode[] @relation("CurriculumHierarchy")
  path        String   @db.LTree
  level       Int
  
  description String?  @db.Text
  credits     Decimal? @db.Decimal(4, 1)
  durationWeeks Int?   @map("duration_weeks")
  
  metadata    Json?
  displayOrder Int     @default(0) @map("display_order")
  isActive    Boolean  @default(true) @map("is_active")
  
  assessmentAssignments AssessmentAssignment[]
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([parentId])
  @@index([path])
  @@index([type])
  @@map("curriculum_nodes")
}

enum CurriculumNodeType {
  PROGRAM
  DEPARTMENT
  SUBJECT
  TOPIC
}
───────────────────────────────────────────────────

STEP 3: Create API Routes
───────────────────────────────────────────────────
// app/api/clients/[clientId]/curriculum/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all curriculum (tree structure)
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Fetch all nodes
    const nodes = await prisma.curriculumNode.findMany({
      where: { tenantId: params.clientId },
      orderBy: [{ level: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }]
    });
    
    // Build tree structure
    const tree = buildTree(nodes);
    
    return NextResponse.json({ tree, flat: nodes });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create curriculum node
export async function POST(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await req.json();
    
    // Calculate level and path
    let level = 0;
    let path = params.clientId;
    
    if (body.parentId) {
      const parent = await prisma.curriculumNode.findUnique({
        where: { id: body.parentId }
      });
      if (parent) {
        level = parent.level + 1;
        path = `${parent.path}.${body.code || body.name.toLowerCase().replace(/\s+/g, '_')}`;
      }
    } else {
      path = `${params.clientId}.${body.code || body.name.toLowerCase().replace(/\s+/g, '_')}`;
    }
    
    const node = await prisma.curriculumNode.create({
      data: {
        tenantId: params.clientId,
        type: body.type,
        name: body.name,
        code: body.code,
        parentId: body.parentId,
        path,
        level,
        description: body.description,
        credits: body.credits,
        durationWeeks: body.durationWeeks,
        metadata: body.metadata,
        displayOrder: body.displayOrder || 0
      }
    });
    
    return NextResponse.json(node);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildTree(nodes: any[]): any[] {
  const map = new Map();
  const roots: any[] = [];
  
  // Create map
  nodes.forEach(node => {
    map.set(node.id, { ...node, children: [] });
  });
  
  // Build tree
  nodes.forEach(node => {
    const item = map.get(node.id);
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(item);
      }
    } else {
      roots.push(item);
    }
  });
  
  return roots;
}

// app/api/clients/[clientId]/curriculum/[nodeId]/route.ts
// GET, PATCH, DELETE for individual nodes
───────────────────────────────────────────────────

STEP 4: Create UI Components
───────────────────────────────────────────────────
// app/clients/[clientId]/curriculum/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { CurriculumTree } from '@/components/Curriculum/CurriculumTree';
import { CreateCurriculumDialog } from '@/components/Curriculum/CreateCurriculumDialog';
import { Button } from '@/components/ui/button';

export default function CurriculumPage({ params }) {
  const { tenant } = useTenant();
  const [curriculum, setCurriculum] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Only show for institutions
  if (tenant?.type !== 'INSTITUTION') {
    return <div>Curriculum is only available for educational institutions.</div>;
  }
  
  useEffect(() => {
    fetchCurriculum();
  }, []);
  
  async function fetchCurriculum() {
    const res = await fetch(`/api/clients/${params.clientId}/curriculum`);
    const data = await res.json();
    setCurriculum(data);
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Curriculum Structure</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          Add Program/Subject/Topic
        </Button>
      </div>
      
      {curriculum && (
        <CurriculumTree 
          nodes={curriculum.tree} 
          onUpdate={fetchCurriculum}
        />
      )}
      
      <CreateCurriculumDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchCurriculum();
          setIsCreateOpen(false);
        }}
        clientId={params.clientId}
      />
    </div>
  );
}

// components/Curriculum/CurriculumTree.tsx
// Renders tree with expand/collapse, drag-and-drop reorder
// Shows: Name, Type badge, Credits, Actions (Edit, Delete, Add Child)

// components/Curriculum/CreateCurriculumDialog.tsx
// Form: Type (dropdown), Name, Code, Parent (tree selector), Description, Credits, Duration
───────────────────────────────────────────────────

STEP 5: Link Assessments to Curriculum
───────────────────────────────────────────────────
When creating assessments in institutions, add curriculum selector:

// components/Assessments/AssignmentWizard.tsx (for institutions)

{tenant.type === 'INSTITUTION' && (
  <div className="form-group">
    <label>Link to Curriculum (Optional)</label>
    <CurriculumSelector
      value={curriculumNodeId}
      onChange={setCurriculumNodeId}
      placeholder="Select subject or topic..."
    />
  </div>
)}

// When student views assessments:
// Show grouped by: Subject → Topic
───────────────────────────────────────────────────

STEP 6: Student View (M8-11)
───────────────────────────────────────────────────
// app/assessments/curriculum/page.tsx (for students)

Shows:
- My Programs/Departments
- Subjects enrolled in
- Topics with assessments
- Progress by subject (% complete)
- Upcoming assessments by topic

Example:
Engineering
  └─ Computer Science
      ├─ Data Structures (75% complete)
      │   ├─ Arrays ✓ (100%)
      │   ├─ Linked Lists ✓ (100%)
      │   └─ Trees (50%)
      │       ├─ Binary Trees ✓ Assessment completed
      │       └─ BST ⏳ Assessment pending
      └─ Algorithms (30% complete)
───────────────────────────────────────────────────

BUSINESS RULES:
- Only Institution tenants can access curriculum
- Assessments can be linked to any level (Subject or Topic typically)
- Students see assessments grouped by curriculum
- Progress tracked per subject and topic
- Curriculum hierarchy max 5 levels deep

VALIDATION:
- Type must be PROGRAM, DEPARTMENT, SUBJECT, or TOPIC
- Parent must exist and be one level above
- Code must be unique within tenant
- Cannot delete node with child nodes or assessments

SUCCESS CRITERIA:
✓ Database schema created
✓ API routes work (CRUD)
✓ Tree UI renders correctly
✓ Can create, edit, delete nodes
✓ Can link assessments to curriculum
✓ Students see curriculum-grouped assessments
✓ Only visible to Institution tenants

Execute autonomously. Report when complete.
```

---

### Phase 3: Navigation Updates (Day 4)

**Goal:** Add "Curriculum" tab to institution navigation

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Add Curriculum Tab to Institution Navigation

OBJECTIVE: Show "Curriculum" menu item ONLY for Institution tenants

UPDATE: lib/navigation-config.ts
───────────────────────────────────────────────────
Add this item to BASE_NAV_ITEMS:

{
  id: 'curriculum',
  icon: BookOpen, // Import from lucide-react
  label: 'Curriculum',
  path: (clientId) => `/clients/${clientId}/curriculum`,
  permission: 'curriculum:read',
  roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD'],
  tenantTypes: ['INSTITUTION'] // NEW: Only show for institutions
}

UPDATE: getNavigationConfig function
───────────────────────────────────────────────────
Filter items by tenant type:

const tenantNavItems = BASE_NAV_ITEMS
  .filter(item => item.roles.includes(user.role))
  .filter(item => !item.tenantTypes || item.tenantTypes.includes(tenant.type))
  .map(item => ({
    ...item,
    label: typeof item.label === 'function' ? item.label(tenant.type) : item.label,
    path: typeof item.path === 'function' ? item.path(tenant.id) : item.path
  }));

SUCCESS CRITERIA:
✓ Corporate tenants do NOT see Curriculum tab
✓ Institution tenants see Curriculum tab between Teams and Assessments
✓ Clicking Curriculum tab navigates to curriculum page
✓ Permission check enforced

Execute autonomously.
```

---

### Phase 4: Testing & Validation (Day 5)

**Goal:** Verify institution features work correctly

**Test Cases:**

```
TEST 1: Create Institution Tenant
──────────────────────────────────
1. Create tenant with type = 'INSTITUTION'
2. Verify navigation shows "Students", "Courses", "Classes"
3. Verify "Curriculum" tab appears

TEST 2: Dynamic Labels
──────────────────────────────────
1. Login as Institution Admin
2. Navigate to "Students" page
3. Verify page title says "Students" not "Employees"
4. Click "Add Student" button
5. Verify form says "Student Details"
6. Check all labels throughout app

TEST 3: Curriculum Hierarchy
──────────────────────────────────
1. Navigate to Curriculum tab
2. Create Program: "Engineering"
3. Create Department: "Computer Science" (under Engineering)
4. Create Subject: "Data Structures" (under CS)
5. Create Topic: "Binary Trees" (under Data Structures)
6. Verify tree displays correctly
7. Edit a node, verify changes save
8. Delete a node, verify it's removed

TEST 4: Curriculum-Linked Assessments
──────────────────────────────────
1. Create an assessment
2. Link to "Data Structures" subject
3. Assign to students
4. Login as student
5. Navigate to assessments
6. Verify assessment shows under "Data Structures"

TEST 5: Corporate Tenant NOT Affected
──────────────────────────────────
1. Login to Corporate tenant
2. Verify still shows "Employees", "Projects", "Teams"
3. Verify NO "Curriculum" tab
4. Verify all features still work

SUCCESS CRITERIA:
✓ All tests pass
✓ Corporate tenants unaffected
✓ Institution tenants see all new features
✓ No errors in console
✓ Mobile responsive
```

---

## 📋 COMPLETE IMPLEMENTATION CHECKLIST

### Day 1: Dynamic Labels ✅
- [ ] Create `lib/tenant-labels.ts`
- [ ] Create `hooks/useTenantLabels.ts`
- [ ] Update all components to use dynamic labels
- [ ] Test: Corporate shows "Employees", Institution shows "Students"

### Day 2-3: Curriculum Hierarchy ✅
- [ ] Create database migration
- [ ] Create Prisma model
- [ ] Create API routes (GET, POST, PATCH, DELETE)
- [ ] Create `app/clients/[clientId]/curriculum/page.tsx`
- [ ] Create `CurriculumTree` component
- [ ] Create `CreateCurriculumDialog` component
- [ ] Link assessments to curriculum
- [ ] Create student curriculum view

### Day 4: Navigation Update ✅
- [ ] Add curriculum item to `lib/navigation-config.ts`
- [ ] Add tenant type filtering
- [ ] Test: Only institutions see Curriculum tab

### Day 5: Testing ✅
- [ ] Create test institution tenant
- [ ] Verify all labels change
- [ ] Test curriculum creation
- [ ] Test assessment linking
- [ ] Verify corporate unaffected

---

## 🎯 EXPECTED RESULTS

### After Implementation

**Corporate Tenant:**
- Dashboard shows "Employees", "Projects", "Teams"
- NO "Curriculum" tab
- All existing features work unchanged

**Institution Tenant:**
- Dashboard shows "Students", "Courses", "Classes"
- HAS "Curriculum" tab
- Can create Program → Dept → Subject → Topic hierarchy
- Can link assessments to subjects/topics
- Students see curriculum-grouped assessments

**Code Base:**
- Zero duplication
- Same components serve both
- Configuration-driven labels
- One new feature (curriculum)

---

## 💡 KEY INSIGHTS

### Why This is Fast (5 Days vs 15)

**95% Reuse:**
- M5 = M1 (zero new code)
- M6 = M2 (zero new code)
- M7 = M3 (zero new code)
- M8 = M4 + one new feature

**What's Actually New:**
- Dynamic label system (1 day)
- Curriculum hierarchy (2 days)
- Navigation update (0.5 day)
- Testing (1 day)

### Proof of Polymorphic Architecture

This module proves the architecture works:
- One codebase
- Two tenant types
- Infinite variations through config
- Minimal custom code for new tenant type

---

## 🚀 READY TO IMPLEMENT

**Sequence:**
1. Ensure Document 1 (Corporate) is 100% complete
2. Implement Day 1 (labels) - this affects existing code
3. Implement Days 2-3 (curriculum) - this is new
4. Implement Day 4 (navigation) - quick update
5. Test thoroughly on Day 5

**Dependencies:**
- ✅ Document 1 must be complete first
- ✅ All Corporate features must work
- ✅ Database, API, UI patterns established

**Next Steps:**
After this document is complete, move to:
- **Document 3: Assessment Module** (M9) - Core product features
- **Document 4: Super Admin Module** (M11-M14) - Approval workflow
- **Document 5: B2C Module** (M15) - Individual users
- **Document 6: Survey Module** (M16-M19) - Survey features

---

END OF DOCUMENT 2
