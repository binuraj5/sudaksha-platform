# COMPLETE ASSESSMENT ASSIGNMENT & INDIVIDUAL PAGES
## Comprehensive Implementation Guide
### Consolidates All Previous Discussions into One Actionable Plan

---

## 🎯 OVERVIEW

This document implements:
1. ✅ Assessment assignment logic (Corporate, Institution, B2C)
2. ✅ Individual employee/student pages (My Assessments, Career, Competencies, etc.)
3. ✅ Role-wise and Competency-wise assessment views
4. ✅ Dev Plan fixes
5. ✅ Complete integration across all user types

---

## PART 1: ASSESSMENT ASSIGNMENT ARCHITECTURE

### 1.1 Data Models (Already Exist — Verify)

```prisma
// Corporate/Employee Assignments
model ProjectUserAssessment {
  id                    String   @id @default(uuid()) @db.Uuid
  userId                String   @db.Uuid
  projectAssignmentId   String   @db.Uuid
  
  status                String   @default("NOT_STARTED")
  // NOT_STARTED | IN_PROGRESS | COMPLETED
  
  startedAt             DateTime?
  completedAt           DateTime?
  score                 Decimal?
  
  user                  User     @relation(fields: [userId], references: [id])
  projectAssignment     ProjectAssessmentModel @relation(fields: [projectAssignmentId], references: [id])
  
  @@unique([userId, projectAssignmentId])
  @@index([userId])
  @@index([status])
}

model ProjectAssessmentModel {
  id                String   @id @default(uuid()) @db.Uuid
  projectId         String   @db.Uuid
  assessmentModelId String   @db.Uuid
  
  assignedBy        String   @db.Uuid
  assignedAt        DateTime @default(now())
  dueDate           DateTime?
  isMandatory       Boolean  @default(false)
  
  assignmentLevel   String   // PROJECT | DEPARTMENT | INDIVIDUAL
  departmentId      String?  @db.Uuid
  
  project           Project  @relation(fields: [projectId], references: [id])
  assessmentModel   AssessmentModel @relation(fields: [assessmentModelId], references: [id])
  
  userAssessments   ProjectUserAssessment[]
  
  @@index([projectId])
  @@index([assessmentModelId])
}

// Institution/Student + B2C Assignments
model MemberAssessment {
  id                String   @id @default(uuid()) @db.Uuid
  memberId          String   @db.Uuid
  assessmentModelId String   @db.Uuid
  
  assignmentType    String   // ASSIGNED | SELF_SELECTED
  assignedBy        String?  @db.Uuid
  assignedAt        DateTime @default(now())
  dueDate           DateTime?
  
  status            String   @default("NOT_STARTED")
  startedAt         DateTime?
  completedAt       DateTime?
  score             Decimal?
  
  member            Member   @relation(fields: [memberId], references: [id])
  assessmentModel   AssessmentModel @relation(fields: [assessmentModelId], references: [id])
  
  @@index([memberId])
  @@index([status])
  @@index([assignmentType])
}

// Activity/Project Assignments (Alternative for Institutions)
model ActivityAssessment {
  id                String   @id @default(uuid()) @db.Uuid
  activityId        String   @db.Uuid
  assessmentModelId String   @db.Uuid
  
  assignedBy        String   @db.Uuid
  assignedAt        DateTime @default(now())
  
  activity          Activity @relation(fields: [activityId], references: [id])
  assessmentModel   AssessmentModel @relation(fields: [assessmentModelId], references: [id])
  
  @@unique([activityId, assessmentModelId])
}
```

---

### 1.2 Assignment Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ WHO ASSIGNS                                                 │
├─────────────────────────────────────────────────────────────┤
│ Super Admin        → Anyone, anywhere                       │
│ Tenant Admin       → Anyone in their tenant                 │
│ Department Head    → Anyone in their department             │
│ Team Leader        → Anyone in their team/project           │
│ Class Teacher      → Students in their class                │
│ B2C Individual     → Self-assign from catalog               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ASSIGNMENT TYPES                                            │
├─────────────────────────────────────────────────────────────┤
│ Corporate:                                                  │
│   - Project-level (all users in project)                   │
│   - Department-level (all users in department)             │
│   - Individual (one employee)                              │
│                                                             │
│ Institution:                                                │
│   - Class-level (all students in class)                    │
│   - Department-level (all students in dept)                │
│   - Individual (one student)                               │
│                                                             │
│ B2C:                                                        │
│   - Self-selected (browse & start)                         │
│   - Assigned by admin (via member email)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 2: API IMPLEMENTATION

### 2.1 Corporate Assignment API

**File:** `app/api/clients/[clientId]/assessments/assign/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify user can assign in this tenant
  const canAssign = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 
                     'DEPT_HEAD', 'TEAM_LEAD', 'MANAGER'].includes(user.role);
  
  if (!canAssign) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const body = await req.json();
  const { modelId, targetType, projectId, memberId, dueDate, isMandatory } = body;
  
  // targetType: "PROJECT" | "INDIVIDUAL"
  
  if (targetType === 'PROJECT') {
    // Assign to all users in project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Create project assignment
    const assignment = await prisma.projectAssessmentModel.create({
      data: {
        projectId,
        assessmentModelId: modelId,
        assignedBy: user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        isMandatory: isMandatory || false,
        assignmentLevel: 'PROJECT'
      }
    });
    
    // Create user assessments for all project members
    const userAssessments = await Promise.all(
      project.members.map(member =>
        prisma.projectUserAssessment.create({
          data: {
            userId: member.userId,
            projectAssignmentId: assignment.id,
            status: 'NOT_STARTED'
          }
        })
      )
    );
    
    return NextResponse.json({
      assignment,
      userAssignments: userAssessments.length,
      message: `Assessment assigned to ${userAssessments.length} users in project`
    }, { status: 201 });
  }
  
  if (targetType === 'INDIVIDUAL') {
    // Assign to one member (Member table for institution/B2C)
    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }
    
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    // Create MemberAssessment
    const assignment = await prisma.memberAssessment.create({
      data: {
        memberId,
        assessmentModelId: modelId,
        assignmentType: 'ASSIGNED',
        assignedBy: user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'NOT_STARTED'
      }
    });
    
    return NextResponse.json({
      assignment,
      message: 'Assessment assigned to member'
    }, { status: 201 });
  }
  
  return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
}
```

---

### 2.2 Institution Class Assignment API

**File:** `app/api/org/[slug]/assessments/assign-unit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Assign assessment to all members in an org unit (class/department)
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const { orgUnitId, assessmentModelId, dueDate } = body;
  
  // Get all members in this org unit (and child units recursively)
  async function getMembersInUnit(unitId: string): Promise<string[]> {
    const unit = await prisma.organizationUnit.findUnique({
      where: { id: unitId },
      include: {
        members: true,
        children: true
      }
    });
    
    if (!unit) return [];
    
    const memberIds = unit.members.map(m => m.id);
    
    // Recursively get members from child units
    for (const child of unit.children) {
      const childMembers = await getMembersInUnit(child.id);
      memberIds.push(...childMembers);
    }
    
    return memberIds;
  }
  
  const memberIds = await getMembersInUnit(orgUnitId);
  
  // Filter out students if assessment is SENIOR/EXPERT level
  const model = await prisma.assessmentModel.findUnique({
    where: { id: assessmentModelId }
  });
  
  let eligibleMemberIds = memberIds;
  
  if (model?.targetLevel && ['SENIOR', 'EXPERT'].includes(model.targetLevel)) {
    // Only assign to members who are not students (or are graduated students)
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } }
    });
    
    eligibleMemberIds = members
      .filter(m => m.type !== 'STUDENT' || m.hasGraduated)
      .map(m => m.id);
  }
  
  // Create MemberAssessment for each eligible member
  const assignments = await Promise.all(
    eligibleMemberIds.map(memberId =>
      prisma.memberAssessment.create({
        data: {
          memberId,
          assessmentModelId,
          assignmentType: 'ASSIGNED',
          assignedBy: user.id,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'NOT_STARTED'
        }
      })
    )
  );
  
  return NextResponse.json({
    assigned: assignments.length,
    total: memberIds.length,
    skipped: memberIds.length - assignments.length,
    message: `Assessment assigned to ${assignments.length} members`
  }, { status: 201 });
}
```

---

### 2.3 B2C Self-Select API

**File:** `app/api/individuals/assessments/start/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { modelId } = await req.json();
  
  // Find or create Member for this user (type INDIVIDUAL)
  let member = await prisma.member.findFirst({
    where: {
      email: user.email,
      type: 'INDIVIDUAL'
    }
  });
  
  if (!member) {
    // Create B2C member on first assessment
    member = await prisma.member.create({
      data: {
        name: user.name,
        email: user.email,
        type: 'INDIVIDUAL',
        tenantId: user.tenantId || null // B2C may not have tenant
      }
    });
  }
  
  // Check if already started
  const existing = await prisma.memberAssessment.findFirst({
    where: {
      memberId: member.id,
      assessmentModelId: modelId
    }
  });
  
  if (existing) {
    return NextResponse.json({
      assessmentId: existing.id,
      message: 'Assessment already started',
      alreadyExists: true
    });
  }
  
  // Create self-selected assessment
  const assessment = await prisma.memberAssessment.create({
    data: {
      memberId: member.id,
      assessmentModelId: modelId,
      assignmentType: 'SELF_SELECTED',
      status: 'NOT_STARTED'
    }
  });
  
  return NextResponse.json({
    assessmentId: assessment.id,
    message: 'Assessment started'
  }, { status: 201 });
}
```

---

### 2.4 Browse Available Assessments (B2C)

**File:** `app/api/individuals/assessments/browse/route.ts`

```typescript
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get published, active assessment models
  const models = await prisma.assessmentModel.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { visibility: 'GLOBAL' },
        { visibility: 'ORGANIZATION', tenantId: user.tenantId }
      ]
    },
    include: {
      role: true,
      components: {
        include: {
          competency: true
        }
      }
    },
    orderBy: { publishedAt: 'desc' }
  });
  
  return NextResponse.json({ models });
}
```

---

## PART 3: MY ASSESSMENTS PAGE (UNIFIED FOR ALL USER TYPES)

### 3.1 My Assessments — Main Dashboard

**File:** `app/assessments/individuals/assessments/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface Assessment {
  id: string;
  modelName: string;
  roleName?: string;
  competencies: string[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
  dueDate?: string;
  isMandatory?: boolean;
  assignmentType?: 'ASSIGNED' | 'SELF_SELECTED';
}

export default function MyAssessmentsPage() {
  const { user } = useCurrentUser();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [groupBy, setGroupBy] = useState<'all' | 'role' | 'competency'>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAssessments();
  }, []);
  
  async function fetchAssessments() {
    setLoading(true);
    const res = await fetch('/api/members/me/assessments');
    const data = await res.json();
    setAssessments(data.assessments || []);
    setLoading(false);
  }
  
  // Group assessments by role
  const byRole = assessments.reduce((acc, assessment) => {
    const role = assessment.roleName || 'No Role';
    if (!acc[role]) acc[role] = [];
    acc[role].push(assessment);
    return acc;
  }, {} as Record<string, Assessment[]>);
  
  // Group assessments by competency
  const byCompetency = assessments.reduce((acc, assessment) => {
    assessment.competencies.forEach(comp => {
      if (!acc[comp]) acc[comp] = [];
      acc[comp].push(assessment);
    });
    return acc;
  }, {} as Record<string, Assessment[]>);
  
  const statusColors = {
    NOT_STARTED: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700'
  };
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-gray-500 mt-1">
            Track and complete your assigned assessments
          </p>
        </div>
        
        {/* Browse button for B2C */}
        {user?.tenant?.type === 'B2C' && (
          <Button asChild>
            <Link href="/assessments/individuals/browse">
              Browse Assessments
            </Link>
          </Button>
        )}
      </div>
      
      {/* View Toggle */}
      <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Assessments</TabsTrigger>
          <TabsTrigger value="role">By Role</TabsTrigger>
          <TabsTrigger value="competency">By Competency</TabsTrigger>
        </TabsList>
        
        {/* All Assessments View */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {assessments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No assessments assigned yet.
                {user?.tenant?.type === 'B2C' && (
                  <div className="mt-2">
                    <Link href="/assessments/individuals/browse" className="text-indigo-600 hover:underline">
                      Browse available assessments →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            assessments.map(assessment => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))
          )}
        </TabsContent>
        
        {/* By Role View */}
        <TabsContent value="role" className="space-y-6 mt-6">
          {Object.entries(byRole).map(([role, items]) => (
            <div key={role}>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">{role}</h2>
              <div className="space-y-4">
                {items.map(assessment => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        
        {/* By Competency View */}
        <TabsContent value="competency" className="space-y-6 mt-6">
          {Object.entries(byCompetency).map(([competency, items]) => (
            <div key={competency}>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">{competency}</h2>
              <div className="space-y-4">
                {items.map(assessment => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const statusColors = {
    NOT_STARTED: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700'
  };
  
  const isOverdue = assessment.dueDate && new Date(assessment.dueDate) < new Date() && assessment.status !== 'COMPLETED';
  
  return (
    <Card className={isOverdue ? 'border-red-200 bg-red-50/30' : ''}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{assessment.modelName}</h3>
              {assessment.isMandatory && (
                <Badge className="bg-red-100 text-red-700">Mandatory</Badge>
              )}
              {assessment.assignmentType === 'SELF_SELECTED' && (
                <Badge className="bg-blue-100 text-blue-700">Self-Selected</Badge>
              )}
            </div>
            
            {assessment.roleName && (
              <div className="text-sm text-gray-600 mb-1">
                Role: {assessment.roleName}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 mt-2">
              {assessment.competencies.map(comp => (
                <Badge key={comp} variant="outline" className="text-xs">
                  {comp}
                </Badge>
              ))}
            </div>
            
            {assessment.dueDate && (
              <div className={`text-sm mt-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                Due: {new Date(assessment.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue!)'}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColors[assessment.status]}>
              {assessment.status.replace('_', ' ')}
            </Badge>
            
            {assessment.status === 'COMPLETED' && assessment.score !== undefined && (
              <div className="text-2xl font-bold text-green-600">
                {assessment.score}%
              </div>
            )}
            
            {assessment.status === 'NOT_STARTED' && (
              <Button asChild>
                <Link href={`/assessments/take/${assessment.id}`}>
                  Start Assessment
                </Link>
              </Button>
            )}
            
            {assessment.status === 'IN_PROGRESS' && (
              <Button asChild variant="outline">
                <Link href={`/assessments/take/${assessment.id}`}>
                  Continue
                </Link>
              </Button>
            )}
            
            {assessment.status === 'COMPLETED' && (
              <Button asChild variant="outline">
                <Link href={`/assessments/results/${assessment.id}`}>
                  View Results
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3.2 API: Get My Assessments

**File:** `app/api/members/me/assessments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Determine user type and fetch appropriate assessments
  const isEmployee = user.accountType === 'CLIENT_USER';
  const isMember = ['INSTITUTION', 'B2C', 'INDIVIDUAL'].includes(user.tenant?.type || user.accountType);
  
  let assessments = [];
  
  if (isEmployee) {
    // Corporate employee — get ProjectUserAssessments
    const userAssessments = await prisma.projectUserAssessment.findMany({
      where: { userId: user.id },
      include: {
        projectAssignment: {
          include: {
            assessmentModel: {
              include: {
                role: true,
                components: {
                  include: {
                    competency: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });
    
    assessments = userAssessments.map(ua => ({
      id: ua.id,
      modelName: ua.projectAssignment.assessmentModel.name,
      roleName: ua.projectAssignment.assessmentModel.role?.name,
      competencies: ua.projectAssignment.assessmentModel.components
        .map(c => c.competency.name)
        .filter((v, i, a) => a.indexOf(v) === i), // unique
      status: ua.status,
      score: ua.score ? Number(ua.score) : undefined,
      dueDate: ua.projectAssignment.dueDate?.toISOString(),
      isMandatory: ua.projectAssignment.isMandatory,
      assignmentType: 'ASSIGNED'
    }));
  }
  
  if (isMember) {
    // Student or B2C — get MemberAssessments
    const member = await prisma.member.findFirst({
      where: { email: user.email }
    });
    
    if (member) {
      const memberAssessments = await prisma.memberAssessment.findMany({
        where: { memberId: member.id },
        include: {
          assessmentModel: {
            include: {
              role: true,
              components: {
                include: {
                  competency: true
                }
              }
            }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });
      
      assessments = memberAssessments.map(ma => ({
        id: ma.id,
        modelName: ma.assessmentModel.name,
        roleName: ma.assessmentModel.role?.name,
        competencies: ma.assessmentModel.components
          .map(c => c.competency.name)
          .filter((v, i, a) => a.indexOf(v) === i),
        status: ma.status,
        score: ma.score ? Number(ma.score) : undefined,
        dueDate: ma.dueDate?.toISOString(),
        assignmentType: ma.assignmentType
      }));
    }
  }
  
  return NextResponse.json({ assessments });
}
```

---

## PART 4: MY CAREER PAGE FIX

### 4.1 Fix Profile API to Include Competencies

**File:** `app/api/profile/route.ts`

```typescript
// In GET handler, UPDATE the include:
const member = await prisma.member.findFirst({
  where: { email: user.email },
  include: {
    // CHANGE THESE:
    currentRole: {
      include: {
        competencies: {
          include: {
            competency: true
          }
        }
      }
    },
    aspirationalRole: {
      include: {
        competencies: {
          include: {
            competency: true
          }
        }
      }
    },
    // Keep existing:
    orgUnit: true,
    reportingManager: true,
    // ADD this if not present:
    developmentPlan: true  // If you want to include it here
  }
});
```

---

### 4.2 Fix Dev Plan API

**File:** `app/api/career/plan/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const member = await prisma.member.findFirst({
    where: { email: user.email },
    include: {
      currentRole: {
        include: {
          competencies: { include: { competency: true } }
        }
      },
      aspirationalRole: {
        include: {
          competencies: { include: { competency: true } }
        }
      }
    }
  });
  
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }
  
  // If plan already exists, return it
  if (member.developmentPlan) {
    return NextResponse.json({ plan: member.developmentPlan });
  }
  
  // Otherwise, return null or generate a basic plan
  return NextResponse.json({
    plan: null,
    message: 'No development plan yet. Click "Auto Generate Plan" to create one.'
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const member = await prisma.member.findFirst({
    where: { email: user.email },
    include: {
      currentRole: {
        include: {
          competencies: { include: { competency: true } }
        }
      },
      aspirationalRole: {
        include: {
          competencies: { include: { competency: true } }
        }
      }
    }
  });
  
  if (!member || !member.aspirationalRole) {
    return NextResponse.json({
      error: 'Set your aspirational role in My Details first'
    }, { status: 400 });
  }
  
  // Generate plan using AI or simple gap analysis
  const currentCompetencies = member.currentRole?.competencies.map(rc => rc.competency.name) || [];
  const aspirationalCompetencies = member.aspirationalRole.competencies.map(rc => rc.competency.name);
  
  const gaps = aspirationalCompetencies.filter(comp => !currentCompetencies.includes(comp));
  
  const plan = {
    aspirationalRoleName: member.aspirationalRole.name,
    generatedAt: new Date().toISOString(),
    gaps: gaps.map(gap => ({
      competency: gap,
      priority: 'HIGH',
      currentLevel: 'None',
      targetLevel: 'Junior'
    })),
    actions: gaps.map(gap => ({
      competency: gap,
      action: `Complete assessment for ${gap}`,
      timeline: '1-2 months',
      resources: []
    }))
  };
  
  // Save plan to member
  await prisma.member.update({
    where: { id: member.id },
    data: { developmentPlan: plan }
  });
  
  return NextResponse.json({ plan });
}
```

---

### 4.3 Fix Career Page UI

**File:** `app/assessments/individuals/career/page.tsx` or `app/assessments/org/[slug]/career/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function CareerPage() {
  const [member, setMember] = useState(null);
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  async function fetchData() {
    const profileRes = await fetch('/api/profile');
    const profileData = await profileRes.json();
    setMember(profileData);
    
    const planRes = await fetch('/api/career/plan/generate');
    const planData = await planRes.json();
    setPlan(planData.plan);
  }
  
  async function generatePlan() {
    setGenerating(true);
    const res = await fetch('/api/career/plan/generate', { method: 'POST' });
    const data = await res.json();
    setPlan(data.plan);
    setGenerating(false);
  }
  
  const currentCompetencies = member?.currentRole?.competencies?.map(rc => rc.competency.name) || [];
  const aspirationalCompetencies = member?.aspirationalRole?.competencies?.map(rc => rc.competency.name) || [];
  const gapCount = aspirationalCompetencies.filter(c => !currentCompetencies.includes(c)).length;
  const gapPercentage = aspirationalCompetencies.length > 0
    ? Math.round((gapCount / aspirationalCompetencies.length) * 100)
    : 0;
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Career</h1>
          <p className="text-gray-500 mt-1">Track your career progression</p>
        </div>
        
        <Button
          onClick={generatePlan}
          disabled={generating || !member?.aspirationalRole}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {generating ? 'Generating...' : '✨ Auto Generate Plan'}
        </Button>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Career Profile</TabsTrigger>
          <TabsTrigger value="plan">Dev Plan</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Role */}
            <Card className="border-none shadow-md bg-white">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500 mb-1">Current Role</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {member?.currentRole?.name || 'Not Set'}
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  {member?.currentRole?.description || 'Set your current role in My Details'}
                </p>
                
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Competencies:</div>
                  <div className="flex flex-wrap gap-1">
                    {currentCompetencies.map(comp => (
                      <Badge key={comp} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                    {currentCompetencies.length === 0 && (
                      <span className="text-sm text-gray-500">No competencies</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Aspirational Role */}
            <Card className="border-none shadow-md bg-white">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-500 mb-1">Aspirational Role</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {member?.aspirationalRole?.name || 'Not Set'}
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  {member?.aspirationalRole?.description || 'Set your aspirational role in My Details'}
                </p>
                
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Competencies:</div>
                  <div className="flex flex-wrap gap-1">
                    {aspirationalCompetencies.map(comp => (
                      <Badge key={comp} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                    {aspirationalCompetencies.length === 0 && (
                      <span className="text-sm text-gray-500">No competencies</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Gap Analysis */}
          {member?.aspirationalRole && (
            <Card className="border-none shadow-md bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Competency Gap Analysis</h3>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-indigo-600">
                    {gapPercentage}%
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-700">
                      You need to develop <strong>{gapCount}</strong> competencies
                      to reach your aspirational role.
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${100 - gapPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {100 - gapPercentage}% complete
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Career Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">
                Edit your career profile in My Details page
              </p>
              <Button asChild>
                <Link href="/assessments/individuals/profile">
                  Go to My Details →
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Dev Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          {!plan ? (
            <Card className="border-none shadow-md bg-white">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">
                  {!member?.aspirationalRole
                    ? 'Set your aspirational role in My Details first'
                    : 'Click "Auto Generate Plan" to create your development roadmap'}
                </p>
                {member?.aspirationalRole && (
                  <Button
                    onClick={generatePlan}
                    disabled={generating}
                    className="bg-indigo-600"
                  >
                    {generating ? 'Generating...' : '✨ Generate My Plan'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Development Plan for {plan.aspirationalRoleName}
              </h2>
              
              {/* Gaps */}
              <Card className="border-none shadow-md bg-white">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Competency Gaps</h3>
                  <div className="space-y-3">
                    {plan.gaps?.map((gap, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{gap.competency}</div>
                          <div className="text-sm text-gray-600">
                            Current: {gap.currentLevel} → Target: {gap.targetLevel}
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-700">{gap.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <Card className="border-none shadow-md bg-white">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Recommended Actions</h3>
                  <div className="space-y-3">
                    {plan.actions?.map((action, i) => (
                      <div key={i} className="p-3 border rounded">
                        <div className="font-medium">{action.action}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Timeline: {action.timeline}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <p className="text-gray-500">Org hierarchy visualization coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## PART 5: MY COMPETENCIES PAGE

**File:** `app/assessments/individuals/competencies/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MyCompetenciesPage() {
  const [member, setMember] = useState(null);
  
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(setMember);
  }, []);
  
  // Combine competencies from all roles
  const currentCompetencies = member?.currentRole?.competencies?.map(rc => ({
    ...rc.competency,
    source: 'Current Role',
    level: rc.targetLevel
  })) || [];
  
  const aspirationalCompetencies = member?.aspirationalRole?.competencies?.map(rc => ({
    ...rc.competency,
    source: 'Aspirational Role',
    level: rc.targetLevel
  })) || [];
  
  // TODO: Add previous roles if you implement role history
  
  // Deduplicate by competency ID
  const allCompetencies = [...currentCompetencies, ...aspirationalCompetencies];
  const uniqueCompetencies = Array.from(
    new Map(allCompetencies.map(c => [c.id, c])).values()
  );
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Competencies</h1>
        <p className="text-gray-500 mt-1">
          Competencies from your current and aspirational roles
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueCompetencies.map(comp => (
          <Card key={comp.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{comp.name}</h3>
                <Badge variant="outline">{comp.category}</Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                Target Level: <strong>{comp.level}</strong>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                From: {comp.source}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {uniqueCompetencies.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No competencies yet. Set your current and aspirational roles in My Details.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

## PART 6: TESTING CHECKLIST

### Corporate Employee Flow
- [ ] Admin assigns assessment to project → all project users get ProjectUserAssessment
- [ ] Employee sees assessment in /assessments/individuals/assessments
- [ ] Employee can start assessment
- [ ] Employee can view by Role
- [ ] Employee can view by Competency
- [ ] Completed assessment shows score

### Institution Student Flow
- [ ] Class Teacher assigns to class → all students get MemberAssessment
- [ ] Student sees assessment in dashboard
- [ ] Student can start assessment
- [ ] Assessment filtered by Junior level only

### B2C Individual Flow
- [ ] Individual browses assessments at /browse
- [ ] Individual starts assessment → creates SELF_SELECTED MemberAssessment
- [ ] Individual sees in My Assessments
- [ ] Individual can complete and see results

### Career Page
- [ ] Overview shows current role with competencies
- [ ] Overview shows aspirational role with competencies
- [ ] Gap percentage calculated correctly
- [ ] Dev Plan generates when clicked
- [ ] Dev Plan shows gaps and actions
- [ ] Career Profile tab redirects to My Details

### My Competencies
- [ ] Shows competencies from current role
- [ ] Shows competencies from aspirational role
- [ ] No duplicates
- [ ] Empty state when no roles set

---

## PART 7: ANTIGRAVITY IMPLEMENTATION PROMPT

```markdown
@COMPLETE_ASSESSMENT_ASSIGNMENT_AND_INDIVIDUAL_PAGES.md

This document implements complete assessment assignment logic and individual pages.

PRIORITY ORDER:

Phase 1: Assignment APIs (Days 1-2)
1. Implement Corporate assignment API (2.1)
2. Implement Institution class assignment API (2.2)
3. Implement B2C self-select API (2.3)
4. Implement browse API (2.4)
5. Test each API with Postman/curl

Phase 2: My Assessments Page (Day 3)
6. Implement /api/members/me/assessments (3.2)
7. Implement My Assessments page UI (3.1)
8. Test with all 3 user types (Employee, Student, B2C)

Phase 3: Career Page Fix (Day 4)
9. Fix profile API to include role competencies (4.1)
10. Fix dev plan API GET and POST (4.2)
11. Fix career page UI (4.3)
12. Test overview, dev plan generation

Phase 4: My Competencies (Day 5)
13. Implement My Competencies page (Part 5)
14. Test with current + aspirational roles

CRITICAL RULES:
- Use existing schemas (verify they exist first)
- Reuse existing components (Card, Button, Badge, etc.)
- Test with each user type before moving on
- One phase at a time

Start with Phase 1, Task 1: Corporate assignment API.
Report back after each task.

Begin now.
```

---

**END OF IMPLEMENTATION GUIDE**

This consolidates all assignment logic, individual pages, and career fixes into one complete, testable implementation. Follow the phases in order, test thoroughly, and you'll have a fully working system.
