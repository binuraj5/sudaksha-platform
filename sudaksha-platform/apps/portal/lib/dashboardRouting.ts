/**
 * Dashboard routing by role
 * SEPL/INT/2026/IMPL-STEPS-01 Step 11
 *
 * Maps authenticated user role to their dashboard path.
 * Add new roles here as they are built — never in page components.
 *
 * Role sources (from db-assessments schema):
 *   UserRole:   SUPER_ADMIN, CLIENT_ADMIN, PROJECT_MANAGER, MANAGER, ASSESSOR,
 *               ADMIN, DEPT_HEAD, TEAM_LEAD, EMPLOYEE, INDIVIDUAL
 *   MemberRole: SUPER_ADMIN, TENANT_ADMIN, MANAGER, ASSESSOR, DEPT_HEAD,
 *               TEAM_LEAD, CLASS_TEACHER, EMPLOYEE, INDIVIDUAL
 *   ManagerRole: PROJECT_MANAGER, DEPARTMENT_HEAD, TEAM_LEAD, SUPERVISOR
 */

export type DashboardRole =
    | 'SUPER_ADMIN'
    | 'CLIENT_ADMIN'
    | 'TENANT_ADMIN'
    | 'PROJECT_MANAGER'
    | 'MANAGER'
    | 'ASSESSOR'
    | 'ADMIN'
    | 'DEPT_HEAD'
    | 'DEPARTMENT_HEAD'   // ManagerRole alias
    | 'TEAM_LEAD'
    | 'SUPERVISOR'
    | 'CLASS_TEACHER'
    | 'EMPLOYEE'
    | 'INDIVIDUAL'
    | 'STUDENT'
    | 'L_AND_D'
    | 'HR'
    | 'TALENT_MANAGEMENT'
    | 'RECRUITER'
    | 'HIRING_MANAGER'
    | 'HR_HEAD'
    | 'CEO'
    // SEPL/INT/2026/IMPL-PHASE3-01 Step T4 — TDAS roles
    | 'TRAINER'
    | 'SUDAKSHA_OBSERVER'
    | 'SUDAKSHA_ADMIN'
    | 'OPS_DELIVERY'
    | string;             // fallback for future or unknown roles

/**
 * Canonical role → dashboard path mapping.
 * Tenant-contextual routes (org/[slug]/*) are resolved by the dashboard page
 * using the tenantSlug from session — these paths are the WITHIN-ORG destinations.
 * B2C paths are absolute.
 */
const ROLE_DASHBOARD_MAP: Record<string, string> = {
    // ── Super / Platform Admin ───────────────────────────────────────────────
    SUPER_ADMIN:        '/assessments/admin/dashboard',
    ADMIN:              '/assessments/admin/dashboard',

    // ── Org-level admins (org context resolved by page using tenantSlug) ─────
    CLIENT_ADMIN:       '/assessments/dashboard/client-admin',
    TENANT_ADMIN:       '/assessments/dashboard/client-admin',
    PROJECT_MANAGER:    '/assessments/dashboard/project-manager',

    // ── Functional managers ──────────────────────────────────────────────────
    MANAGER:            '/assessments/dashboard/manager',
    DEPT_HEAD:          '/assessments/dashboard/dept-head',
    DEPARTMENT_HEAD:    '/assessments/dashboard/dept-head',
    TEAM_LEAD:          '/assessments/dashboard/team-lead',
    SUPERVISOR:         '/assessments/dashboard/team-lead',     // same view as TL

    // ── HR / Talent / L&D ────────────────────────────────────────────────────
    HR:                 '/assessments/dashboard/hr',
    TALENT_MANAGEMENT:  '/assessments/dashboard/hr',
    HR_HEAD:            '/assessments/dashboard/hr-head',
    L_AND_D:            '/assessments/dashboard/ld',
    RECRUITER:          '/assessments/dashboard/recruiter',
    HIRING_MANAGER:     '/assessments/dashboard/hiring-manager',

    // ── Executive ────────────────────────────────────────────────────────────
    CEO:                '/assessments/dashboard/ceo',

    // ── Assessment-specific roles ────────────────────────────────────────────
    ASSESSOR:           '/assessments/my/dashboard',
    CLASS_TEACHER:      '/assessments/my/dashboard',

    // ── Individual contributors (org or B2C) ─────────────────────────────────
    EMPLOYEE:           '/assessments/my/dashboard',
    INDIVIDUAL:         '/assessments/individuals/dashboard',
    STUDENT:            '/assessments/individuals/dashboard',

    // ── Phase 3 TDAS roles — SEPL/INT/2026/IMPL-PHASE3-01 Step T4 ────────────
    TRAINER:              '/assessments/dashboard/trainer',
    SUDAKSHA_OBSERVER:    '/assessments/dashboard/observer',
    SUDAKSHA_ADMIN:       '/assessments/dashboard/observer',
    OPS_DELIVERY:         '/assessments/dashboard/trainer',
};

/** Returned when the role has no specific dashboard yet, or role is missing. */
export const DEFAULT_DASHBOARD = '/assessments/individuals/dashboard';

/**
 * Returns the canonical dashboard path for a given role string.
 * Case-insensitive. Returns DEFAULT_DASHBOARD for null / unknown roles.
 *
 * @example
 *   getDashboardPath('CEO')        // '/assessments/dashboard/ceo'
 *   getDashboardPath('team_lead')  // '/assessments/dashboard/team-lead'
 *   getDashboardPath(null)         // '/assessments/individuals/dashboard'
 */
export function getDashboardPath(role: string | null | undefined): string {
    if (!role) return DEFAULT_DASHBOARD;
    return ROLE_DASHBOARD_MAP[role.toUpperCase()] ?? DEFAULT_DASHBOARD;
}

/**
 * For org users (tenantSlug present), resolve the role-specific path
 * scoped under the org namespace: /assessments/org/[slug]/[sub-path].
 *
 * Falls back to the org's generic dashboard if no scoped path is defined.
 */
const ORG_ROLE_SUB_PATH: Record<string, string> = {
    TENANT_ADMIN:       'dashboard',
    CLIENT_ADMIN:       'dashboard',
    PROJECT_MANAGER:    'dashboard',
    MANAGER:            'dashboard',
    DEPT_HEAD:          'dashboard',
    DEPARTMENT_HEAD:    'dashboard',
    TEAM_LEAD:          'dashboard',
    SUPERVISOR:         'dashboard',
    HR:                 'dashboard',
    HR_HEAD:            'dashboard',
    L_AND_D:            'dashboard',
    RECRUITER:          'dashboard',
    HIRING_MANAGER:     'dashboard',
    CEO:                'dashboard',
    ASSESSOR:           'dashboard',
    CLASS_TEACHER:      'dashboard',
    EMPLOYEE:           'dashboard',
};

/**
 * Returns the full org-scoped dashboard URL for a tenant user.
 * All org roles currently share the same org dashboard (sub-path = 'dashboard').
 * As role-specific org views are built (Steps 12–17), update ORG_ROLE_SUB_PATH.
 */
export function getOrgDashboardPath(tenantSlug: string, role: string | null | undefined): string {
    if (!tenantSlug) return DEFAULT_DASHBOARD;
    const sub = (role && ORG_ROLE_SUB_PATH[role.toUpperCase()]) ?? 'dashboard';
    return `/assessments/org/${tenantSlug}/${sub}`;
}
