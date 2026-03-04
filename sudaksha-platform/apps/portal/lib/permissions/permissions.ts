
/**
 * Permission Definitions
 * 
 * Defines all granular permissions available in the system.
 */

export type Permission =
    // Members
    | 'members:read'
    | 'members:create'
    | 'members:update'
    | 'members:delete'
    // Organization Units
    | 'orgUnits:read'
    | 'orgUnits:create'
    | 'orgUnits:update'
    | 'orgUnits:delete'
    // Activities
    | 'activities:read'
    | 'activities:create'
    | 'activities:update'
    | 'activities:delete'
    // Roles & Competencies
    | 'roles:read'
    | 'roles:create'
    | 'roles:update'
    | 'roles:approve'
    | 'competencies:read'
    | 'competencies:create'
    | 'competencies:update'
    // Assessments
    | 'assessments:read'
    | 'assessments:create'
    | 'assessments:assign'
    | 'assessments:take'
    // Surveys
    | 'surveys:read'
    | 'surveys:create'
    | 'surveys:assign'
    | 'surveys:delete'
    // Analytics & Reports
    | 'reports:read'
    | 'reports:create'
    // Settings
    | 'settings:read'
    | 'settings:update';

/**
 * Role-to-Permissions Mapping
 * 
 * Default permission sets for each major role.
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    'SUPER_ADMIN': [
        'members:read', 'members:create', 'members:update', 'members:delete',
        'orgUnits:read', 'orgUnits:create', 'orgUnits:update', 'orgUnits:delete',
        'activities:read', 'activities:create', 'activities:update', 'activities:delete',
        'roles:read', 'roles:create', 'roles:update', 'roles:approve',
        'competencies:read', 'competencies:create', 'competencies:update',
        'assessments:read', 'assessments:create', 'assessments:assign',
        'surveys:read', 'surveys:create', 'surveys:assign', 'surveys:delete',
        'reports:read', 'reports:create',
        'settings:read', 'settings:update'
    ],
    'TENANT_ADMIN': [
        'members:read', 'members:create', 'members:update', 'members:delete',
        'orgUnits:read', 'orgUnits:create', 'orgUnits:update', 'orgUnits:delete',
        'activities:read', 'activities:create', 'activities:update', 'activities:delete',
        'roles:read', 'roles:create', 'roles:update',
        'competencies:read',
        'assessments:read', 'assessments:assign',
        'surveys:read', 'surveys:create', 'surveys:assign', 'surveys:delete',
        'reports:read', 'reports:create',
        'settings:read', 'settings:update'
    ],
    'DEPT_HEAD': [
        'members:read',
        'activities:read',
        'assessments:read', 'assessments:assign',
        'surveys:read', 'surveys:create', 'surveys:assign',
        'reports:read'
    ],
    'TEAM_LEAD': [
        'members:read',
        'activities:read',
        'assessments:read', 'assessments:assign',
        'surveys:read',
        'reports:read'
    ],
    'ASSESSOR': [
        'members:read',
        'activities:read',
        'assessments:read', 'assessments:assign',
        'reports:read'
    ],
    'MEMBER': [
        'assessments:read', 'assessments:take',
        'reports:read' // Their own reports
    ]
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}
