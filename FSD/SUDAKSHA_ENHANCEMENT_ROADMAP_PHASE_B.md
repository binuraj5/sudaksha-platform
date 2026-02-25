# SUDAKSHA ENHANCEMENT ROADMAP — PHASE B
## Next Wave After Phase A Completion
### Builds on Stable Foundation from Phase A

---

## 🎯 PREREQUISITE: PHASE A MUST BE 100% COMPLETE

Before starting Phase B, verify Phase A completion:

```
✅ Wave 1 Complete (Foundation):
   - [x] Task #15: Navigation label changed
   - [x] Task #11: Enrollment/Employee IDs in database
   - [x] Task #12: useTenantLabels hook created

✅ Wave 2 Complete (RLS Extension):
   - [x] Task #9: Dept/Team scoped APIs working
   
✅ Wave 3 Complete (New Pages):
   - [x] Task #2: My Previous Roles page
   - [x] Task #3: My Competencies self-assignment
   - [x] Task #4: Org Hierarchy visualization

✅ Wave 4 Complete (Workflow Enhancement):
   - [x] Task #14: Global rejection UX polished
   - [x] Task #1: Polymorphic approval workflow

✅ Wave 5 Complete (AI Features):
   - [x] Task #10: Intelligent recommendations
   - [x] Task #16: Adaptive AI runtime
   - [x] Task #17: Voice interview runtime
   - [x] Task #18: Video interview processing
   - [x] Task #20: Code test external integration
```

**CRITICAL:** Do NOT proceed to Phase B until ALL Phase A checkboxes are ticked.

---

## PART 1: PHASE B OVERVIEW

### What Phase B Adds

Phase B focuses on **operational improvements** and **user experience enhancements** that build on Phase A's foundation:

1. ✅ **Institution Staff Profile Restrictions** (#6)
2. ✅ **Student Assignment via CSV** (#7)
3. ✅ **Student Experience Level Restrictions** (#5)
4. ✅ **Class/Project Batch Assignment** (#8)

These are **high-priority features** that directly improve the Tanzania Revenue Authority delivery and institution functionality.

---

### Phase B Implementation Order

```
┌──────────────────────────────────────────────────────────┐
│ PHASE B WAVES (10-12 Days Total)                        │
├──────────────────────────────────────────────────────────┤
│ Wave B1 (Days 1-3): Institution Restrictions            │
│   - Task #6: Staff Profile Restrictions                 │
│   - Task #5: Student Experience Level Restrictions      │
│                                                          │
│ Wave B2 (Days 4-6): Batch Operations                    │
│   - Task #7: CSV Assignment Upload                      │
│   - Task #8: Class/Project Batch Assignment             │
│                                                          │
│ Wave B3 (Days 7-10): Advanced Institution Features      │
│   - Task #13: Curriculum Hierarchy (if needed for TRA)  │
│   - Polish and integration testing                      │
│                                                          │
│ Wave B4 (Days 11-12): Post-Launch Prep                  │
│   - Task #24: Basic notification system                 │
│   - Final testing and TRA demo prep                     │
└──────────────────────────────────────────────────────────┘
```

---

## PART 2: DETAILED IMPLEMENTATION PLANS

---

## TASK #6: Institution Staff Profile Restrictions

**Risk:** 🟡 MEDIUM (Modifies existing profile page)  
**Time:** 4-6 hours  
**Impact:** Different profile forms for staff vs students

### Current State

All users (students, employees, dept heads, teachers) see the same full profile form with:
- Career Aspirations
- Current/Aspirational Roles
- Competency Self-Assessment
- Gap Analysis
- Learning Preferences

### Required Change

**Institution Staff** (Dept Heads, Class Teachers) should have a **restricted profile** with ONLY:
- Basic Info (Name, Email, Phone)
- Bio
- Department/Classes they manage
- ❌ NO Career Aspirations
- ❌ NO Role Selection
- ❌ NO Competency Self-Assessment
- ❌ NO Gap Analysis

---

### Implementation

#### Step 1: Add Profile Type Field

**File:** `prisma/schema.prisma`

```prisma
model Member {
  // ... existing fields ...
  
  profileType String @default("FULL")
  // FULL: Students, Employees, B2C
  // RESTRICTED: Institution Staff (Dept Heads, Class Teachers)
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_member_profile_type
```

**Data Migration Script:**
```typescript
// scripts/migrate-staff-profile-types.ts
import { prisma } from '@/lib/prisma';

async function migrateStaffProfiles() {
  // Find all members who are dept heads or class teachers in institutions
  const staff = await prisma.member.findMany({
    where: {
      tenant: { type: 'INSTITUTION' },
      OR: [
        { user: { role: 'DEPT_HEAD_INST' } },
        { user: { role: 'CLASS_TEACHER' } }
      ]
    }
  });
  
  // Set their profile type to RESTRICTED
  await prisma.member.updateMany({
    where: { id: { in: staff.map(s => s.id) } },
    data: { profileType: 'RESTRICTED' }
  });
  
  console.log(`Updated ${staff.length} staff profiles to RESTRICTED`);
}

migrateStaffProfiles();
```

---

#### Step 2: Create Restricted Profile Component

**File:** `components/profile/RestrictedProfileForm.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RestrictedProfileFormProps {
  member: any;
  onSave: (data: any) => Promise<void>;
}

export function RestrictedProfileForm({ member, onSave }: RestrictedProfileFormProps) {
  const [formData, setFormData] = useState({
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    bio: member.bio || ''
  });
  
  const [saving, setSaving] = useState(false);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-none shadow-md bg-white">
        <CardContent className="pt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Staff Profile:</strong> As institution staff, you have a simplified profile.
              Career planning features are available for students only.
            </p>
          </div>
          
          <div>
            <Label>Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label>Phone</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Brief professional bio..."
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-indigo-600">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
```

---

#### Step 3: Update Profile Page to Use Appropriate Form

**File:** `app/assessments/individuals/profile/page.tsx` (or org profile page)

```typescript
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FullProfileForm } from '@/components/profile/FullProfileForm';
import { RestrictedProfileForm } from '@/components/profile/RestrictedProfileForm';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  const member = await prisma.member.findFirst({
    where: { email: user.email },
    include: {
      currentRole: true,
      aspirationalRole: true
    }
  });
  
  // Determine profile type
  const isRestrictedProfile = member?.profileType === 'RESTRICTED' ||
    (user.tenant?.type === 'INSTITUTION' && 
     ['DEPT_HEAD_INST', 'CLASS_TEACHER'].includes(user.role));
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">
          {isRestrictedProfile 
            ? 'Manage your basic information'
            : 'Manage your profile and career preferences'}
        </p>
      </div>
      
      {isRestrictedProfile ? (
        <RestrictedProfileForm member={member} onSave={handleSave} />
      ) : (
        <FullProfileForm member={member} onSave={handleSave} />
      )}
    </div>
  );
}
```

---

### Testing Checklist

- [ ] Institution Dept Head sees restricted profile form
- [ ] Institution Class Teacher sees restricted profile form
- [ ] Institution Student sees full profile form
- [ ] Corporate Dept Head sees full profile form (not restricted)
- [ ] Restricted profile saves name, email, phone, bio only
- [ ] Full profile still works for all other users

---

## TASK #5: Student Experience Level Restrictions

**Risk:** 🟡 MEDIUM (Schema + UI changes)  
**Time:** 4-5 hours  
**Impact:** Students locked to Junior/Middle levels

### Schema Addition

```prisma
model Member {
  // ... existing ...
  
  hasGraduated      Boolean   @default(false)
  graduationDate    DateTime?
  
  // Computed field based on type and graduation
  // Students (not graduated) → JUNIOR/MIDDLE only
  // Students (graduated) → all levels
  // Employees → all levels
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_student_graduation_status
```

---

### UI Implementation

**File:** `components/assessments/ModelBuilder.tsx` (or wherever level selection happens)

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser';

function LevelSelector({ member, value, onChange }: LevelSelectorProps) {
  const { user } = useCurrentUser();
  
  const isStudent = member?.type === 'STUDENT';
  const hasGraduated = member?.hasGraduated;
  const isInstitution = user?.tenant?.type === 'INSTITUTION';
  
  const levels = [
    {
      value: 'JUNIOR',
      label: 'Junior',
      enabled: true,
      tooltip: 'Entry-level proficiency'
    },
    {
      value: 'MIDDLE',
      label: 'Middle',
      enabled: true,
      tooltip: 'Intermediate proficiency'
    },
    {
      value: 'SENIOR',
      label: 'Senior',
      enabled: !isStudent || hasGraduated, // Disabled for current students
      tooltip: isStudent && !hasGraduated
        ? 'Not available for students (requires professional experience)'
        : 'Advanced proficiency'
    },
    {
      value: 'EXPERT',
      label: 'Expert',
      enabled: !isStudent || hasGraduated,
      tooltip: isStudent && !hasGraduated
        ? 'Not available for students (requires significant experience)'
        : 'Expert-level proficiency'
    }
  ];
  
  return (
    <div className="space-y-2">
      <Label>Target Level *</Label>
      {isStudent && !hasGraduated && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
          ⚠️ Senior and Expert levels require professional experience
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {levels.map(level => (
          <button
            key={level.value}
            type="button"
            onClick={() => level.enabled && onChange(level.value)}
            disabled={!level.enabled}
            className={`
              p-3 rounded-lg border-2 transition-all
              ${value === level.value
                ? 'border-indigo-600 bg-indigo-50'
                : level.enabled
                  ? 'border-gray-200 hover:border-indigo-300'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
              }
            `}
            title={level.tooltip}
          >
            <div className="font-medium">{level.label}</div>
            {!level.enabled && (
              <div className="text-xs text-gray-500 mt-1">Locked</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### API Enforcement

**File:** `app/api/assessments/admin/models/route.ts` (POST handler)

```typescript
// In create assessment model API:
if (user.tenant?.type === 'INSTITUTION') {
  // Get target student/member info
  const targetMember = await prisma.member.findFirst({
    where: { id: body.targetMemberId }
  });
  
  if (targetMember?.type === 'STUDENT' && !targetMember.hasGraduated) {
    // Validate level
    if (['SENIOR', 'EXPERT'].includes(body.targetLevel)) {
      return NextResponse.json({
        error: 'Senior and Expert levels are not available for current students',
        allowedLevels: ['JUNIOR', 'MIDDLE']
      }, { status: 400 });
    }
  }
}
```

---

### Testing Checklist

- [ ] Current student sees Junior/Middle enabled
- [ ] Current student sees Senior/Expert grayed out with tooltip
- [ ] Current student cannot select Senior/Expert (UI prevents)
- [ ] API rejects Senior/Expert for current students (backend validation)
- [ ] Graduated student sees all levels enabled
- [ ] Corporate employee sees all levels enabled
- [ ] Institution admin sees warning when creating SENIOR assessment

---

## TASK #7: Student Assignment via CSV Upload

**Risk:** 🟢 LOW (New feature, doesn't modify existing)  
**Time:** 3-4 hours  
**Impact:** Bulk assignment using enrollment numbers

### Implementation

**File:** `app/api/org/[slug]/assessments/assign-csv/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const assessmentModelId = formData.get('assessmentModelId') as string;
  const dueDate = formData.get('dueDate') as string;
  
  if (!file || !assessmentModelId) {
    return NextResponse.json({ error: 'Missing file or model ID' }, { status: 400 });
  }
  
  // Parse CSV
  const text = await file.text();
  const parsed = Papa.parse(text, { header: true });
  
  // Expected columns: enrollmentNumber or email
  const rows = parsed.data as any[];
  
  const results = {
    total: rows.length,
    assigned: 0,
    failed: 0,
    errors: [] as string[]
  };
  
  for (const row of rows) {
    const enrollmentNumber = row.enrollmentNumber || row.enrollment_number || row.enrollment;
    const email = row.email;
    
    if (!enrollmentNumber && !email) {
      results.failed++;
      results.errors.push(`Row missing enrollment number and email`);
      continue;
    }
    
    // Find member
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { enrollmentNumber },
          { email }
        ]
      }
    });
    
    if (!member) {
      results.failed++;
      results.errors.push(`Member not found: ${enrollmentNumber || email}`);
      continue;
    }
    
    // Check if already assigned
    const existing = await prisma.memberAssessment.findFirst({
      where: {
        memberId: member.id,
        assessmentModelId
      }
    });
    
    if (existing) {
      results.failed++;
      results.errors.push(`Already assigned: ${enrollmentNumber || email}`);
      continue;
    }
    
    // Create assignment
    try {
      await prisma.memberAssessment.create({
        data: {
          memberId: member.id,
          assessmentModelId,
          assignmentType: 'ASSIGNED',
          assignedBy: user.id,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'NOT_STARTED'
        }
      });
      
      results.assigned++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to assign to ${enrollmentNumber || email}: ${error.message}`);
    }
  }
  
  return NextResponse.json(results);
}
```

---

### UI Component

**File:** `components/assessments/AssignViaCSVDialog.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AssignViaCSVDialog({ 
  open, 
  onClose, 
  assessmentModelId,
  orgSlug
}: AssignViaCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  async function handleUpload() {
    if (!file) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assessmentModelId', assessmentModelId);
    if (dueDate) formData.append('dueDate', dueDate);
    
    const res = await fetch(`/api/org/${orgSlug}/assessments/assign-csv`, {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    setResults(data);
    setUploading(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Assessment via CSV Upload</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!results ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <strong>CSV Format:</strong> Include columns for <code>enrollmentNumber</code> or <code>email</code>
                <div className="mt-2">
                  <a href="/templates/assignment-upload.csv" download className="text-blue-600 underline">
                    Download Template
                  </a>
                </div>
              </div>
              
              <div>
                <Label>Upload CSV File *</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-indigo-600"
                >
                  {uploading ? 'Uploading...' : 'Upload & Assign'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="text-lg font-semibold">Upload Results</div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold">{results.total}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{results.assigned}</div>
                    <div className="text-sm text-gray-600">Assigned</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded">
                    <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
                
                {results.errors.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Errors:</div>
                    <div className="max-h-48 overflow-y-auto bg-red-50 border border-red-200 rounded p-3">
                      {results.errors.map((err: string, i: number) => (
                        <div key={i} className="text-sm text-red-700 mb-1">• {err}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => { setResults(null); onClose(); }}>
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Testing Checklist

- [ ] CSV upload with enrollment numbers works
- [ ] CSV upload with emails works
- [ ] Mixed CSV (some enrollment, some email) works
- [ ] Shows success count and error count
- [ ] Errors listed clearly (member not found, already assigned, etc.)
- [ ] Template download link works
- [ ] Due date applied correctly

---

## TASK #8: Class/Project Batch Assignment

**Risk:** 🟢 LOW (Extension of existing assign API)  
**Time:** 2-3 hours  
**Impact:** UI for batch assignment

### Implementation

This is mostly a **UI enhancement** since the API already exists (`assign-unit` for institutions, project assignment for corporate).

**File:** `components/assessments/AssignAssessmentDialog.tsx` (ENHANCE EXISTING)

```typescript
// Add batch assignment options to existing dialog

export function AssignAssessmentDialog({ open, onClose, assessmentModel }: Props) {
  const [targetType, setTargetType] = useState<'individual' | 'class' | 'project' | 'csv'>('individual');
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Assessment</DialogTitle>
        </DialogHeader>
        
        <Tabs value={targetType} onValueChange={(v) => setTargetType(v as any)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="class">Entire Class</TabsTrigger>
            <TabsTrigger value="project">Project Team</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual">
            {/* Existing individual assignment UI */}
            <MemberSelector onSelect={handleAssignIndividual} />
          </TabsContent>
          
          <TabsContent value="class">
            <div className="space-y-4">
              <Label>Select Class *</Label>
              <ClassSelector
                onSelect={(classId) => handleAssignClass(classId)}
              />
              <div className="text-sm text-gray-600">
                This will assign to all students in the selected class
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="project">
            <div className="space-y-4">
              <Label>Select Project *</Label>
              <ProjectSelector
                onSelect={(projectId) => handleAssignProject(projectId)}
              />
              <div className="text-sm text-gray-600">
                This will assign to all members in the project team
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="csv">
            <AssignViaCSVUpload assessmentModelId={assessmentModel.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Testing Checklist

- [ ] "Assign to Class" assigns to all students in class
- [ ] "Assign to Project" assigns to all project members
- [ ] CSV upload option works
- [ ] Individual assignment still works
- [ ] Shows count before assigning ("This will assign to 25 students")
- [ ] Confirmation dialog before batch assignment

---

## PART 3: PHASE B TESTING MATRIX

| Task | Corporate Admin | Dept Head (Corp) | Dept Head (Inst) | Class Teacher | Student | B2C |
|------|----------------|------------------|------------------|---------------|---------|-----|
| **#6: Staff Profile Restrictions** |
| Sees full profile | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Sees restricted profile | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Can set career goals | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **#5: Student Level Restrictions** |
| Can select Junior | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Can select Senior | ✓ | ✓ | ✗ (students) | ✗ (students) | ✗ | ✓ |
| Senior grayed out for students | N/A | N/A | ✓ | ✓ | ✓ | N/A |
| **#7: CSV Assignment** |
| Can upload CSV | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Assignment by enrollment number | N/A | N/A | ✓ | ✓ | N/A | N/A |
| Shows success/error counts | ✓ | ✓ | ✓ | ✓ | N/A | N/A |
| **#8: Batch Assignment** |
| Assign to entire project | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Assign to entire class | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |

---

## PART 4: ANTIGRAVITY IMPLEMENTATION PROMPT

```markdown
@SUDAKSHA_ENHANCEMENT_ROADMAP_PHASE_B.md

This is Phase B of enhancements. Phase A MUST be complete before starting.

VERIFY PHASE A COMPLETION:
- Run test matrix from Phase A document
- All tests must PASS
- System must be stable

PHASE B IMPLEMENTATION ORDER:

Wave B1 (Days 1-3): Institution Restrictions
1. Task #6: Staff Profile Restrictions
   - Add profileType to Member schema
   - Create RestrictedProfileForm component
   - Update profile page to show appropriate form
   - Test: Inst staff sees restricted, others see full

2. Task #5: Student Experience Level Restrictions
   - Add hasGraduated to Member schema
   - Create LevelSelector with disabled states
   - Add API validation
   - Test: Current students locked to Junior/Middle

Wave B2 (Days 4-6): Batch Operations
3. Task #7: CSV Assignment Upload
   - Create /api/org/[slug]/assessments/assign-csv
   - Create AssignViaCSVDialog component
   - Test: Upload CSV with enrollment numbers

4. Task #8: Class/Project Batch Assignment
   - Enhance existing AssignAssessmentDialog
   - Add tabs for Individual/Class/Project/CSV
   - Test: Batch assignment to class works

CRITICAL RULES:
- Test EACH task before moving to next
- Use existing components (don't recreate)
- Feature flag all new features
- Verify backward compatibility

Start with Wave B1, Task #6.
Report back after each task.
```

---

## PART 5: SUCCESS CRITERIA

Phase B is complete when:

### Task #6: Staff Profile Restrictions
- [ ] Institution Dept Heads see restricted profile form
- [ ] Institution Class Teachers see restricted profile form
- [ ] Restricted form has only: Name, Email, Phone, Bio
- [ ] Students and employees still see full profile form
- [ ] All existing profile functionality works

### Task #5: Student Level Restrictions
- [ ] Students see Junior/Middle enabled
- [ ] Students see Senior/Expert grayed out
- [ ] Tooltip explains why Senior/Expert disabled
- [ ] API rejects Senior/Expert for students
- [ ] Graduated students see all levels
- [ ] Employees see all levels

### Task #7: CSV Assignment
- [ ] CSV upload accepts enrollment numbers
- [ ] CSV upload accepts emails
- [ ] Shows success count
- [ ] Shows error messages for failures
- [ ] Template download link works
- [ ] Assignments created correctly

### Task #8: Batch Assignment
- [ ] "Assign to Class" button works
- [ ] "Assign to Project" button works
- [ ] Shows count before assigning
- [ ] Confirmation dialog appears
- [ ] All members in class/project get assignment
- [ ] Individual assignment still works

---

**END OF PHASE B ROADMAP**

Phase B builds on Phase A's stable foundation to add operational improvements for institutions and batch operations. After Phase B, you'll be ready for Phase C (Curriculum & Advanced Features) or production deployment with TRA.
