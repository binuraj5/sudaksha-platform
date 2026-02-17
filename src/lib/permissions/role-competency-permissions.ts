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
  role: UserRole | string; // Auth may send DEPT_HEAD | TEAM_LEAD; we normalize below
  tenantId: string;
  tenantType: TenantType;
  departmentId?: string;
  teamId?: string;
  /** Institution: class (org unit) id for Class Teacher; used when scope is CLASS */
  classId?: string;
}

/** Normalize auth role names to permission util enum (DEPT_HEAD → DEPARTMENT_HEAD, TEAM_LEAD → TEAM_LEADER). */
export function normalizeUserRole(role: string): UserRole {
  if (role === 'DEPT_HEAD') return 'DEPARTMENT_HEAD';
  if (role === 'TEAM_LEAD') return 'TEAM_LEADER';
  return role as UserRole;
}

function withNormalizedRole(user: UserContext): UserContext & { role: UserRole } {
  return { ...user, role: normalizeUserRole(user.role as string) };
}

// ─────────────────────────────────────────
// VISIBILITY: What can this user SEE?
// ─────────────────────────────────────────

export function getVisibleScopes(user: UserContext): Scope[] {
  const u = withNormalizedRole(user);
  // Everyone sees GLOBAL
  const scopes: Scope[] = ['GLOBAL'];

  // Org-level and below: see ORGANIZATION scope in their org
  if (['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEADER',
       'INSTITUTION_ADMIN', 'DEPT_HEAD_INST', 'CLASS_TEACHER'].includes(u.role)) {
    scopes.push('ORGANIZATION');
  }

  // Dept-level and below: see DEPARTMENT scope in their dept
  if (['DEPARTMENT_HEAD', 'TEAM_LEADER',
       'DEPT_HEAD_INST', 'CLASS_TEACHER'].includes(u.role)) {
    scopes.push('DEPARTMENT');
  }

  // Team-level (Corporate): see TEAM scope
  if (u.role === 'TEAM_LEADER') {
    scopes.push('TEAM');
  }

  // Class-level (Institution): see CLASS scope (logically the "team" for Class Teacher)
  if (u.role === 'CLASS_TEACHER') {
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
  const r = normalizeUserRole(user.role as string);
  switch (r) {
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
      return 'CLASS'; // Institution: CLASS is logically the "team" for Class Teacher

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
  const r = normalizeUserRole(user.role as string);
  const isSuperAdmin = r === 'SUPER_ADMIN';
  const isTenantAdmin = ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(r);
  const isDeptHead = ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(r);
  const isNarrowestScope = ['TEAM_LEADER', 'CLASS_TEACHER'].includes(r);
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
  const u = withNormalizedRole(user);
  const levelFilter = user.tenantType === 'INSTITUTION'
    ? { allowedLevels: { hasSome: ['JUNIOR'] } }
    : {};

  if (u.role === 'SUPER_ADMIN') {
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

      // Class-level roles in their class (Institution — Class Teacher; teamId stores class/org unit id)
      ...(user.classId ? [{
        scope: 'CLASS',
        tenantId: user.tenantId,
        teamId: user.classId,
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
  const r = normalizeUserRole(user.role as string);
  if (r === 'SUPER_ADMIN') return true;

  // Global roles: only Super Admin
  if (role.scope === 'GLOBAL') return false;

  // Must be in same tenant
  if (role.tenantId !== user.tenantId) return false;

  // Org scope: Tenant Admin can modify
  if (role.scope === 'ORGANIZATION') {
    return ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(r);
  }

  // Dept scope: Dept head or above in same dept
  if (role.scope === 'DEPARTMENT') {
    const isDeptHead = ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST'].includes(r);
    const isTenantAdmin = ['TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(r);
    return (isTenantAdmin) ||
      (isDeptHead && role.departmentId === user.departmentId);
  }

  // Team scope (Corporate): Team leader who created it, or dept head above
  if (role.scope === 'TEAM') {
    return role.createdByUserId === user.id ||
      ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST',
       'TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(r);
  }

  // Class scope (Institution): Class Teacher for same class (teamId = class id), or above
  if (role.scope === 'CLASS') {
    const isSameClass = user.classId != null && role.teamId === user.classId;
    return (r === 'CLASS_TEACHER' && isSameClass) || role.createdByUserId === user.id ||
      ['DEPARTMENT_HEAD', 'DEPT_HEAD_INST',
       'TENANT_ADMIN', 'INSTITUTION_ADMIN'].includes(r);
  }

  return false;
}
