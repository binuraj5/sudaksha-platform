# SUDAKSHA ENHANCEMENT ROADMAP — PHASE A
## Safe, Incremental Implementation with Zero Breaking Changes
### Priority Tasks: #1, 2, 3, 4, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20

---

## 🎯 CRITICAL PRINCIPLE: ZERO BREAKAGE

**Before implementing ANY enhancement:**
1. ✅ Current system MUST be 100% stable (use SYSTEMATIC_STABILIZATION_ROADMAP.md first)
2. ✅ All existing tests MUST pass
3. ✅ Create feature flags for ALL new features
4. ✅ Implement in isolated branches
5. ✅ Test with ALL user roles before merging

**Safety Mantra:** "If it works today, it must work tomorrow + new feature."

---

## PART 1: IMPLEMENTATION ORDER & DEPENDENCIES

### Wave 1: Foundation (No Feature Changes) — Days 1-2
**Goal:** Safe infrastructure for enhancements

| # | Task | Type | Risk Level | Prerequisite |
|---|------|------|------------|--------------|
| **15** | Navigation label change | UI Text | 🟢 ZERO | None — safest first task |
| **11** | Enrollment/Employee ID fields | Schema | 🟡 LOW | Schema migration only, no logic change |
| **12** | useTenantLabels hook | Infra | 🟢 ZERO | Pure addition, no existing code touched |

**Why this order:** These three have ZERO impact on existing functionality. They're pure additions.

---

### Wave 2: Scoping & Permissions (Extends Existing RLS) — Days 3-5
**Goal:** Tighten existing RLS, no new features yet

| # | Task | Type | Risk Level | Prerequisite |
|---|------|------|------------|--------------|
| **9** | Dept/Team scoped API queries | RLS Extension | 🟡 MEDIUM | Wave 1 complete + RLS already working |

**Why here:** Builds on existing RLS patterns. Tests with same test matrix as roles/competencies.

---

### Wave 3: User-Facing Features (Isolated Pages) — Days 6-10
**Goal:** New pages that don't modify existing flows

| # | Task | Type | Risk Level | Prerequisite |
|---|------|------|------------|--------------|
| **2** | My Previous Roles page | New Page | 🟢 LOW | Wave 2 complete |
| **3** | My Competencies self-assignment | New Page | 🟡 MEDIUM | Wave 2 complete |
| **4** | Org Hierarchy Visualization | New Component | 🟢 LOW | Wave 2 complete |

**Why here:** New isolated pages. Existing career/profile pages unchanged.

---

### Wave 4: Workflow Enhancement (Modifies Existing) — Days 11-15
**Goal:** Enhance existing approval workflow

| # | Task | Type | Risk Level | Prerequisite |
|---|------|------|------------|--------------|
| **14** | Global rejection UX polish | UI Enhancement | 🟡 MEDIUM | Wave 3 complete + existing approval flow stable |
| **1** | Polymorphic approval workflow | Major Feature | 🔴 HIGH | Wave 3 complete + feature flag required |

**Why last in this wave:** Most complex, touches critical approval system.

---

### Wave 5: AI Features (Advanced) — Days 16-25
**Goal:** Advanced assessment types

| # | Task | Type | Risk Level | Prerequisite |
|---|------|------|------------|--------------|
| **10** | Intelligent recommendations | AI Addition | 🟡 MEDIUM | Wave 4 complete |
| **16** | Adaptive AI runtime | Major Feature | 🟡 MEDIUM | Schema exists, add runtime |
| **17** | Voice interview runtime | Major Feature | 🔴 HIGH | Python backend + schema ready |
| **18** | Video interview processing | Major Feature | 🔴 HIGH | External service integration |
| **20** | Code test external integration | Integration | 🟡 MEDIUM | Replace existing sandbox |

**Why last:** Most complex, external dependencies, can fail without breaking core system.

---

## PART 2: DETAILED IMPLEMENTATION PLANS

---

## TASK #15: Navigation Label Change (SAFEST — START HERE)

**Risk:** 🟢 ZERO  
**Time:** 15 minutes  
**Impact:** Label only

### Implementation

**File:** `components/layouts/SuperAdminSidebar.tsx` (or wherever nav is)

```typescript
// BEFORE:
{
  label: "Competency Matrix",
  href: "/admin/competency-matrix",
  icon: Grid3x3Icon
}

// AFTER:
{
  label: "Role Matrix",
  href: "/admin/competency-matrix", // Keep URL same to avoid route changes
  icon: Grid3x3Icon
}
```

### Testing Checklist
- [ ] Super Admin sees "Role Matrix" in sidebar
- [ ] Link still navigates to correct page
- [ ] No console errors
- [ ] No broken links elsewhere

**MERGE IMMEDIATELY** — Zero risk.

---

## TASK #11: Enrollment & Employee ID System

**Risk:** 🟡 LOW (Schema addition, non-breaking)  
**Time:** 2-3 hours  
**Impact:** Database + Display

### Phase 1: Schema Addition

**File:** `prisma/schema.prisma`

```prisma
model Member {
  // ... existing fields ...
  
  // ADD THESE (optional fields, non-breaking):
  enrollmentNumber  String?  @unique // For institutions (students)
  employeeId        String?  @unique // For corporates (employees)
  
  // Composite unique constraint for tenant scoping
  @@unique([tenantId, enrollmentNumber])
  @@unique([tenantId, employeeId])
  @@index([enrollmentNumber])
  @@index([employeeId])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_enrollment_employee_ids
```

**Safety:** Optional fields, no existing data broken.

---

### Phase 2: Display in UI (Read-Only First)

**File:** `components/members/MemberCard.tsx` (or list component)

```typescript
// Add to existing member display (NO removal of existing info):
<div className="flex items-center gap-2">
  <span className="font-medium">{member.name}</span>
  {member.enrollmentNumber && (
    <Badge variant="outline" className="text-xs">
      {member.enrollmentNumber}
    </Badge>
  )}
  {member.employeeId && (
    <Badge variant="outline" className="text-xs">
      {member.employeeId}
    </Badge>
  )}
</div>
```

**Test:**
- [ ] Existing members without IDs display correctly (no broken UI)
- [ ] New members with IDs show badges
- [ ] No layout shifts

---

### Phase 3: Add to Forms (Edit/Create)

**File:** `components/members/MemberForm.tsx`

```typescript
// ADD FIELDS to existing form (don't modify existing):
{user.tenant?.type === 'INSTITUTION' && (
  <div>
    <Label>Enrollment Number (Optional)</Label>
    <Input
      name="enrollmentNumber"
      placeholder="e.g., CS2021001"
      defaultValue={member?.enrollmentNumber || ''}
    />
  </div>
)}

{user.tenant?.type === 'CORPORATE' && (
  <div>
    <Label>Employee ID (Optional)</Label>
    <Input
      name="employeeId"
      placeholder="e.g., EMP12345"
      defaultValue={member?.employeeId || ''}
    />
  </div>
)}
```

**Safety:** Fields are optional, existing flows work without them.

---

### Phase 4: API Update (Backward Compatible)

**File:** `app/api/members/route.ts` (or wherever member create/update is)

```typescript
// In POST/PATCH handler, ADD these fields (don't require):
const { enrollmentNumber, employeeId, ...rest } = body;

await prisma.member.create({
  data: {
    ...rest,
    ...(enrollmentNumber && { enrollmentNumber }), // Only if provided
    ...(employeeId && { employeeId }),             // Only if provided
  }
});
```

**Test:**
- [ ] Create member WITHOUT IDs → works (existing flow)
- [ ] Create member WITH IDs → saves correctly
- [ ] Update member → IDs preserved or updated
- [ ] Duplicate ID detection (unique constraint)

---

### Phase 5: Search Enhancement (Additive Only)

**File:** Search/filter components

```typescript
// ADD to existing search (don't replace):
const searchFilter = {
  OR: [
    { name: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    // NEW — only active if search looks like an ID:
    ...(search.match(/^[A-Z]{2,}\d+/i) ? [
      { enrollmentNumber: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } }
    ] : [])
  ]
};
```

**Test:**
- [ ] Search by name still works
- [ ] Search by email still works
- [ ] Search by enrollment number works (new)
- [ ] Search by employee ID works (new)

---

## TASK #12: useTenantLabels React Hook

**Risk:** 🟢 ZERO (Pure addition)  
**Time:** 1 hour  
**Impact:** Dynamic labels in UI

### Implementation

**File:** `hooks/useTenantLabels.ts` (NEW)

```typescript
'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser'; // Existing hook

interface TenantLabels {
  member: string;        // "Employee" or "Student"
  members: string;       // "Employees" or "Students"
  team: string;          // "Team" or "Class"
  teams: string;         // "Teams" or "Classes"
  teamLeader: string;    // "Team Leader" or "Class Teacher"
  department: string;    // "Department" or "Department"
  project: string;       // "Project" or "Course"
  projects: string;      // "Projects" or "Courses"
}

export function useTenantLabels(): TenantLabels {
  const { user } = useCurrentUser();
  const isInstitution = user?.tenant?.type === 'INSTITUTION';

  return {
    member: isInstitution ? 'Student' : 'Employee',
    members: isInstitution ? 'Students' : 'Employees',
    team: isInstitution ? 'Class' : 'Team',
    teams: isInstitution ? 'Classes' : 'Teams',
    teamLeader: isInstitution ? 'Class Teacher' : 'Team Leader',
    department: 'Department', // Same for both
    project: isInstitution ? 'Course' : 'Project',
    projects: isInstitution ? 'Courses' : 'Projects',
  };
}
```

---

### Usage Example (No Breaking Changes)

**File:** Any client component that needs labels

```typescript
// BEFORE:
<h1>Employees</h1>
<Button>Add Employee</Button>

// AFTER (polymorphic):
import { useTenantLabels } from '@/hooks/useTenantLabels';

const labels = useTenantLabels();

<h1>{labels.members}</h1>
<Button>Add {labels.member}</Button>
```

**Migration Strategy:**
1. Create the hook (doesn't break anything)
2. Gradually update components one by one
3. Keep old hardcoded labels until all migrated
4. NO forced updates — optional enhancement

**Test:**
- [ ] Corporate tenant sees "Employees"
- [ ] Institution tenant sees "Students"
- [ ] Components without hook still work (gradual migration)

---

## TASK #9: Dept Head / Team Lead Scoped API Queries

**Risk:** 🟡 MEDIUM (Modifies existing API filters)  
**Time:** 4-6 hours  
**Impact:** RLS extension

### Implementation Strategy

**Critical Rule:** Extend existing RLS patterns from roles/competencies. DO NOT create new permission system.

---

### Phase 1: Update Permission Utility

**File:** `lib/permissions/role-competency-permissions.ts`

```typescript
// ADD to existing file (don't replace):

// Generic department/team visibility filter builder
export function buildDepartmentFilter(user: UserContext) {
  if (user.role === 'SUPER_ADMIN') return {}; // Sees all
  
  if (['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role)) {
    return { tenantId: user.tenantId }; // Sees all in tenant
  }
  
  if (['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role)) {
    return {
      tenantId: user.tenantId,
      OR: [
        { departmentId: user.departmentId },      // Own department
        { parentDepartmentId: user.departmentId } // Child departments if hierarchy exists
      ]
    };
  }
  
  if (['TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role)) {
    return {
      tenantId: user.tenantId,
      departmentId: user.departmentId,
      teamId: user.teamId // Only their team
    };
  }
  
  return { id: 'never-match' }; // Default: see nothing
}

export function buildTeamFilter(user: UserContext) {
  if (user.role === 'SUPER_ADMIN') return {};
  
  if (['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role)) {
    return { tenantId: user.tenantId };
  }
  
  if (['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role)) {
    return {
      tenantId: user.tenantId,
      departmentId: user.departmentId // All teams in their department
    };
  }
  
  if (['TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role)) {
    return {
      tenantId: user.tenantId,
      teamId: user.teamId // Only their own team
    };
  }
  
  return { id: 'never-match' };
}
```

---

### Phase 2: Apply to Department API

**File:** `app/api/departments/route.ts` (or wherever it exists)

```typescript
// BEFORE (returns all departments):
const departments = await prisma.department.findMany({
  where: { tenantId }
});

// AFTER (scoped by user):
import { buildDepartmentFilter } from '@/lib/permissions/role-competency-permissions';

const user = await getCurrentUser();
const userContext = {
  id: user.id,
  role: user.role,
  tenantId: user.tenantId,
  tenantType: user.tenant?.type || 'CORPORATE',
  departmentId: user.departmentId,
  teamId: user.teamId,
};

const departments = await prisma.department.findMany({
  where: buildDepartmentFilter(userContext),
  include: { teams: true } // If HOD, sees teams in their dept
});
```

---

### Phase 3: Apply to Team API

**File:** `app/api/teams/route.ts`

```typescript
// Same pattern:
const teams = await prisma.team.findMany({
  where: buildTeamFilter(userContext),
  include: { members: true }
});
```

---

### Testing Matrix

| User Role | Department API | Team API | Members in Dept | Members in Team |
|-----------|----------------|----------|-----------------|-----------------|
| Super Admin | ✓ Sees ALL | ✓ Sees ALL | ✓ All | ✓ All |
| Tenant Admin | ✓ All in tenant | ✓ All in tenant | ✓ All in tenant | ✓ All in tenant |
| Dept Head | ✓ Own dept only | ✓ Teams in own dept | ✓ Members in own dept | ✓ Members in dept teams |
| Team Leader | ✗ No dept access | ✓ Own team only | ✗ No dept access | ✓ Members in own team |
| Employee | ✗ No access | ✗ No access | ✗ No access | ✗ No access |

**Verify EACH cell** before declaring done.

---

## TASK #2: My Previous Roles Page

**Risk:** 🟢 LOW (New isolated page)  
**Time:** 3-4 hours  
**Impact:** New page, no existing changes

### Database Schema (Add to Member)

```prisma
model Member {
  // ... existing fields ...
  
  // ADD:
  roleHistory  MemberRoleHistory[]
}

// NEW TABLE:
model MemberRoleHistory {
  id          String   @id @default(uuid()) @db.Uuid
  memberId    String   @db.Uuid
  roleId      String   @db.Uuid
  
  startedAt   DateTime
  endedAt     DateTime?
  isCurrent   Boolean  @default(false)
  
  // Denormalized for historical accuracy (role might change/delete)
  roleName        String
  roleDescription String?
  competencies    Json // Snapshot of competencies at that time
  
  member      Member   @relation(fields: [memberId], references: [id])
  role        Role?    @relation(fields: [roleId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@index([memberId])
  @@index([isCurrent])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_member_role_history
```

---

### Auto-Tracking Logic

**File:** `lib/members/role-history.ts` (NEW)

```typescript
// Called whenever member.currentRoleId changes
export async function trackRoleChange(
  memberId: string,
  newRoleId: string | null,
  oldRoleId: string | null
) {
  if (oldRoleId) {
    // Close previous role
    await prisma.memberRoleHistory.updateMany({
      where: { memberId, isCurrent: true },
      data: { isCurrent: false, endedAt: new Date() }
    });
  }
  
  if (newRoleId) {
    const role = await prisma.role.findUnique({
      where: { id: newRoleId },
      include: { competencies: { include: { competency: true } } }
    });
    
    if (role) {
      await prisma.memberRoleHistory.create({
        data: {
          memberId,
          roleId: newRoleId,
          roleName: role.name,
          roleDescription: role.description,
          competencies: role.competencies, // Snapshot
          startedAt: new Date(),
          isCurrent: true
        }
      });
    }
  }
}
```

---

### Hook into Member Update

**File:** `app/api/members/[id]/route.ts` (PATCH handler)

```typescript
// AFTER updating member, IF currentRoleId changed:
if (body.currentRoleId !== existingMember.currentRoleId) {
  await trackRoleChange(
    params.id,
    body.currentRoleId,
    existingMember.currentRoleId
  );
}
```

**Safety:** Optional tracking. If it fails, member update still succeeds.

---

### UI Page

**File:** `app/assessments/individuals/previous-roles/page.tsx` (NEW)

```typescript
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function PreviousRolesPage() {
  const user = await getCurrentUser();
  
  // Get member by email
  const member = await prisma.member.findFirst({
    where: { email: user.email },
    include: {
      roleHistory: {
        orderBy: { startedAt: 'desc' },
        include: { role: true }
      }
    }
  });
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Previous Roles</h1>
        <p className="text-gray-500 mt-1">Your role history and transitions</p>
      </div>
      
      <div className="space-y-4">
        {member?.roleHistory.map(history => (
          <Card key={history.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{history.roleName}</h3>
                  <p className="text-sm text-gray-600">{history.roleDescription}</p>
                  
                  {history.isCurrent && (
                    <Badge className="mt-2 bg-green-100 text-green-700">Current Role</Badge>
                  )}
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <div>{formatDate(history.startedAt)}</div>
                  {history.endedAt && (
                    <div>to {formatDate(history.endedAt)}</div>
                  )}
                  {!history.endedAt && history.isCurrent && (
                    <div>to Present</div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700">Competencies at that time:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(history.competencies as any[])?.map((comp, i) => (
                    <Badge key={i} variant="outline">{comp.competency?.name}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!member?.roleHistory?.length && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No role history yet. Your role changes will appear here.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

### Update Navigation

**File:** Sidebar/nav component

```typescript
// Change existing "My Previous Roles" link from career to:
{
  label: "My Previous Roles",
  href: "/assessments/individuals/previous-roles", // NEW dedicated page
  icon: HistoryIcon
}
```

**Test:**
- [ ] Page loads without errors
- [ ] Shows current role with "Current" badge
- [ ] Shows past roles with date ranges
- [ ] Empty state when no history
- [ ] Competencies snapshot displayed

---

## TASK #3: My Competencies — Self-Assignment

**Risk:** 🟡 MEDIUM (New page + new data model)  
**Time:** 6-8 hours  
**Impact:** New self-assignment flow, separate from role-based

### Database Schema

```prisma
model Member {
  // ... existing ...
  selfAssignedCompetencies MemberCompetency[]
}

// NEW TABLE (separate from role-based competencies):
model MemberCompetency {
  id            String   @id @default(uuid()) @db.Uuid
  memberId      String   @db.Uuid
  competencyId  String   @db.Uuid
  
  source        String   // "ROLE_BASED" | "SELF_ASSIGNED"
  targetLevel   String?  // JUNIOR | MIDDLE | SENIOR | EXPERT
  
  assignedAt    DateTime @default(now())
  lastAssessedAt DateTime?
  currentScore   Decimal? // Latest assessment score
  
  member        Member      @relation(fields: [memberId], references: [id])
  competency    Competency  @relation(fields: [competencyId], references: [id])
  
  @@unique([memberId, competencyId, source])
  @@index([memberId])
  @@index([source])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_member_competency_self_assignment
```

---

### API Endpoint

**File:** `app/api/members/me/competencies/route.ts` (NEW)

```typescript
// GET — list my competencies (role-based + self-assigned)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  
  const member = await prisma.member.findFirst({
    where: { email: user.email },
    include: {
      currentRole: {
        include: {
          competencies: {
            include: { competency: true }
          }
        }
      },
      selfAssignedCompetencies: {
        where: { source: 'SELF_ASSIGNED' },
        include: { competency: true }
      }
    }
  });
  
  // Combine and dedupe
  const roleBased = member?.currentRole?.competencies.map(rc => ({
    ...rc.competency,
    source: 'ROLE_BASED',
    targetLevel: rc.targetLevel
  })) || [];
  
  const selfAssigned = member?.selfAssignedCompetencies.map(mc => ({
    ...mc.competency,
    source: 'SELF_ASSIGNED',
    targetLevel: mc.targetLevel,
    currentScore: mc.currentScore
  })) || [];
  
  return NextResponse.json({
    roleBased,
    selfAssigned,
    total: roleBased.length + selfAssigned.length
  });
}

// POST — self-assign a competency
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const { competencyId, targetLevel } = await req.json();
  
  const member = await prisma.member.findFirst({
    where: { email: user.email }
  });
  
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }
  
  // Check if already assigned
  const existing = await prisma.memberCompetency.findUnique({
    where: {
      memberId_competencyId_source: {
        memberId: member.id,
        competencyId,
        source: 'SELF_ASSIGNED'
      }
    }
  });
  
  if (existing) {
    return NextResponse.json({ error: 'Already assigned' }, { status: 400 });
  }
  
  const assignment = await prisma.memberCompetency.create({
    data: {
      memberId: member.id,
      competencyId,
      source: 'SELF_ASSIGNED',
      targetLevel
    },
    include: { competency: true }
  });
  
  return NextResponse.json(assignment, { status: 201 });
}

// DELETE — remove self-assigned competency
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const competencyId = searchParams.get('competencyId');
  
  const member = await prisma.member.findFirst({
    where: { email: user.email }
  });
  
  await prisma.memberCompetency.deleteMany({
    where: {
      memberId: member.id,
      competencyId,
      source: 'SELF_ASSIGNED' // Can only remove self-assigned, not role-based
    }
  });
  
  return NextResponse.json({ success: true });
}
```

---

### UI Page

**File:** `app/assessments/individuals/my-competencies/page.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function MyCompetenciesPage() {
  const [competencies, setCompetencies] = useState({ roleBased: [], selfAssigned: [] });
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  useEffect(() => {
    fetch('/api/members/me/competencies')
      .then(r => r.json())
      .then(setCompetencies);
  }, []);
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Competencies</h1>
          <p className="text-gray-500 mt-1">From your role and self-assigned</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          + Assign Competency
        </Button>
      </div>
      
      {/* Role-Based Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">From My Current Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competencies.roleBased.map(comp => (
            <Card key={comp.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{comp.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {comp.targetLevel}
                    </Badge>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Role-Based</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Self-Assigned Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Self-Assigned</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competencies.selfAssigned.map(comp => (
            <Card key={comp.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{comp.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {comp.targetLevel}
                    </Badge>
                    {comp.currentScore && (
                      <div className="text-sm text-gray-600 mt-1">
                        Last Score: {comp.currentScore}%
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(comp.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!competencies.selfAssigned.length && (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No self-assigned competencies yet. Click "Assign Competency" to add.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Dialog */}
      <AddCompetencyDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={() => {
          setShowAddDialog(false);
          // Refresh list
        }}
      />
    </div>
  );
}
```

**Test:**
- [ ] Role-based competencies show from current role
- [ ] Can self-assign new competencies
- [ ] Cannot assign duplicates
- [ ] Can remove self-assigned (not role-based)
- [ ] Scores update when assessments taken

---

## TASK #4: Org Hierarchy Visualization

**Risk:** 🟢 LOW (New component, replace placeholder)  
**Time:** 4-6 hours  
**Impact:** Visual tree, no data changes

### Implementation

**File:** `components/career/OrgHierarchyTree.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface OrgNode {
  id: string;
  name: string;
  type: 'DEPARTMENT' | 'TEAM' | 'MEMBER';
  children?: OrgNode[];
  member?: { name: string; role?: string };
}

export function OrgHierarchyTree({ tenantId }: { tenantId: string }) {
  const [tree, setTree] = useState<OrgNode | null>(null);
  
  useEffect(() => {
    fetch(`/api/org/hierarchy?tenantId=${tenantId}`)
      .then(r => r.json())
      .then(setTree);
  }, [tenantId]);
  
  if (!tree) return <div>Loading org hierarchy...</div>;
  
  return (
    <div className="relative">
      <TreeNode node={tree} level={0} />
    </div>
  );
}

function TreeNode({ node, level }: { node: OrgNode; level: number }) {
  const [expanded, setExpanded] = useState(level < 2); // Expand first 2 levels
  
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ marginLeft: level * 24 }}
      >
        {node.children?.length > 0 && (
          <span className="text-gray-400">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        
        <div>
          <div className="font-medium">{node.name}</div>
          {node.type === 'MEMBER' && node.member?.role && (
            <div className="text-xs text-gray-500">{node.member.role}</div>
          )}
        </div>
        
        <Badge variant={
          node.type === 'DEPARTMENT' ? 'default' :
          node.type === 'TEAM' ? 'secondary' : 'outline'
        }>
          {node.type}
        </Badge>
      </div>
      
      {expanded && node.children?.map(child => (
        <TreeNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
}
```

---

### API Endpoint

**File:** `app/api/org/hierarchy/route.ts` (NEW)

```typescript
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || user.tenantId;
  
  // Build hierarchy tree
  const departments = await prisma.department.findMany({
    where: { tenantId },
    include: {
      teams: {
        include: {
          members: {
            include: { currentRole: true }
          }
        }
      }
    }
  });
  
  // Convert to tree structure
  const tree: OrgNode = {
    id: tenantId,
    name: user.tenant.name,
    type: 'DEPARTMENT',
    children: departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      type: 'DEPARTMENT',
      children: dept.teams.map(team => ({
        id: team.id,
        name: team.name,
        type: 'TEAM',
        children: team.members.map(member => ({
          id: member.id,
          name: member.name,
          type: 'MEMBER',
          member: {
            name: member.name,
            role: member.currentRole?.name
          }
        }))
      }))
    }))
  };
  
  return NextResponse.json(tree);
}
```

---

### Replace Placeholder

**File:** `app/assessments/individuals/career/page.tsx`

```typescript
// REPLACE the "Coming soon" placeholder with:
<OrgHierarchyTree tenantId={user.tenantId} />
```

**Test:**
- [ ] Tree loads and displays
- [ ] Can expand/collapse nodes
- [ ] Shows departments → teams → members
- [ ] Displays member roles
- [ ] No errors on empty org

---

## PART 3: SAFETY PROTOCOLS

### Protocol 1: Feature Flags

**File:** `lib/feature-flags.ts` (NEW)

```typescript
export const FEATURES = {
  ENROLLMENT_IDS: true,           // Task #11
  TENANT_LABELS_HOOK: true,       // Task #12
  DEPT_TEAM_SCOPING: false,       // Task #9 — test first
  PREVIOUS_ROLES_PAGE: false,     // Task #2 — test first
  SELF_ASSIGN_COMPETENCIES: false,// Task #3 — test first
  ORG_HIERARCHY: false,           // Task #4 — test first
  POLYMORPHIC_APPROVAL: false,    // Task #1 — high risk
  INTELLIGENT_RECS: false,        // Task #10
  ADAPTIVE_AI_RUNTIME: false,     // Task #16
  VOICE_INTERVIEW: false,         // Task #17
  VIDEO_INTERVIEW: false,         // Task #18
  CODE_EXTERNAL: false,           // Task #20
} as const;

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  // Can also check user role, tenant, etc.
  return FEATURES[feature];
}
```

**Usage:**
```typescript
// In any component/API:
import { isFeatureEnabled } from '@/lib/feature-flags';

if (!isFeatureEnabled('DEPT_TEAM_SCOPING')) {
  // Use old logic
  return allDepartments;
}

// Use new scoped logic
return scopedDepartments;
```

---

### Protocol 2: Automated Testing Before Merge

**File:** `.github/workflows/enhancement-tests.yml` (if using GitHub Actions)

```yaml
name: Enhancement Safety Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx prisma generate
      
      # Critical tests that must pass:
      - run: npm run test:roles
      - run: npm run test:competencies
      - run: npm run test:models
      - run: npm run test:rls
      
      # If any fail, block merge
```

---

### Protocol 3: Rollback Plan

**File:** `ROLLBACK_PROCEDURES.md` (NEW)

```markdown
# Immediate Rollback Steps

If enhancement breaks production:

1. **Identify Breaking Change**
   ```bash
   git log --oneline -20
   # Find the enhancement commit
   ```

2. **Disable Feature Flag**
   ```typescript
   // lib/feature-flags.ts
   DEPT_TEAM_SCOPING: false, // Turn OFF immediately
   ```

3. **Revert Database Migration** (if needed)
   ```bash
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

4. **Git Revert** (last resort)
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

5. **Notify Team**
   - Post in Slack: "Feature X disabled due to [issue]"
   - Create incident ticket
   - Schedule fix

## Prevention
- Always use feature flags
- Test on staging first
- Gradual rollout (10% → 50% → 100%)
```

---

## PART 4: ANTIGRAVITY INSTRUCTIONS

```markdown
@SUDAKSHA_ENHANCEMENT_ROADMAP_PHASE_A.md

You are implementing high-priority enhancements to a STABLE, PRODUCTION system.

CRITICAL RULES:
1. NEVER break existing functionality
2. Work ONE task at a time (follow Wave order)
3. Use feature flags for ALL new features
4. Test with ALL user roles before merging
5. Each task is a separate branch + PR

CURRENT PRIORITY WAVE:
Wave 1 - Foundation (Days 1-2)
- Task #15: Navigation label (15 min) ← START HERE
- Task #11: Enrollment IDs (2-3 hours)
- Task #12: Tenant labels hook (1 hour)

INSTRUCTIONS:

STEP 1: Task #15 (Navigation Label)
- Find SuperAdminSidebar component
- Change "Competency Matrix" → "Role Matrix"
- Test: Label changes, link works, no errors
- Report: PASS/FAIL

STEP 2: Task #11 (Enrollment IDs)
- Phase 1: Schema migration (optional fields)
- Phase 2: Display in UI (non-breaking)
- Phase 3: Add to forms (optional fields)
- Phase 4: API update (backward compatible)
- Phase 5: Search enhancement (additive)
- Test EACH phase before next
- Report: Results

STEP 3: Task #12 (Tenant Labels Hook)
- Create hook (pure addition)
- Test hook returns correct labels
- DO NOT migrate existing components yet
- Report: Hook created and tested

AFTER Wave 1 complete (all 3 tasks PASS):
Ask: "Wave 1 complete. Ready for Wave 2 (Task #9 - RLS scoping)? (y/n)"

DO NOT proceed to Wave 2 until Wave 1 is 100% tested and confirmed working.

Begin with Task #15 now.
```

---

## PART 5: TESTING CHECKLIST PER TASK

### Task #15: Navigation Label
- [ ] Super Admin sidebar shows "Role Matrix"
- [ ] Link navigates correctly
- [ ] No console errors
- [ ] No other sidebar items broken

### Task #11: Enrollment/Employee IDs
- [ ] Schema migration successful
- [ ] Existing members display correctly (no IDs)
- [ ] New members with IDs show badges
- [ ] Create member without IDs works (existing flow)
- [ ] Create member with IDs saves correctly
- [ ] Search by enrollment number works
- [ ] Search by employee ID works
- [ ] Duplicate ID rejected (unique constraint)
- [ ] Corporate sees "Employee ID" field
- [ ] Institution sees "Enrollment Number" field

### Task #12: Tenant Labels Hook
- [ ] Hook returns correct labels for Corporate
- [ ] Hook returns correct labels for Institution
- [ ] Components without hook still work
- [ ] No breaking changes to existing components

### Task #9: Dept/Team Scoped APIs
- [ ] Super Admin sees all departments
- [ ] Tenant Admin sees all in tenant
- [ ] Dept Head sees ONLY own department
- [ ] Team Leader sees ONLY own team
- [ ] Employee sees nothing (or error)
- [ ] Same for Teams API
- [ ] All existing functionality still works

---

**END OF PHASE A ENHANCEMENT ROADMAP**

This roadmap ensures safe, incremental implementation of priority features without breaking the stable system. Use feature flags, test thoroughly, and work one wave at a time. 🚀
