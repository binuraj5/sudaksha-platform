# ROLES & COMPETENCIES – POLYMORPHIC UI WITH RLS
## Extend SuperAdmin pages to all tenant users. Same UI, scoped permissions.

---

## ⚠️ MANDATORY FIRST STEP — AUDIT BEFORE YOU TOUCH ANYTHING

Run every command below. Report findings before writing a single line of code.

```bash
# 1. Read the SuperAdmin roles page (source of truth for UI)
cat app/assessments/admin/roles/page.tsx

# 2. Read the SuperAdmin competencies page
cat app/assessments/admin/competencies/page.tsx

# 3. Read the existing client roles page
cat "app/assessments/clients/[clientId]/roles/page.tsx"

# 4. Read the existing client competencies page
cat "app/assessments/clients/[clientId]/competencies/page.tsx"

# 5. Find every component the SuperAdmin roles page imports
grep -n "^import" app/assessments/admin/roles/page.tsx
grep -n "^import" app/assessments/admin/competencies/page.tsx

# 6. Find every API route used by the SuperAdmin pages
grep -rn "fetch\|api/admin/roles\|api/admin/competencies\|api/assessments" \
  app/assessments/admin/roles/page.tsx \
  app/assessments/admin/competencies/page.tsx

# 7. Find the API route handlers
find app/api -name "route.ts" | xargs grep -l "roles\|competencies" 2>/dev/null

# 8. Read the Prisma schema for Role and Competency models
grep -A 40 "^model Role " prisma/schema.prisma
grep -A 40 "^model Competency " prisma/schema.prisma

# 9. Read the current user/auth structure
grep -A 20 "^model User " prisma/schema.prisma
grep -rn "getCurrentUser\|getServerSession\|useCurrentUser\|useSession" \
  lib/ app/api/admin/ --include="*.ts" -l

# 10. Find if scope/tenantId/departmentId fields already exist on Role
grep -n "scope\|tenantId\|departmentId\|teamId\|jurisdiction\|visibility\|allowedLevels" \
  prisma/schema.prisma

# 11. Check what the existing client role API does
find app/api -path "*clients*roles*" -name "route.ts" | xargs cat 2>/dev/null
find app/api -path "*clients*competencies*" -name "route.ts" | xargs cat 2>/dev/null
```

**After running these, report:**
- Exact file paths of all existing role/competency components
- Whether scope/tenantId/departmentId/allowedLevels already exist on Role model
- Whether getCurrentUser returns tenantId, departmentId, teamId, tenantType
- What the client roles page currently shows vs what the admin roles page shows

---

## PART 1: WHAT WE ARE BUILDING — THE CORE CONCEPT

### The Problem Today

```
SuperAdmin routes:               Tenant routes (client):
━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━
/assessments/admin/roles         /assessments/clients/[clientId]/roles
/assessments/admin/competencies  /assessments/clients/[clientId]/competencies

These are COMPLETELY DIFFERENT pages.
The client pages are limited shells.
The admin pages have full functionality.
```

### The Goal

```
Make the CLIENT pages render the EXACT SAME UI as the ADMIN pages.
The difference is only what data is shown and what actions are allowed.

Same components. Same layout. Same forms. Same cards.
Different data scope. Different action permissions.
```

### The Mental Model

```
Think of it as a TV remote with some buttons locked:

SuperAdmin remote:        Corporate Admin remote:   Institution Admin remote:
━━━━━━━━━━━━━━━━━━━━      ━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━
[Create Global Role]  →   [Create Org Role]     →   [Create Junior Role ONLY]
[Edit Any Role]       →   [Edit Own Org Roles]  →   [Edit Own Junior Roles]
[Delete Any Role]     →   [Delete Own Roles]    →   [Delete Own Junior Roles]
[Approve Requests]    →   [Submit for Global]   →   [Submit for Global]
[See All Scopes]      →   [See Global + Org]    →   [See Global(Junior) + Own]

Same remote body. Different buttons active.
```

---

## PART 2: DATA STRUCTURE

### 2.1 Fields to Add to Role Model (check first — add only if missing)

```prisma
model Role {
  // ── all your existing fields stay unchanged ──

  // ADD THESE if not present:
  scope              String   @default("GLOBAL")
  // Values: "GLOBAL" | "ORGANIZATION" | "DEPARTMENT" | "TEAM"

  tenantId           String?  @db.Uuid
  // null for GLOBAL roles, set for org/dept/team roles

  departmentId       String?  @db.Uuid
  // set only for DEPARTMENT and TEAM scoped roles

  teamId             String?  @db.Uuid
  // set only for TEAM scoped roles

  createdByUserId    String?  @db.Uuid
  // tracks who created this role

  allowedLevels      String[] @default(["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"])
  // Institution users: always ["JUNIOR"]
  // Corporate users: any combination

  globalSubmitStatus String?
  // null | "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED"

  globalSubmittedBy  String?  @db.Uuid
  globalSubmittedAt  DateTime?
  globalReviewedBy   String?  @db.Uuid
  globalReviewedAt   DateTime?
  globalReviewNotes  String?

  isActive           Boolean  @default(true)

  // Relations (add only if not present)
  tenant             Tenant?  @relation(fields: [tenantId], references: [id])
  createdBy          User?    @relation("RoleCreator", fields: [createdByUserId], references: [id])

  @@index([scope])
  @@index([tenantId])
  @@index([globalSubmitStatus])
}
```

### 2.2 Same fields for Competency model

Apply the **exact same additions** to the `Competency` model:
`scope`, `tenantId`, `departmentId`, `teamId`, `createdByUserId`,
`allowedLevels`, `globalSubmitStatus`, `globalSubmittedBy`, `globalSubmittedAt`,
`globalReviewedBy`, `globalReviewedAt`, `globalReviewNotes`, `isActive`

### 2.3 New table: GlobalApprovalRequest

```prisma
model GlobalApprovalRequest {
  id             String   @id @default(uuid()) @db.Uuid
  entityType     String   // "ROLE" | "COMPETENCY"
  entityId       String   @db.Uuid
  tenantId       String   @db.Uuid
  submittedBy    String   @db.Uuid
  submittedAt    DateTime @default(now())
  status         String   @default("PENDING")
  reviewedBy     String?  @db.Uuid
  reviewedAt     DateTime?
  reviewNotes    String?
  entitySnapshot Json     // snapshot of the role/competency at submission time

  tenant         Tenant   @relation(fields: [tenantId], references: [id])

  @@index([status])
  @@index([entityType, entityId])
}
```

### 2.4 Check User model has these fields

```prisma
// Verify User model has:
model User {
  // Must exist already:
  tenantId       String   @db.Uuid
  role           String   // UserRole enum

  // Add if missing:
  departmentId   String?  @db.Uuid
  teamId         String?  @db.Uuid
}
```

---

## PART 3: PERMISSION UTILITY — SINGLE SOURCE OF TRUTH

**Create this file: `lib/permissions/role-competency-permissions.ts`**

This is the ONE file that decides all permissions everywhere.
Every API and every UI component reads from this.
Never duplicate permission logic in components.

```typescript
export type Scope = 'GLOBAL' | 'ORGANIZATION' | 'DEPARTMENT' | 'TEAM';
export type Level = 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
export type TenantType = 'CORPORATE' | 'INSTITUTION' | 'B2C';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'        // Corporate: Administrator
  | 'DEPARTMENT_HEAD'     // Corporate: HOD
  | 'TEAM_LEADER'         // Corporate: Team Leader
  | 'INSTITUTION_ADMIN'   // Institution: Admin
  | 'DEPT_HEAD_INST'      // Institution: Department Head
  | 'CLASS_TEACHER'       // Institution: Class Teacher
  | 'MEMBER';

export interface UserContext {
  id: string;
  role: UserRole;
  tenantId: string;
  tenantType: TenantType;
  departmentId?: string | null;
  teamId?: string | null;
}

// What this user can CREATE
export function getCreatableScope(user: UserContext): Scope | null {
  switch (user.role) {
    case 'SUPER_ADMIN':        return 'GLOBAL';
    case 'TENANT_ADMIN':
    case 'INSTITUTION_ADMIN':  return 'ORGANIZATION';
    case 'DEPARTMENT_HEAD':
    case 'DEPT_HEAD_INST':     return 'DEPARTMENT';
    case 'TEAM_LEADER':
    case 'CLASS_TEACHER':      return 'TEAM';
    default:                   return null;
  }
}

// What experience levels this user can work with
export function getAllowedLevels(user: UserContext): Level[] {
  if (user.tenantType === 'INSTITUTION') return ['JUNIOR'];
  return ['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'];
}

// What scopes this user can SEE (tabs shown)
export function getVisibleScopes(user: UserContext): Scope[] {
  if (user.role === 'SUPER_ADMIN') return ['GLOBAL', 'ORGANIZATION', 'DEPARTMENT', 'TEAM'];
  const scopes: Scope[] = ['GLOBAL', 'ORGANIZATION'];
  if (['DEPARTMENT_HEAD', 'TEAM_LEADER', 'DEPT_HEAD_INST', 'CLASS_TEACHER'].includes(user.role)) {
    scopes.push('DEPARTMENT');
  }
  if (['TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role)) {
    scopes.push('TEAM');
  }
  return scopes;
}

// Can this user modify THIS specific role/competency?
export function canModify(
  user: UserContext,
  item: { scope: Scope; tenantId?: string | null; departmentId?: string | null; teamId?: string | null; createdByUserId?: string | null }
): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  if (item.scope === 'GLOBAL') return false; // Only SuperAdmin edits global
  if (item.tenantId !== user.tenantId) return false; // Must be same org

  if (item.scope === 'ORGANIZATION') {
    return ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
  }
  if (item.scope === 'DEPARTMENT') {
    const isTenantAdmin = ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(user.role);
    const isDeptHead = ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role);
    return isTenantAdmin || (isDeptHead && item.departmentId === user.departmentId);
  }
  if (item.scope === 'TEAM') {
    // Team leaders can edit their team's roles; HOD and above can too
    const isAbovTeamLevel = ['TENANT_ADMIN', 'INSTITUTION_ADMIN',
                             'DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role);
    const isTeamLeaderOwner = ['TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role)
                              && item.teamId === user.teamId;
    return isAbovTeamLevel || isTeamLeaderOwner;
  }
  return false;
}

// Full permission object — pass this to components as a prop
export interface Permissions {
  canCreate: boolean;
  canSubmitForGlobal: boolean;  // Submit own role to SuperAdmin for global approval
  canApproveGlobal: boolean;    // SuperAdmin only
  creatableScope: Scope | null;
  allowedLevels: Level[];
  visibleScopes: Scope[];
  isInstitution: boolean;
  isSuperAdmin: boolean;
  canModify: (item: { scope: Scope; tenantId?: string | null; departmentId?: string | null; teamId?: string | null; createdByUserId?: string | null }) => boolean;
}

export function getPermissions(user: UserContext): Permissions {
  const creatableScope = getCreatableScope(user);
  return {
    canCreate: creatableScope !== null,
    canSubmitForGlobal: creatableScope !== null && user.role !== 'SUPER_ADMIN',
    canApproveGlobal: user.role === 'SUPER_ADMIN',
    creatableScope,
    allowedLevels: getAllowedLevels(user),
    visibleScopes: getVisibleScopes(user),
    isInstitution: user.tenantType === 'INSTITUTION',
    isSuperAdmin: user.role === 'SUPER_ADMIN',
    canModify: (item) => canModify(user, item),
  };
}

// Prisma WHERE clause — call this in every GET handler
export function buildVisibilityFilter(user: UserContext) {
  const levelFilter = user.tenantType === 'INSTITUTION'
    ? { allowedLevels: { hasSome: ['JUNIOR'] } }
    : {};

  if (user.role === 'SUPER_ADMIN') {
    return { isActive: true, ...levelFilter };
  }

  const scopeFilters: object[] = [
    // Always see GLOBAL
    { scope: 'GLOBAL', ...levelFilter },
    // Always see their own org
    { scope: 'ORGANIZATION', tenantId: user.tenantId, ...levelFilter },
  ];

  // HOD sees their dept (including team-level roles in their dept)
  if (user.departmentId && ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST',
                             'TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role)) {
    scopeFilters.push({ scope: 'DEPARTMENT', tenantId: user.tenantId,
                        departmentId: user.departmentId, ...levelFilter });
  }

  // Team leader sees their team
  if (user.teamId && ['TEAM_LEADER', 'CLASS_TEACHER'].includes(user.role)) {
    scopeFilters.push({ scope: 'TEAM', tenantId: user.tenantId,
                        teamId: user.teamId, ...levelFilter });
  }

  // HOD also sees all team-level roles within their department
  if (user.departmentId && ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(user.role)) {
    scopeFilters.push({ scope: 'TEAM', tenantId: user.tenantId,
                        departmentId: user.departmentId, ...levelFilter });
  }

  return { isActive: true, OR: scopeFilters };
}
```

---

## PART 4: HOOK TO USE IN CLIENT COMPONENTS

**Create: `hooks/usePermissions.ts`**

```typescript
'use client';
import { useEffect, useState } from 'react';
import { getPermissions, type Permissions, type UserContext } from '@/lib/permissions/role-competency-permissions';

export function usePermissions(): Permissions | null {
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    // Replace this with however you currently get the user in client components
    // e.g. useSession(), useCurrentUser(), etc.
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(user => {
        if (user) {
          setPermissions(getPermissions({
            id: user.id,
            role: user.role,
            tenantId: user.tenantId,
            tenantType: user.tenant?.type || 'CORPORATE',
            departmentId: user.departmentId,
            teamId: user.teamId,
          }));
        }
      });
  }, []);

  return permissions;
}
```

---

## PART 5: API CHANGES

### 5.1 SuperAdmin Roles API — Add RLS to existing handler

**File: `app/api/admin/roles/route.ts`** (or wherever it lives — find it in your audit)
**Action: EXTEND the existing GET and POST handlers. Do NOT replace them.**

```typescript
// ADD this import at top
import { buildVisibilityFilter, getPermissions, getCreatableScope, getAllowedLevels }
  from '@/lib/permissions/role-competency-permissions';

// EXTEND the existing GET handler — find the prisma.role.findMany call
// and replace its `where` clause with this:

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(); // your existing auth call
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userCtx = {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant?.type || 'CORPORATE',
    departmentId: user.departmentId,
    teamId: user.teamId,
  };

  // This is the ONLY change to the GET handler — replace the where clause
  const where = {
    ...buildVisibilityFilter(userCtx),
    // Keep any existing search/filter params from query string
  };

  const roles = await prisma.role.findMany({
    where,
    include: { /* keep your existing includes */ },
    orderBy: [{ scope: 'asc' }, { name: 'asc' }],
  });

  // Annotate each role with permission flags for the UI
  const permissions = getPermissions(userCtx);
  const annotated = roles.map(role => ({
    ...role,
    _permissions: {
      canEdit:         permissions.canModify(role),
      canDelete:       permissions.canModify(role),
      canSubmitGlobal: permissions.canSubmitForGlobal
                       && role.scope !== 'GLOBAL'
                       && !role.globalSubmitStatus,
      canApprove:      permissions.canApproveGlobal
                       && role.globalSubmitStatus === 'PENDING',
    },
  }));

  return NextResponse.json({ roles: annotated, permissions });
}

// EXTEND the existing POST handler — add scope enforcement after auth check:
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userCtx = {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    tenantType: user.tenant?.type || 'CORPORATE',
    departmentId: user.departmentId,
    teamId: user.teamId,
  };

  const creatableScope = getCreatableScope(userCtx);
  if (!creatableScope) {
    return NextResponse.json({ error: 'No permission to create roles' }, { status: 403 });
  }

  const body = await req.json();

  // Force scope to what user is allowed — ignore whatever scope the client sent
  const forcedScope = creatableScope;
  const forcedTenantId = forcedScope === 'GLOBAL' ? null : user.tenantId;
  const forcedDeptId   = ['DEPARTMENT', 'TEAM'].includes(forcedScope) ? user.departmentId : null;
  const forcedTeamId   = forcedScope === 'TEAM' ? user.teamId : null;

  // Institution users: force Junior only
  const allowedLevels = userCtx.tenantType === 'INSTITUTION'
    ? ['JUNIOR']
    : (body.allowedLevels || ['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']);

  // Keep everything else from the body (name, description, competencies, etc.)
  const role = await prisma.role.create({
    data: {
      ...body,                          // all the fields from the SuperAdmin form
      scope:          forcedScope,      // override scope
      tenantId:       forcedTenantId,   // override tenant
      departmentId:   forcedDeptId,     // override dept
      teamId:         forcedTeamId,     // override team
      createdByUserId: user.id,
      allowedLevels,
    },
  });

  return NextResponse.json(role, { status: 201 });
}
```

### 5.2 New endpoint: Submit for Global Review

**Create: `app/api/admin/roles/[id]/submit-global/route.ts`**

```typescript
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await prisma.role.findUnique({ where: { id: params.id } });
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (role.tenantId !== user.tenantId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (role.globalSubmitStatus === 'PENDING')
    return NextResponse.json({ error: 'Already pending review' }, { status: 400 });

  await prisma.$transaction([
    prisma.role.update({
      where: { id: params.id },
      data: {
        globalSubmitStatus: 'PENDING',
        globalSubmittedBy: user.id,
        globalSubmittedAt: new Date(),
      },
    }),
    prisma.globalApprovalRequest.create({
      data: {
        entityType: 'ROLE',
        entityId: params.id,
        tenantId: user.tenantId,
        submittedBy: user.id,
        entitySnapshot: role as any,
      },
    }),
  ]);

  return NextResponse.json({ message: 'Submitted for global review' });
}
```

### 5.3 New endpoint: Approve / Reject Global (SuperAdmin only)

**Create: `app/api/admin/roles/[id]/review-global/route.ts`**

```typescript
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (user.role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Super Admin only' }, { status: 403 });

  const { decision, notes } = await req.json();
  // decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'

  await prisma.$transaction([
    prisma.role.update({
      where: { id: params.id },
      data: decision === 'APPROVE'
        ? { scope: 'GLOBAL', tenantId: null, departmentId: null, teamId: null,
            globalSubmitStatus: 'APPROVED', globalReviewedBy: user.id,
            globalReviewedAt: new Date() }
        : { globalSubmitStatus: decision === 'REJECT' ? 'REJECTED' : 'CHANGES_REQUESTED',
            globalReviewNotes: notes, globalReviewedBy: user.id,
            globalReviewedAt: new Date() },
    }),
    prisma.globalApprovalRequest.updateMany({
      where: { entityType: 'ROLE', entityId: params.id, status: 'PENDING' },
      data: { status: decision === 'APPROVE' ? 'APPROVED' : decision,
              reviewedBy: user.id, reviewedAt: new Date(), reviewNotes: notes },
    }),
  ]);

  return NextResponse.json({ message: `Role ${decision.toLowerCase()}d` });
}
```

### 5.4 Mirror all of the above for Competencies

Repeat sections 5.1, 5.2, 5.3 for competencies:
- `app/api/admin/competencies/route.ts` — same GET and POST changes
- `app/api/admin/competencies/[id]/submit-global/route.ts`
- `app/api/admin/competencies/[id]/review-global/route.ts`

---

## PART 6: CLIENT PAGES — POINT THEM AT THE ADMIN COMPONENTS

This is the key step. The client pages currently render their own limited UI.
We replace their content with the exact same components the admin pages use.

### 6.1 Client Roles Page

**File: `app/assessments/clients/[clientId]/roles/page.tsx`**
**Action: REPLACE the page content (not the file) to delegate to admin components**

```typescript
// app/assessments/clients/[clientId]/roles/page.tsx

// The goal: render exactly what /assessments/admin/roles renders,
// but the API now returns scoped data based on who is logged in.
// So we just render the same page component.

// OPTION A — if the admin roles page is a server component that fetches its own data:
// Import and render it directly, or extract its content into a shared component.

// OPTION B — simpler: just redirect to the admin route for the same user session.
// The admin route's API now scopes data to the logged-in user automatically.

// RECOMMENDED APPROACH:
// 1. Extract the roles page body into a shared component: components/roles/RolesPageContent.tsx
// 2. Both /admin/roles and /clients/[clientId]/roles render that same component
// 3. The component fetches from the same API, which returns scoped data

export default function ClientRolesPage({ params }: { params: { clientId: string } }) {
  // Just render the same component — data is scoped at API level
  return <RolesPageContent />;
  // RolesPageContent is extracted from the current admin/roles/page.tsx
}
```

### 6.2 How to Extract RolesPageContent

**Read `app/assessments/admin/roles/page.tsx` carefully.**
**Extract its JSX/logic into: `components/roles/RolesPageContent.tsx`**

The extracted component must:
1. Accept a `permissions` prop (or derive it from the current user internally)
2. Fetch from the SAME API endpoint (`/api/admin/roles`) — RLS now handles scoping
3. Render the EXACT same UI as today

Then update `app/assessments/admin/roles/page.tsx` to use `<RolesPageContent />`.
Then update `app/assessments/clients/[clientId]/roles/page.tsx` to use `<RolesPageContent />`.

**Same file. Both pages. Zero duplication.**

---

## PART 7: UI CHANGES INSIDE THE COMPONENTS

After extracting `RolesPageContent`, apply these conditional renders:

### 7.1 Tabs — show/hide based on visible scopes

```typescript
// Inside RolesPageContent.tsx (or wherever the tabs are rendered)
// Find the Tabs component and change it to:

const { permissions } = usePageData(); // permissions comes from API response

const tabs = [
  { value: 'all',          label: 'All Roles',       show: true },
  { value: 'GLOBAL',       label: '🌐 Global',       show: true },
  { value: 'ORGANIZATION', label: '🏢 My Org',       show: permissions?.visibleScopes.includes('ORGANIZATION') },
  { value: 'DEPARTMENT',   label: '🏬 My Dept',      show: permissions?.visibleScopes.includes('DEPARTMENT') },
  { value: 'TEAM',         label: '👥 My Team',      show: permissions?.visibleScopes.includes('TEAM') },
  { value: 'pending',      label: '⏳ Pending',      show: permissions?.canApproveGlobal },
].filter(t => t.show);
```

### 7.2 Create button — show only if user can create

```typescript
// Find the "+ Create Role" button in the page header. Wrap it:
{permissions?.canCreate && (
  <Button onClick={() => setShowCreateDialog(true)}>
    + Create Role
  </Button>
)}
```

### 7.3 Institution banner — show for institution users

```typescript
// Add this just below the page heading:
{permissions?.isInstitution && (
  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
    <span>⚠️</span>
    <span>
      <strong>Institution mode:</strong> Showing Junior/Fresher roles only.
      Roles for experienced professionals are not shown.
    </span>
  </div>
)}
```

### 7.4 Role card action buttons — use _permissions from API response

```typescript
// Find wherever the role cards render their action buttons.
// The API now returns role._permissions.canEdit, canDelete, etc.
// Replace hardcoded buttons with conditional ones:

// BEFORE (hardcoded for SuperAdmin):
<Button>Edit</Button>
<Button>Delete</Button>

// AFTER (permission-aware):
{role._permissions.canEdit && (
  <Button onClick={() => handleEdit(role)}>Edit</Button>
)}
{role._permissions.canDelete && (
  <Button variant="destructive" onClick={() => handleDelete(role)}>Delete</Button>
)}
{role._permissions.canSubmitGlobal && (
  <Button variant="outline" className="text-blue-600"
    onClick={() => handleSubmitGlobal(role)}>
    🌐 Submit for Global
  </Button>
)}
{role._permissions.canApprove && (
  <div className="flex gap-1">
    <Button size="sm" className="bg-green-600"
      onClick={() => handleApprove(role)}>✓ Approve</Button>
    <Button size="sm" variant="destructive"
      onClick={() => handleReject(role)}>✗ Reject</Button>
  </div>
)}
```

### 7.5 Scope badge on each role card

```typescript
// Add a scope indicator to each role card so users know where it belongs:
const scopeLabels = {
  GLOBAL:       { label: 'Global',   icon: '🌐', className: 'bg-blue-100 text-blue-700' },
  ORGANIZATION: { label: 'My Org',   icon: '🏢', className: 'bg-green-100 text-green-700' },
  DEPARTMENT:   { label: 'My Dept',  icon: '🏬', className: 'bg-yellow-100 text-yellow-700' },
  TEAM:         { label: 'My Team',  icon: '👥', className: 'bg-purple-100 text-purple-700' },
};

const scopeInfo = scopeLabels[role.scope] || scopeLabels.GLOBAL;

// Add inside the role card header:
<Badge className={scopeInfo.className}>
  {scopeInfo.icon} {scopeInfo.label}
</Badge>
```

### 7.6 Create Role Dialog — lock scope and levels for tenant users

```typescript
// Find the Create Role Dialog / Form (whatever the admin page uses).
// Add these constraints:

// 1. Scope field: hide from non-SuperAdmin (scope is set server-side anyway)
{permissions?.isSuperAdmin && (
  <div>
    <Label>Scope</Label>
    <Select name="scope">...</Select>
  </div>
)}
// For non-SuperAdmin, show info text instead:
{!permissions?.isSuperAdmin && permissions?.creatableScope && (
  <div className="px-3 py-2 bg-muted rounded text-sm text-muted-foreground">
    This role will be created at <strong>{permissions.creatableScope.toLowerCase()}</strong> level.
    {permissions.canSubmitForGlobal && ' You can submit it for global review after saving.'}
  </div>
)}

// 2. Experience level checkboxes: lock for institution users
<div>
  <Label>Experience Levels</Label>
  {permissions?.isInstitution ? (
    // Institution: show locked badge, cannot change
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
      <Badge className="bg-amber-100 text-amber-700">Junior / Fresher</Badge>
      <span className="text-xs text-amber-600">
        Locked — institutions assess only at Junior/Fresher level
      </span>
    </div>
  ) : (
    // Corporate: all levels available, keep existing UI
    <div className="flex gap-4">
      {['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'].map(level => (
        <label key={level} className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" defaultChecked value={level} />
          <span className="text-sm">{level}</span>
        </label>
      ))}
    </div>
  )}
</div>
```

### 7.7 Global submission status badge on cards

```typescript
// Show submission status on each role card when relevant:
{role.globalSubmitStatus === 'PENDING' && (
  <Badge className="bg-amber-100 text-amber-700">⏳ Pending Global Review</Badge>
)}
{role.globalSubmitStatus === 'CHANGES_REQUESTED' && (
  <Badge className="bg-orange-100 text-orange-700">
    ✎ Changes Requested
    {role.globalReviewNotes && (
      <span className="ml-1 text-xs">— {role.globalReviewNotes}</span>
    )}
  </Badge>
)}
{role.globalSubmitStatus === 'REJECTED' && (
  <Badge className="bg-red-100 text-red-700">✗ Rejected</Badge>
)}
```

---

## PART 8: APPLY THE SAME CHANGES TO COMPETENCIES

Everything in Parts 5, 6, and 7 applies identically to competencies.

```
Roles changes mirror to:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
components/roles/RolesPageContent.tsx
  → components/competencies/CompetenciesPageContent.tsx

app/assessments/admin/roles/page.tsx
  → app/assessments/admin/competencies/page.tsx

app/assessments/clients/[clientId]/roles/page.tsx
  → app/assessments/clients/[clientId]/competencies/page.tsx

app/api/admin/roles/route.ts
  → app/api/admin/competencies/route.ts

app/api/admin/roles/[id]/submit-global/route.ts
  → app/api/admin/competencies/[id]/submit-global/route.ts

app/api/admin/roles/[id]/review-global/route.ts
  → app/api/admin/competencies/[id]/review-global/route.ts
```

---

## PART 9: GLOBAL APPROVAL QUEUE (SuperAdmin only)

The admin page at `/assessments/admin/roles` already has a "Pending" tab (or add one).

When `permissions.canApproveGlobal === true`, the Pending tab shows:
- All roles/competencies with `globalSubmitStatus === 'PENDING'`
- Who submitted, from which org, when
- The entity snapshot for review
- Approve / Request Changes / Reject buttons

This does NOT need a new page. It is a tab inside the existing roles page.

```typescript
// Inside RolesPageContent, the 'pending' tab content:
{permissions?.canApproveGlobal && (
  <TabsContent value="pending">
    <div className="space-y-4">
      {pendingRoles.map(role => (
        <Card key={role.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted by {role.globalSubmittedBy} · {role.tenant?.name}
                </p>
                <div className="flex gap-1 mt-2">
                  {role.allowedLevels?.map(l => (
                    <Badge key={l} variant="outline">{l}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" className="bg-green-600"
                  onClick={() => handleApprove(role.id)}>
                  ✓ Approve
                </Button>
                <Button size="sm" variant="outline"
                  onClick={() => handleRequestChanges(role.id)}>
                  ✎ Changes
                </Button>
                <Button size="sm" variant="destructive"
                  onClick={() => handleReject(role.id)}>
                  ✗ Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
)}
```

---

## PART 10: IMPLEMENTATION ORDER (DO IN THIS EXACT ORDER)

### Step 1 — Audit (before any code)
Run all bash commands at the top. Report findings.
Confirm: do scope/tenantId/allowedLevels fields already exist on Role/Competency?

### Step 2 — Database migration
Add missing fields to Role and Competency models.
Create GlobalApprovalRequest table.
Run: `npx prisma migrate dev --name role_competency_rls`

### Step 3 — Permission utility
Create `lib/permissions/role-competency-permissions.ts` (exact code in Part 3).
Create `hooks/usePermissions.ts` (Part 4).
No UI changes yet. Test the utility with unit tests or console.log.

### Step 4 — Extend the API (RLS on existing routes)
Extend GET handler in admin roles API — add `buildVisibilityFilter`.
Extend POST handler — add scope enforcement.
Add `_permissions` annotations to each returned role.
Test: login as different users and check what GET returns.

### Step 5 — Extract shared component
Open `app/assessments/admin/roles/page.tsx`.
Extract its body into `components/roles/RolesPageContent.tsx`.
`admin/roles/page.tsx` now just renders `<RolesPageContent />`.
Confirm the admin page still works identically.

### Step 6 — Wire client page to shared component
Open `app/assessments/clients/[clientId]/roles/page.tsx`.
Replace its content with `<RolesPageContent />`.
Test: Corporate Admin visiting `/clients/[id]/roles` sees scoped data.

### Step 7 — UI permission rendering
Apply all changes from Part 7 inside `RolesPageContent.tsx`:
- Conditional tabs (7.1)
- Create button guard (7.2)
- Institution banner (7.3)
- Action buttons from `role._permissions` (7.4)
- Scope badge (7.5)
- Create dialog scope/level locks (7.6)
- Global submission status badge (7.7)

### Step 8 — Submit/Approve endpoints
Add `submit-global` and `review-global` API routes (Part 5.2, 5.3).
Wire "Submit for Global" button to call submit endpoint.
Wire Approve/Reject buttons to call review endpoint.

### Step 9 — Repeat all of Steps 4–8 for Competencies

### Step 10 — Test matrix

Test every combination from the table below before marking done:

```
USER                  | SEES                              | CAN CREATE  | INSTITUTION LOCKED?
──────────────────────────────────────────────────────────────────────────────────────────
Super Admin           | Everything                        | Global      | No
Corporate Admin       | Global + Org                      | Org         | No
Corp Dept Head (HOD)  | Global + Org + Dept + Team(dept)  | Dept        | No
Corp Team Leader      | Global + Org + Dept + Team(own)   | Team        | No
Institution Admin     | Global(Junior) + Own              | Org(Junior) | Yes
Institution Dept Head | Global(Junior) + Own + Dept       | Dept(Junior)| Yes
Class Teacher         | Global(Junior) + Own + Dept + Class| Class(Junior)| Yes
```

---

## PART 11: WHAT NOT TO DO

❌ Do NOT create a separate `/institution/roles` page  
❌ Do NOT create a separate `/corporate/roles` page  
❌ Do NOT duplicate the roles UI components  
❌ Do NOT hardcode tenant IDs anywhere  
❌ Do NOT add permission logic inside individual UI components — use the utility  
❌ Do NOT change the SuperAdmin's existing experience in any way  
❌ Do NOT remove any existing fields from Role or Competency models  
❌ Do NOT change existing API response shapes — only ADD `_permissions` field  

✅ DO use the existing form, card, tab, dialog components from the admin page  
✅ DO enforce all permissions server-side (API) AND client-side (UI)  
✅ DO apply scope filter to EVERY query that touches roles or competencies  
✅ DO test every user role type before marking complete  

---

**END OF IMPLEMENTATION GUIDE**
