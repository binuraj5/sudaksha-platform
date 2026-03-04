# ROLE & COMPETENCY MANAGEMENT SYSTEM
## Complete Implementation Guide for the Coding Agent
### Version 1.0 | February 2026

---

## ⚠️ CRITICAL: READ BEFORE WRITING A SINGLE LINE OF CODE

This system **already has** roles and competency pages built for the SuperAdmin.
Your job is NOT to rebuild them. Your job is to:

1. **AUDIT** what exists
2. **EXTEND** existing components with permission/visibility logic
3. **ADD** missing pieces only where gaps exist

**Before anything else, run this audit:**

```bash
# Map all existing role/competency related files
find . -path ./node_modules -prune -o \( \
  -name "*role*" -o -name "*competency*" -o -name "*competencies*" \
\) -type f -print

# Map all user/auth/permission files
find . -path ./node_modules -prune -o \( \
  -name "*auth*" -o -name "*permission*" -o -name "*middleware*" -o -name "*user*" \
\) -type f -print

# Check Prisma schema for existing models
grep -n "^model " prisma/schema.prisma

# Check existing role/tenant enums
grep -n "UserRole\|TenantType\|VisibilityLevel\|ExperienceLevel" prisma/schema.prisma
```

**Report back with all findings before writing any code.**

---

## PART 1: UNDERSTANDING THE SYSTEM

### 1.1 The Two Tenant Types

```
TENANT TYPE 1: CORPORATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Example: TechCorp, Accenture, Infosys

Hierarchy:
  Super Admin (platform-level)
    └── Tenant Admin / Administrator (organization-level)
          └── Department Head (HOD) (department-level)
                └── Team Leader (team-level)

What they do:
  - Hire employees at ALL levels (Junior to Expert)
  - See ALL experience level roles
  - Create assessments for any level
  - Can promote local roles/competencies to global

TENANT TYPE 2: INSTITUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Example: MIT, XLRI, Stanford

Hierarchy:
  Super Admin (platform-level)
    └── Institution Admin (institution-level)
          └── Department Head (department-level)
                └── Class Teacher (class-level)

What they do:
  - Prepare STUDENTS for first jobs (JUNIOR/FRESHER only)
  - ONLY see Junior/Fresher level roles
  - CANNOT create senior/expert assessments
  - Can promote local roles/competencies to global
```

### 1.2 The Visibility Scope Model

```
SCOPE HIERARCHY (widest to narrowest):

GLOBAL
  ↓ (managed by Super Admin)
  Available to ALL tenants on the platform
  Example: "Software Engineer - React" global role

ORGANIZATION
  ↓ (managed by Tenant Admin)
  Available to everyone in this company/institution
  Example: "TechCorp's Java Developer" role

DEPARTMENT
  ↓ (managed by Department Head)
  Available to people in this department
  Example: "Finance Dept Business Analyst" role

TEAM
  ↓ (managed by Team Leader — Corporate)
  Available only to this team
  Example: "QA Team - Automation Tester" role

CLASS
  ↓ (managed by Class Teacher — Institution)
  Logically the "team" for the class teacher; available only to their class(es)
  Example: "Class 10A - Intro to Programming" role
```

### 1.3 Who Can See What (Visibility Matrix)

```
USER              | GLOBAL | ORG | DEPT | TEAM | CLASS | Others
────────────────────────────────────────────────────────────────
Super Admin       | ALL    | ALL | ALL  | ALL  | ALL   | ALL
Tenant Admin      | ALL    | OWN | ALL  | ALL  | ALL   | ✗
Dept Head (HOD)   | ALL    | OWN | OWN  | ALL  | ALL   | ✗
Team Leader       | ALL    | OWN | OWN  | OWN  | ✗     | ✗
Institution Admin | ALL*   | OWN | ALL  | ALL  | ALL   | ✗
Dept Head (Inst)  | ALL*   | OWN | OWN  | ALL  | ALL   | ✗
Class Teacher     | ALL*   | OWN | OWN  | ✗    | OWN   | ✗

* = Institution users see GLOBAL roles but ONLY Junior/Fresher level
TEAM = Corporate narrowest scope; CLASS = Institution narrowest scope (logically the "team" for Class Teacher)
```

### 1.4 Who Can Create What (Creation Matrix)

```
USER              | SCOPE THEY CAN CREATE IN | LEVEL RESTRICTIONS
──────────────────────────────────────────────────────────────────
Super Admin       | GLOBAL, any scope        | None
Tenant Admin      | ORGANIZATION             | None (Corporate)
                  | ORGANIZATION             | Junior/Fresher only (Institution)
Dept Head (Corp)  | DEPARTMENT               | None
Dept Head (Inst)  | DEPARTMENT               | Junior/Fresher only
Team Leader       | TEAM                     | None (Corporate)
Class Teacher     | CLASS                    | Junior/Fresher only (Institution)
                  | (CLASS is logically the "team" for Class Teacher — their class(es))
```

### 1.5 The Global Approval Workflow

```
User creates a role/competency locally
    ↓
User clicks "Submit for Global Review"
    ↓
Status: PENDING_GLOBAL_REVIEW
    ↓
Super Admin receives notification
    ↓
Super Admin reviews: quality, accuracy, uniqueness
    ↓
Decision:
  ✓ APPROVE → role becomes GLOBAL, credit given to creator
  ✗ REJECT  → stays local, user notified with reason
  ✎ REQUEST_CHANGES → user can revise and resubmit
```

---

## PART 2: DATABASE SCHEMA

### 2.1 Schema Changes Needed

**First check what already exists in your schema.**
The following are ADDITIONS only — do not duplicate existing fields.

```prisma
// ============================================================
// CHECK IF THESE ALREADY EXIST — ADD ONLY WHAT IS MISSING
// ============================================================

// Add to Role model (if not present):
model Role {
  // ... existing fields ...

  // Scope & Visibility
  scope              String   @default("GLOBAL")
  // GLOBAL | ORGANIZATION | DEPARTMENT | TEAM | CLASS
  
  tenantId           String?  @db.Uuid
  // null = global role, set = org-specific role
  
  departmentId       String?  @db.Uuid
  // null = org-wide, set = department-specific
  
  teamId             String?  @db.Uuid
  // TEAM scope: team-specific; CLASS scope: class (org unit) id for Institution
  
  createdByUserId    String?  @db.Uuid
  // who created this role
  
  // Experience Level Restriction
  allowedLevels      String[] @default(["JUNIOR","MIDDLE","SENIOR","EXPERT"])
  // Institutions: ["JUNIOR"] only
  
  // Global Approval Workflow
  globalSubmissionStatus  String?
  // null | PENDING | APPROVED | REJECTED | CHANGES_REQUESTED
  
  globalSubmittedBy       String?  @db.Uuid
  globalSubmittedAt       DateTime?
  globalApprovedBy        String?  @db.Uuid
  globalApprovedAt        DateTime?
  globalRejectionReason   String?
  
  // Soft delete
  isActive           Boolean  @default(true)
  deletedAt          DateTime?
  
  // Relations
  tenant             Tenant?  @relation(fields: [tenantId], references: [id])
  createdBy          User?    @relation("RoleCreatedBy", fields: [createdByUserId], references: [id])
  
  @@index([scope])
  @@index([tenantId])
  @@index([globalSubmissionStatus])
}

// Add to Competency model (if not present):
model Competency {
  // ... existing fields ...
  
  // Scope & Visibility (same pattern as Role)
  scope              String   @default("GLOBAL")
  // GLOBAL | ORGANIZATION | DEPARTMENT | TEAM | CLASS
  tenantId           String?  @db.Uuid
  departmentId       String?  @db.Uuid
  teamId             String?  @db.Uuid
  // TEAM scope: team id; CLASS scope: class (org unit) id
  createdByUserId    String?  @db.Uuid
  
  // Experience Level Restriction
  allowedLevels      String[] @default(["JUNIOR","MIDDLE","SENIOR","EXPERT"])
  
  // Global Approval
  globalSubmissionStatus  String?
  globalSubmittedBy       String?  @db.Uuid
  globalSubmittedAt       DateTime?
  globalApprovedBy        String?  @db.Uuid
  globalApprovedAt        DateTime?
  globalRejectionReason   String?
  
  isActive           Boolean  @default(true)
  deletedAt          DateTime?
  
  tenant             Tenant?  @relation(fields: [tenantId], references: [id])
  
  @@index([scope])
  @@index([tenantId])
  @@index([globalSubmissionStatus])
}

// NEW TABLE: Global Approval Requests Queue
model GlobalApprovalRequest {
  id                 String   @id @default(uuid()) @db.Uuid
  
  entityType         String   // ROLE | COMPETENCY
  entityId           String   @db.Uuid
  
  tenantId           String   @db.Uuid
  submittedBy        String   @db.Uuid
  submittedAt        DateTime @default(now())
  
  status             String   @default("PENDING")
  // PENDING | APPROVED | REJECTED | CHANGES_REQUESTED
  
  reviewedBy         String?  @db.Uuid
  reviewedAt         DateTime?
  reviewNotes        String?
  
  // Snapshot of what was submitted (for review)
  entitySnapshot     Json     // Full role/competency data at time of submission
  
  tenant             Tenant   @relation(fields: [tenantId], references: [id])
  submitter          User     @relation("SubmittedApprovals", fields: [submittedBy], references: [id])
  reviewer           User?    @relation("ReviewedApprovals", fields: [reviewedBy], references: [id])
  
  @@index([status])
  @@index([tenantId])
  @@index([entityType, entityId])
}
```

### 2.2 User Model Fields to Verify Exist

```prisma
// Verify these exist on your User model:
model User {
  // Should already exist:
  tenantId           String   @db.Uuid
  role               String   // UserRole enum below
  
  // May need to add:
  departmentId       String?  @db.Uuid
  teamId             String?  @db.Uuid
  classId            String?  @db.Uuid  // Institution: class (org unit) id for Class Teacher
  
  // Relations
  department         Department? @relation(fields: [departmentId], references: [id])
  team               Team?       @relation(fields: [teamId], references: [id])
}

enum UserRole {
  SUPER_ADMIN
  TENANT_ADMIN        // = "Administrator" in Corporate
  DEPARTMENT_HEAD     // = "HOD" in Corporate
  TEAM_LEADER         // = "Team Leader" in Corporate
  INSTITUTION_ADMIN   // = "Admin" in Institution
  DEPT_HEAD_INST      // = "Department Head" in Institution
  CLASS_TEACHER       // = "Class Teacher" in Institution
  MEMBER              // Regular member/candidate
}

enum TenantType {
  CORPORATE
  INSTITUTION
  B2C
}
```

---

## PART 3: PERMISSION UTILITY

### 3.1 Core Permission Helper

**File:** `lib/permissions/role-competency-permissions.ts`

```typescript
// This is the SINGLE SOURCE OF TRUTH for all role/competency permissions.
// Every UI component and API route should use these functions.

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'DEPARTMENT_HEAD'
  | 'TEAM_LEADER'
  | 'INSTITUTION_ADMIN'
  | 'DEPT_HEAD_INST'
  | 'CLASS_TEACHER'
  | 'MEMBER';

export type TenantType = 'CORPORATE' | 'INSTITUTION' | 'B2C';
export type Scope = 'GLOBAL' | 'ORGANIZATION' | 'DEPARTMENT' | 'TEAM' | 'CLASS';
export type ExperienceLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';

export interface UserContext {
  id: string;
  role: UserRole;
  tenantId: string;
  tenantType: TenantType;
  departmentId?: string;
  teamId?: string;
  classId?: string;  // Institution: class (org unit) id for Class Teacher; used when scope is CLASS
}

// ─────────────────────────────────────────
// VISIBILITY: What can this user SEE?
// ─────────────────────────────────────────

export function getVisibleScopes(user: UserContext): Scope[] {
  // Everyone sees GLOBAL
  const scopes: Scope[] = ['GLOBAL'];

  // Org-level and below: see ORGANIZATION scope in their org
  if (['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEADER',
       'INSTITUTION_ADMIN', 'DEPT_HEAD_INST', 'CLASS_TEACHER'].includes(user.role)) {
    scopes.push('ORGANIZATION');
  }

  // Dept-level and below: see DEPARTMENT scope in their dept
  if (['DEPARTMENT_HEAD', 'TEAM_LEADER',
       'DEPT_HEAD_INST', 'CLASS_TEACHER'].includes(user.role)) {
    scopes.push('DEPARTMENT');
  }

  // Team-level (Corporate): see TEAM scope
  if (user.role === 'TEAM_LEADER') {
    scopes.push('TEAM');
  }

  // Class-level (Institution): see CLASS scope (logically the "team" for Class Teacher)
  if (user.role === 'CLASS_TEACHER') {
    scopes.push('CLASS');
  }

  return scopes;
}

// ─────────────────────────────────────────
// EXPERIENCE LEVELS: What levels can this user access?
// ─────────────────────────────────────────

export function getAllowedExperienceLevels(user: UserContext): ExperienceLevel[] {
  // Institution users only see JUNIOR/FRESHER
  if (user.tenantType === 'INSTITUTION') {
    return ['JUNIOR'];
  }

  // Corporate and B2C see all levels
  return ['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'];
}

// ─────────────────────────────────────────
// CREATION: What scope can this user CREATE in?
// ─────────────────────────────────────────

export function getCreatableScope(user: UserContext): Scope | null {
  switch (user.role) {
    case 'SUPER_ADMIN':
      return 'GLOBAL'; // Super admin creates global items

    case 'TENANT_ADMIN':
    case 'INSTITUTION_ADMIN':
      return 'ORGANIZATION';

    case 'DEPARTMENT_HEAD':
    case 'DEPT_HEAD_INST':
      return 'DEPARTMENT';

    case 'TEAM_LEADER':
      return 'TEAM';
    case 'CLASS_TEACHER':
      return 'CLASS';  // Institution: CLASS is logically the "team" for Class Teacher

    case 'MEMBER':
    default:
      return null; // Cannot create
  }
}

// ─────────────────────────────────────────
// ACTIONS: What can this user DO?
// ─────────────────────────────────────────

export interface RoleCompetencyPermissions {
  canView: boolean;
  canCreate: boolean;
  canEditOwn: boolean;       // Edit items they created
  canEditOrg: boolean;       // Edit any org-level item
  canEditGlobal: boolean;    // Only Super Admin
  canDeleteOwn: boolean;
  canDeleteOrg: boolean;
  canDeleteGlobal: boolean;
  canSubmitForGlobal: boolean; // Submit local item for global approval
  canApproveGlobal: boolean;   // Approve global submissions (Super Admin only)
  canPublishToOrg: boolean;    // Make a team/dept item visible org-wide
  creatableScope: Scope | null;
  allowedLevels: ExperienceLevel[];
  visibleScopes: Scope[];
  isInstitution: boolean;
}

export function getRoleCompetencyPermissions(user: UserContext): RoleCompetencyPermissions {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isTenantAdmin = ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
  const isDeptHead = ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role);
  const isNarrowestScope = ['TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role);
  const isInstitution = user.tenantType === 'INSTITUTION';
  const canCreate = !!getCreatableScope(user);

  return {
    canView: true,
    canCreate,
    canEditOwn: canCreate,
    canEditOrg: isSuperAdmin || isTenantAdmin,
    canEditGlobal: isSuperAdmin,
    canDeleteOwn: canCreate,
    canDeleteOrg: isSuperAdmin || isTenantAdmin,
    canDeleteGlobal: isSuperAdmin,
    canSubmitForGlobal: canCreate && !isSuperAdmin,
    canApproveGlobal: isSuperAdmin,
    canPublishToOrg: isSuperAdmin || isTenantAdmin || isDeptHead || isNarrowestScope,
    creatableScope: getCreatableScope(user),
    allowedLevels: getAllowedExperienceLevels(user),
    visibleScopes: getVisibleScopes(user),
    isInstitution,
  };
}

// ─────────────────────────────────────────
// PRISMA FILTER: Build the WHERE clause for queries
// ─────────────────────────────────────────

export function buildRoleVisibilityFilter(user: UserContext) {
  const levelFilter = user.tenantType === 'INSTITUTION'
    ? { allowedLevels: { hasSome: ['JUNIOR'] } }
    : {};

  if (user.role === 'SUPER_ADMIN') {
    return { isActive: true, ...levelFilter };
  }

  return {
    isActive: true,
    ...levelFilter,
    OR: [
      // Global roles
      { scope: 'GLOBAL' },

      // Org-level roles belonging to their tenant
      {
        scope: 'ORGANIZATION',
        tenantId: user.tenantId,
      },

      // Dept-level roles in their department
      ...(user.departmentId ? [{
        scope: 'DEPARTMENT',
        tenantId: user.tenantId,
        departmentId: user.departmentId,
      }] : []),

      // Team-level roles in their team (Corporate)
      ...(user.teamId ? [{
        scope: 'TEAM',
        tenantId: user.tenantId,
        teamId: user.teamId,
      }] : []),

      // Class-level roles in their class (Institution — Class Teacher)
      ...(user.classId ? [{
        scope: 'CLASS',
        tenantId: user.tenantId,
        teamId: user.classId,  // reuse teamId to store class/org unit id when scope is CLASS
      }] : []),
    ],
  };
}

// Same pattern for competencies
export function buildCompetencyVisibilityFilter(user: UserContext) {
  return buildRoleVisibilityFilter(user); // Same logic
}

// ─────────────────────────────────────────
// OWNERSHIP CHECK: Can this user edit/delete this item?
// ─────────────────────────────────────────

export function canUserModifyRole(
  user: UserContext,
  role: { scope: Scope; tenantId?: string; departmentId?: string; teamId?: string; createdByUserId?: string }
): boolean {
  if (user.role === 'SUPER_ADMIN') return true;

  // Global roles: only Super Admin
  if (role.scope === 'GLOBAL') return false;

  // Must be in same tenant
  if (role.tenantId !== user.tenantId) return false;

  // Org scope: Tenant Admin can modify
  if (role.scope === 'ORGANIZATION') {
    return ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
  }

  // Dept scope: Dept head or above in same dept
  if (role.scope === 'DEPARTMENT') {
    const isDeptHead = ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role);
    const isTenantAdmin = ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
    return (isTenantAdmin) ||
      (isDeptHead && role.departmentId === user.departmentId);
  }

  // Team scope (Corporate): Team leader who created it, or dept head above
  if (role.scope === 'TEAM') {
    return role.createdByUserId === user.id ||
      ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST',
       'TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
  }

  // Class scope (Institution): Class Teacher for same class (teamId stores class id), or above
  if (role.scope === 'CLASS') {
    const isSameClass = user.classId && role.teamId === user.classId;
    return (user.role === 'CLASS_TEACHER' && isSameClass) || role.createdByUserId === user.id ||
      ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST',
       'TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
  }

  return false;
}
```

---

## PART 4: API LAYER

### 4.1 Roles API

**File:** `app/api/admin/roles/route.ts`
*(Extend existing file — do not replace)*

```typescript
import { buildRoleVisibilityFilter, getRoleCompetencyPermissions } from '@/lib/permissions/role-competency-permissions';

// GET /api/admin/roles
// Returns roles visible to the current user
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const scope = searchParams.get('scope'); // optional filter
  const level = searchParams.get('level'); // optional filter

  // Build visibility filter using permission utility
  const visibilityFilter = buildRoleVisibilityFilter({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant.type,
    departmentId: user.departmentId,
    teamId: user.teamId,
  });

  const where = {
    ...visibilityFilter,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(scope && { scope }),
    ...(level && { allowedLevels: { hasSome: [level] } }),
  };

  const roles = await prisma.role.findMany({
    where,
    include: {
      competencies: true,
      createdBy: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true } },
    },
    orderBy: [
      { scope: 'asc' }, // GLOBAL first
      { name: 'asc' },
    ],
  });

  // Add permission flags to each role
  const userContext = {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant.type,
    departmentId: user.departmentId,
    teamId: user.teamId,
  };

  const rolesWithPermissions = roles.map(role => ({
    ...role,
    _canEdit: canUserModifyRole(userContext, role),
    _canDelete: canUserModifyRole(userContext, role),
    _canSubmitGlobal: role.scope !== 'GLOBAL' && !role.globalSubmissionStatus,
    _isOwned: role.tenantId === user.tenantId,
  }));

  return NextResponse.json({
    roles: rolesWithPermissions,
    permissions: getRoleCompetencyPermissions(userContext),
  });
}

// POST /api/admin/roles
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userContext = {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant.type,
    departmentId: user.departmentId,
    teamId: user.teamId,
  };

  const permissions = getRoleCompetencyPermissions(userContext);

  if (!permissions.canCreate) {
    return NextResponse.json(
      { error: 'You do not have permission to create roles' },
      { status: 403 }
    );
  }

  const body = await req.json();

  // Force the scope to what the user is allowed to create
  const scope = permissions.creatableScope!;

  // Institution users: enforce Junior only
  if (permissions.isInstitution) {
    body.allowedLevels = ['JUNIOR'];
  }

  const role = await prisma.role.create({
    data: {
      ...body,
      scope,
      tenantId: scope === 'GLOBAL' ? null : user.tenantId,
      departmentId: scope === 'DEPARTMENT' ? user.departmentId : null,
      teamId: scope === 'TEAM' ? user.teamId : null,
      createdByUserId: user.id,
    },
  });

  return NextResponse.json(role, { status: 201 });
}
```

**File:** `app/api/admin/roles/[id]/submit-global/route.ts` *(NEW)*

```typescript
// POST /api/admin/roles/[id]/submit-global
// Submit a local role for global review
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await prisma.role.findUnique({ where: { id: params.id } });
  if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

  // Must be in same tenant
  if (role.tenantId !== user.tenantId && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Cannot submit if already submitted
  if (role.globalSubmissionStatus === 'PENDING') {
    return NextResponse.json({ error: 'Already submitted for review' }, { status: 400 });
  }

  // Update role status
  await prisma.role.update({
    where: { id: params.id },
    data: {
      globalSubmissionStatus: 'PENDING',
      globalSubmittedBy: user.id,
      globalSubmittedAt: new Date(),
    },
  });

  // Create approval request
  await prisma.globalApprovalRequest.create({
    data: {
      entityType: 'ROLE',
      entityId: params.id,
      tenantId: user.tenantId,
      submittedBy: user.id,
      entitySnapshot: role as any,
    },
  });

  return NextResponse.json({ message: 'Role submitted for global review' });
}
```

**File:** `app/api/admin/roles/[id]/approve-global/route.ts` *(NEW)*

```typescript
// POST /api/admin/roles/[id]/approve-global
// Super Admin approves or rejects a global submission
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Super Admin only' }, { status: 403 });
  }

  const { decision, notes } = await req.json();
  // decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'

  if (decision === 'APPROVE') {
    await prisma.role.update({
      where: { id: params.id },
      data: {
        scope: 'GLOBAL',
        tenantId: null, // Global = no tenant
        globalSubmissionStatus: 'APPROVED',
        globalApprovedBy: user.id,
        globalApprovedAt: new Date(),
      },
    });
  } else {
    await prisma.role.update({
      where: { id: params.id },
      data: {
        globalSubmissionStatus: decision === 'REJECT' ? 'REJECTED' : 'CHANGES_REQUESTED',
        globalRejectionReason: notes,
      },
    });
  }

  await prisma.globalApprovalRequest.updateMany({
    where: { entityType: 'ROLE', entityId: params.id, status: 'PENDING' },
    data: {
      status: decision === 'APPROVE' ? 'APPROVED' : decision,
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewNotes: notes,
    },
  });

  return NextResponse.json({ message: `Role ${decision.toLowerCase()}d` });
}
```

---

## PART 5: UI COMPONENTS

### 5.1 Permission-Aware Hook

**File:** `hooks/useRoleCompetencyPermissions.ts`

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser'; // your existing auth hook
import { getRoleCompetencyPermissions, type RoleCompetencyPermissions } from '@/lib/permissions/role-competency-permissions';

export function useRoleCompetencyPermissions(): RoleCompetencyPermissions {
  const { user } = useCurrentUser();

  if (!user) {
    // Return no-permission defaults
    return {
      canView: false, canCreate: false, canEditOwn: false,
      canEditOrg: false, canEditGlobal: false, canDeleteOwn: false,
      canDeleteOrg: false, canDeleteGlobal: false,
      canSubmitForGlobal: false, canApproveGlobal: false,
      canPublishToOrg: false, creatableScope: null,
      allowedLevels: [], visibleScopes: [], isInstitution: false,
    };
  }

  return getRoleCompetencyPermissions({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant?.type || 'CORPORATE',
    departmentId: user.departmentId,
    teamId: user.teamId,
  });
}
```

### 5.2 Roles List Page (Polymorphic)

**File:** `app/assessments/admin/roles/page.tsx`
*(Extend your existing page — add permission awareness)*

```typescript
'use client';

import { useRoleCompetencyPermissions } from '@/hooks/useRoleCompetencyPermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RolesPage() {
  const permissions = useRoleCompetencyPermissions();
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Tab options depend on user's visibility
  const visibleTabs = [
    { value: 'all', label: 'All Roles' },
    { value: 'GLOBAL', label: 'Global', show: true },
    { value: 'ORGANIZATION', label: 'My Organization', show: permissions.visibleScopes.includes('ORGANIZATION') },
    { value: 'DEPARTMENT', label: 'My Department', show: permissions.visibleScopes.includes('DEPARTMENT') },
    { value: 'TEAM', label: 'My Team', show: permissions.visibleScopes.includes('TEAM') },
    { value: 'CLASS', label: 'My Class', show: permissions.visibleScopes.includes('CLASS') },
    { value: 'pending_review', label: '⏳ Pending Review', show: permissions.canApproveGlobal },
  ].filter(t => t.show !== false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          {permissions.isInstitution && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Showing Junior/Fresher roles only (institution mode)
            </p>
          )}
        </div>

        {/* Create button — only shown if user can create */}
        {permissions.canCreate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create {permissions.creatableScope === 'GLOBAL' ? 'Global ' : ''}Role
          </Button>
        )}
      </div>

      {/* Tabs by Scope */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Roles Grid */}
        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles
              .filter(r => activeTab === 'all' || r.scope === activeTab || activeTab === 'pending_review')
              .map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  permissions={permissions}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 5.3 Role Card Component (Polymorphic)

**File:** `components/assessments/RoleCard.tsx`

```typescript
// This single component works for ALL user types.
// The permissions object controls what actions are shown.

interface RoleCardProps {
  role: Role & {
    _canEdit: boolean;
    _canDelete: boolean;
    _canSubmitGlobal: boolean;
    _isOwned: boolean;
  };
  permissions: RoleCompetencyPermissions;
}

export function RoleCard({ role, permissions }: RoleCardProps) {
  const scopeConfig = {
    GLOBAL: { label: 'Global', color: 'bg-blue-100 text-blue-700', icon: '🌐' },
    ORGANIZATION: { label: 'My Org', color: 'bg-green-100 text-green-700', icon: '🏢' },
    DEPARTMENT: { label: 'My Dept', color: 'bg-yellow-100 text-yellow-700', icon: '🏬' },
    TEAM: { label: 'My Team', color: 'bg-purple-100 text-purple-700', icon: '👥' },
    CLASS: { label: 'My Class', color: 'bg-indigo-100 text-indigo-700', icon: '📚' },
  };

  const scopeInfo = scopeConfig[role.scope] || scopeConfig.GLOBAL;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-3">
        {/* Scope Badge */}
        <div className="flex items-center justify-between">
          <Badge className={scopeInfo.color}>
            {scopeInfo.icon} {scopeInfo.label}
          </Badge>

          {/* Global Submission Status Badge */}
          {role.globalSubmissionStatus === 'PENDING' && (
            <Badge className="bg-amber-100 text-amber-700">⏳ Pending Review</Badge>
          )}
          {role.globalSubmissionStatus === 'CHANGES_REQUESTED' && (
            <Badge className="bg-orange-100 text-orange-700">✎ Changes Needed</Badge>
          )}
        </div>

        {/* Role Name */}
        <h3 className="font-semibold text-lg">{role.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>

        {/* Experience Levels */}
        <div className="flex gap-1 flex-wrap">
          {role.allowedLevels?.map(level => (
            <Badge key={level} variant="outline" className="text-xs">
              {level}
            </Badge>
          ))}
        </div>

        {/* Action Buttons — controlled by permissions */}
        <div className="flex gap-2 pt-2 flex-wrap">
          {/* Everyone can view */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/assessments/admin/roles/${role.id}`}>View</Link>
          </Button>

          {/* Edit — only if they own it */}
          {role._canEdit && (
            <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
              Edit
            </Button>
          )}

          {/* Submit for Global — only for non-global owned items */}
          {role._canSubmitGlobal && permissions.canSubmitForGlobal && (
            <Button variant="outline" size="sm"
              className="text-blue-600"
              onClick={() => handleSubmitGlobal(role)}>
              🌐 Go Global
            </Button>
          )}

          {/* Super Admin: Approve/Reject */}
          {permissions.canApproveGlobal && role.globalSubmissionStatus === 'PENDING' && (
            <>
              <Button size="sm" className="bg-green-600"
                onClick={() => handleApprove(role)}>
                ✓ Approve
              </Button>
              <Button size="sm" variant="destructive"
                onClick={() => handleReject(role)}>
                ✗ Reject
              </Button>
            </>
          )}

          {/* Delete — only if they own it */}
          {role._canDelete && (
            <Button variant="destructive" size="sm"
              onClick={() => handleDelete(role)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.4 Create Role Dialog (Polymorphic)

**File:** `components/assessments/CreateRoleDialog.tsx`

```typescript
export function CreateRoleDialog({ onSuccess }: { onSuccess: () => void }) {
  const permissions = useRoleCompetencyPermissions();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            {permissions.creatableScope === 'GLOBAL' && 'Creating a global role visible to all organizations.'}
            {permissions.creatableScope === 'ORGANIZATION' && 'Creating an organization-level role for your company.'}
            {permissions.creatableScope === 'DEPARTMENT' && 'Creating a department-level role for your team.'}
            {permissions.creatableScope === 'TEAM' && 'Creating a team-level role visible to your team.'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div>
            <Label>Role Name *</Label>
            <Input placeholder="e.g., Senior Java Developer" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Brief description of this role..." />
          </div>

          {/* Experience Levels — institutions only see Junior */}
          <div>
            <Label>Experience Levels</Label>
            {permissions.isInstitution ? (
              // Institution: forced to Junior only, shown as read-only
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded border border-amber-200">
                <Badge className="bg-amber-100 text-amber-700">Junior/Fresher</Badge>
                <span className="text-sm text-amber-600">
                  Institutions can only create Junior/Fresher level roles
                </span>
              </div>
            ) : (
              // Corporate: can select any level
              <div className="flex gap-3">
                {['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'].map(level => (
                  <label key={level} className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" defaultChecked value={level} />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Scope info — shown read-only since it's determined by user's role */}
          <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
            <strong>Scope:</strong> This role will be created at{' '}
            <strong>{permissions.creatableScope?.toLowerCase()}</strong> level.
            {permissions.canSubmitForGlobal && (
              <span className="block text-blue-600 mt-1">
                You can submit it for global review after creation.
              </span>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Role</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 5.5 Super Admin: Global Approval Queue

**File:** `app/admin/global-approval/page.tsx` *(NEW — Super Admin only)*

```typescript
// This page is ONLY visible to Super Admin
// Shows all pending global approval requests for roles and competencies

export default function GlobalApprovalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Global Approval Queue</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">⏳ Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">✓ Approved</TabsTrigger>
          <TabsTrigger value="rejected">✗ Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.map(request => (
            <Card key={request.id} className="mb-4">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge>{request.entityType}</Badge>
                    <h3 className="font-semibold text-lg mt-2">
                      {request.entitySnapshot.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.entitySnapshot.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted by: {request.submitter.name} ({request.tenant.name})
                      · {formatDate(request.submittedAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-green-600"
                      onClick={() => handleApprove(request)}>
                      ✓ Approve
                    </Button>
                    <Button variant="outline"
                      onClick={() => handleRequestChanges(request)}>
                      ✎ Request Changes
                    </Button>
                    <Button variant="destructive"
                      onClick={() => handleReject(request)}>
                      ✗ Reject
                    </Button>
                  </div>
                </div>

                {/* Preview what will become global */}
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <strong>Experience Levels:</strong>
                  <div className="flex gap-2 mt-1">
                    {request.entitySnapshot.allowedLevels?.map(l => (
                      <Badge key={l} variant="outline">{l}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## PART 6: IMPLEMENTATION ORDER

### Day 1: Database & Permissions Utility
```
1. Run audit commands (top of this document)
2. Add missing fields to Role and Competency models
3. Create GlobalApprovalRequest table
4. Create lib/permissions/role-competency-permissions.ts
5. Create hooks/useRoleCompetencyPermissions.ts
6. Run: npx prisma migrate dev --name add_scope_and_hierarchy
7. Test: Permission utility with mock users
```

### Day 2: API Layer
```
8. Extend GET /api/admin/roles to use buildRoleVisibilityFilter
9. Extend POST /api/admin/roles to enforce scope + level restrictions
10. Extend GET/POST /api/admin/competencies (same pattern)
11. Create /api/admin/roles/[id]/submit-global
12. Create /api/admin/roles/[id]/approve-global
13. Mirror same endpoints for competencies
14. Test: API returns correct data per user role
```

### Day 3: Role Pages (Non-SuperAdmin)
```
15. Extend existing roles list page with permission awareness
16. Add scope-based tabs (Global / My Org / My Dept / My Team)
17. Add institution warning banner (Junior only)
18. Update Create Role dialog to enforce restrictions
19. Update Role cards to show correct action buttons
20. Test: Corporate Admin vs Institution Admin see different things
```

### Day 4: Competency Pages (Non-SuperAdmin)
```
21. Mirror all role changes for competency pages
22. Same tabs, same restrictions, same dialogs
23. Test: All permission combinations
```

### Day 5: Global Approval Workflow
```
24. Add "Submit for Global Review" button on role/competency cards
25. Create /app/admin/global-approval/page.tsx (Super Admin only)
26. Add approval/rejection workflow
27. Add notification when approved/rejected
28. Test: Full submission → approval → becomes global flow
```

---

## PART 7: TESTING CHECKLIST

### Corporate Admin (TENANT_ADMIN)
- [ ] Sees global roles + all org roles
- [ ] Sees all experience levels (Junior to Expert)
- [ ] Can create ORGANIZATION scope roles
- [ ] Cannot create GLOBAL scope roles
- [ ] Can edit any org-level role in their tenant
- [ ] Can submit roles for global review
- [ ] Cannot approve global submissions

### Department Head (Corporate)
- [ ] Sees global + org + own department roles
- [ ] Sees all experience levels
- [ ] Can create DEPARTMENT scope roles only
- [ ] Cannot create org-level roles
- [ ] Can only edit roles in their department

### Institution Admin
- [ ] Sees global roles BUT ONLY Junior/Fresher ones
- [ ] Cannot see Senior/Expert roles
- [ ] Create dialog forces Junior level only
- [ ] Warning banner shows "Institution mode: Junior only"

### Class Teacher (Institution)
- [ ] Same as Institution Admin but scoped to their class
- [ ] Cannot create department-level roles

### Super Admin
- [ ] Sees everything
- [ ] Sees Global Approval Queue
- [ ] Can approve/reject global submissions
- [ ] Approved roles become visible to all orgs

---

## PART 8: NOTES FOR CODING AGENT

### ✅ REUSE EXISTING:
- All existing UI components (Button, Card, Badge, Dialog, etc.)
- Existing roles list page structure — ADD tabs and permission logic
- Existing role detail page — ADD edit/delete permission checks
- Existing competency pages — MIRROR same changes

### ❌ DO NOT:
- Recreate pages from scratch
- Create new Button/Card/Dialog components
- Change existing API response structure (only ADD to it)
- Remove any existing functionality

### ⚠️ CRITICAL CHECKS BEFORE EACH API:
1. Call `getRoleCompetencyPermissions(userContext)` first
2. Check the relevant permission flag
3. Return 403 if not allowed
4. Apply `buildRoleVisibilityFilter` for all GET queries

### 🏗️ THE POLYMORPHIC PRINCIPLE:
One set of components. One set of pages. Permission object controls visibility.
Never create separate "institution version" and "corporate version" of the same page.
The permission hook handles all differences dynamically.

---

**END OF IMPLEMENTATION GUIDE**

Give this to your coding agent with this prefix:

```
@ROLE_COMPETENCY_MANAGEMENT_SYSTEM.md

BEFORE WRITING ANY CODE:
1. Run all audit commands at the top
2. Report what already exists
3. Confirm your implementation plan matches Part 6 (Implementation Order)

Then implement Day 1 first. Report back after each day.

CRITICAL RULES:
- REUSE existing components (Part 8)
- Use the permission utility as single source of truth (Part 3)
- Apply visibility filters to ALL queries (Part 4)
- Test each user role against checklist (Part 7)
```
