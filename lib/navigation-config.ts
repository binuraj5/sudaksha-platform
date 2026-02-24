import {
    Home, Building, Users, Briefcase, UsersIcon,
    FileText, FilePlus, ClipboardList, BarChart, Settings,
    User, Globe, CheckCircle, DollarSign, GraduationCap, BookOpen, BrainCircuit
} from 'lucide-react';
import { TENANT_LABELS, getLabelsForTenant } from './tenant-labels';

// Define types locally if not available globally yet
export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'DEPARTMENT_HEAD' | 'TEAM_LEAD' | 'EMPLOYEE' | 'STUDENT' | 'INDIVIDUAL' | 'ASSESSOR';
export type TenantType = 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';

export interface Tenant {
    id: string;
    slug?: string;
    type: TenantType;
    name: string;
    logoUrl?: string;
}

export interface NavigationItem {
    id: string;
    icon: any;
    label: string | ((tenantType: TenantType) => string); // Dynamic label
    path: string | ((basePath: string) => string);
    permission: string; // Permission required to see this
    roles: string[]; // Using string[] to match NextAuth session role type which is string
    tenantTypes?: TenantType[]; // Optional: Only show for specific tenant types
    children?: NavigationItem[];
    badge?: () => Promise<number>; // Dynamic badge count
    defaultExpanded?: boolean; // Start expanded (e.g. My Profile)
}

// Base path for tenant: org slug URL when slug is set, else clients/{id}
export function getTenantBasePath(tenant: Tenant | null): string {
    if (!tenant) return '';
    if (tenant.slug) return `/assessments/org/${tenant.slug}`;
    return `/assessments/clients/${tenant.id}`;
}

// 2. ADMIN MENU (Corporates: Admin, Dept Head, Team Lead; Institutions: Admin, Dept Head, Class Teacher)
const BASE_NAV_ITEMS: NavigationItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: (base) => `${base}/dashboard`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'] },
    { id: 'settings', icon: Settings, label: 'Organization Setup', path: (base) => `${base}/settings`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN'] },
    { id: 'org-units', icon: Building, label: (t) => TENANT_LABELS[t]?.orgUnit || 'Department', path: (base) => `${base}/departments`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD'] },
    { id: 'faculty', icon: Users, label: (t) => TENANT_LABELS[t]?.facultyPlural || TENANT_LABELS[t]?.faculty || 'Faculty', path: (base) => `${base}/faculty`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'CLASS_TEACHER'], tenantTypes: ['INSTITUTION'] },
    { id: 'members', icon: Users, label: (t) => TENANT_LABELS[t]?.memberPlural || 'Employees', path: (base) => `${base}/employees`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'] },
    { id: 'activities', icon: Briefcase, label: (t) => TENANT_LABELS[t]?.activityPlural || 'Projects', path: (base) => `${base}/projects`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'], tenantTypes: ['CORPORATE'] },
    { id: 'teams', icon: UsersIcon, label: (t) => getLabelsForTenant(t).subUnitPlural, path: (base) => `${base}/teams`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD'], tenantTypes: ['CORPORATE'] },
    { id: 'roles', icon: FileText, label: 'Roles', path: (base) => `${base}/roles`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'] },
    { id: 'approval-queue', icon: CheckCircle, label: 'Approval Queue', path: (base) => `${base}/approvals`, permission: '*', roles: ['TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD'] },
    { id: 'competencies', icon: BrainCircuit, label: 'Role Matrix', path: (base) => `${base}/competencies`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD'] },
    { id: 'assessments', icon: FileText, label: 'Assessments', path: (base) => `${base}/assessments`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'] },
    { id: 'reports', icon: BarChart, label: 'Reports', path: (base) => `${base}/reports`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'] },
    { id: 'surveys', icon: ClipboardList, label: 'Survey', path: (base) => `${base}/surveys`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'] },
    { id: 'curriculum', icon: BookOpen, label: 'Curriculum', path: (base) => `${base}/curriculum`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'], tenantTypes: ['INSTITUTION'] },
    { id: 'courses', icon: GraduationCap, label: 'Courses', path: (base) => `${base}/courses`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'CLASS_TEACHER'], tenantTypes: ['INSTITUTION'] },
    { id: 'classes', icon: UsersIcon, label: 'Classes', path: (base) => `${base}/classes`, permission: '*', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'CLASS_TEACHER'], tenantTypes: ['INSTITUTION'] },
];

// 3. SUPER ADMIN SPECIFIC ITEMS
const SUPER_ADMIN_NAV_ITEMS: NavigationItem[] = [
    {
        id: 'all-tenants',
        icon: Globe,
        label: 'Tenants (Corporate)',
        path: () => '/assessments/admin/tenants',
        permission: 'tenants:read_all',
        roles: ['SUPER_ADMIN']
    },
    {
        id: 'approvals',
        icon: CheckCircle,
        label: 'Approvals',
        path: () => '/assessments/admin/approvals',
        permission: 'approvals:manage',
        roles: ['SUPER_ADMIN'],
        badge: async () => {
            try {
                // Fetch pending approval count - ensure this endpoint exists or mock it gracefully if not
                const res = await fetch('/api/admin/approvals/count');
                if (res.ok) {
                    const data = await res.json();
                    return data.pending;
                }
                return 0;
            } catch (e) {
                return 0;
            }
        }
    },
    {
        id: 'usage-analytics',
        icon: DollarSign,
        label: 'Usage & Billing',
        path: () => '/assessments/admin/usage-analytics',
        permission: 'analytics:read_all',
        roles: ['SUPER_ADMIN']
    },
    {
        id: 'institutions',
        icon: GraduationCap,
        label: 'Institutions',
        path: () => '/assessments/admin/institutions',
        permission: 'tenants:read_all',
        roles: ['SUPER_ADMIN']
    },
    {
        id: 'assessment-foundation',
        icon: FileText,
        label: 'Assessments Foundation',
        path: () => '/assessments/admin/models',
        permission: 'assessments:read_all',
        roles: ['SUPER_ADMIN']
    }
];

// 4. MY PROFILE (My Page) – nested structure; visible to all tenant users
// When tenant basePath is present, paths use basePath (org slug or clients/id) so users stay in correct layout.
// M15 B2C: My Hierarchy is HIDDEN for INDIVIDUAL (no org)
const ALL_PROFILE_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER', 'EMPLOYEE', 'STUDENT', 'INDIVIDUAL', 'ASSESSOR'];
const ROLES_WITH_HIERARCHY = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER', 'EMPLOYEE', 'STUDENT', 'ASSESSOR']; // Excludes INDIVIDUAL
const basePathOrPortal = (base: string, portal: string, segment: string) => (base ? `${base}${segment}` : portal);
const MY_PAGE_NAV_ITEMS: NavigationItem[] = [
    { id: 'my-details', icon: User, label: 'My Details', path: (base) => basePathOrPortal(base, '/assessments/individuals/profile', '/profile'), permission: '*', roles: ALL_PROFILE_ROLES },
    { id: 'my-hierarchy', icon: Users, label: 'My Hierarchy', path: (base) => basePathOrPortal(base, '/assessments/hierarchy', '/hierarchy'), permission: '*', roles: ROLES_WITH_HIERARCHY },
    { id: 'my-projects', icon: Briefcase, label: (t) => t === 'SYSTEM' ? 'My Goals' : 'My Projects', path: (base) => basePathOrPortal(base, '/assessments/individuals/dashboard', '/projects'), permission: '*', roles: ALL_PROFILE_ROLES },
    {
        id: 'my-career',
        icon: Briefcase,
        label: 'My Career',
        path: (base) => basePathOrPortal(base, '/assessments/individuals/career', '/career'),
        permission: '*',
        roles: ALL_PROFILE_ROLES,
        children: [
            { id: 'my-current-role', icon: User, label: 'My Current Role', path: (base) => basePathOrPortal(base, '/assessments/individuals/career', '/career'), permission: '*', roles: ['*'] },
            { id: 'my-previous-roles', icon: User, label: 'My Previous Roles', path: (base) => basePathOrPortal(base, '/assessments/individuals/career', '/career'), permission: '*', roles: ['*'] },
            { id: 'my-aspirational-role', icon: User, label: 'My Aspirational Role', path: (base) => basePathOrPortal(base, '/assessments/individuals/career', '/career'), permission: '*', roles: ['*'] },
            { id: 'my-competencies', icon: FileText, label: 'My Competencies', path: (base) => basePathOrPortal(base, '/assessments/individuals/career', '/career'), permission: '*', roles: ['*'] },
        ]
    },
    {
        id: 'my-assessments',
        icon: FileText,
        label: 'My Assessments',
        path: (base) => basePathOrPortal(base, '/assessments/individuals/dashboard', '/assessments'),
        permission: '*',
        roles: ALL_PROFILE_ROLES,
        children: [
            { id: 'take-assessment', icon: FileText, label: 'Take Assessment', path: (base) => basePathOrPortal(base, '/assessments/individuals/dashboard', '/assessments'), permission: '*', roles: ['*'] },
            { id: 'assessments-role-wise', icon: FileText, label: 'My Assessments - Role-Wise', path: (base) => basePathOrPortal(base, '/assessments/individuals/dashboard', '/assessments'), permission: '*', roles: ['*'] },
            { id: 'assessments-competency-wise', icon: FileText, label: 'My Assessments - Competency-Wise', path: (base) => basePathOrPortal(base, '/assessments/individuals/dashboard', '/assessments'), permission: '*', roles: ['*'] },
            { id: 'assessment-scores', icon: BarChart, label: 'Assessment Scores', path: (base) => basePathOrPortal(base, '/assessments/individuals/results', '/results'), permission: '*', roles: ['*'] },
        ]
    },
    { id: 'take-survey', icon: ClipboardList, label: 'Take Survey', path: (base) => basePathOrPortal(base, '/assessments/individuals/dashboard', '/surveys'), permission: '*', roles: ALL_PROFILE_ROLES },
    { id: 'my-curriculum', icon: BookOpen, label: 'My Curriculum', path: (base) => basePathOrPortal(base, '/assessments/curriculum', '/curriculum'), permission: '*', roles: ALL_PROFILE_ROLES, tenantTypes: ['INSTITUTION'] },
    { id: 'individual-dashboard', icon: Home, label: 'Dashboard', path: () => '/assessments/individuals/dashboard', permission: '*', roles: ['INDIVIDUAL', 'STUDENT'] },
];

// Normalize role: DB/session may use DEPT_HEAD, CLIENT_ADMIN; nav config uses DEPARTMENT_HEAD, TENANT_ADMIN
function effectiveRole(role: string): string {
    if (role === 'DEPT_HEAD') return 'DEPARTMENT_HEAD';
    if (role === 'CLIENT_ADMIN') return 'TENANT_ADMIN';
    return role;
}

// 5. MAIN FUNCTION: Get Navigation for User
export function getNavigationConfig(
    user: { role: string },
    tenant: Tenant | null
): NavigationItem[] {
    const navigation: NavigationItem[] = [];
    const role = effectiveRole(user.role);

    // Add Super Admin section (if applicable)
    if (user.role === 'SUPER_ADMIN') {
        navigation.push({
            id: 'super-admin-section',
            icon: Globe,
            label: 'Super Admin',
            path: '#',
            permission: '*',
            roles: ['SUPER_ADMIN'],
            children: SUPER_ADMIN_NAV_ITEMS
        });
    }

    // Admin Menu for corporates (Admin, Dept Head, Team Lead) and institutions (Admin, Dept Head, Class Teacher); View Switch handles admin vs personal view.
    const basePath = getTenantBasePath(tenant);
    const adminMenuRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'];
    if (tenant && adminMenuRoles.includes(role)) {
        const tenantNavItems = BASE_NAV_ITEMS
            .filter(item => item.roles.includes(role))
            .filter(item => !item.tenantTypes || item.tenantTypes.includes(tenant.type))
            .map(item => {
                let path = typeof item.path === 'function' ? item.path(basePath) : item.path;

                if (role === 'DEPARTMENT_HEAD' && item.id === 'dashboard') {
                    path = `${basePath}/my-department`;
                }
                if (role === 'TEAM_LEAD' && item.id === 'dashboard') {
                    path = `${basePath}/my-team`;
                }

                return {
                    ...item,
                    label: typeof item.label === 'function' ? item.label(tenant.type) : item.label,
                    path: path
                };
            });

        navigation.push({
            id: 'admin-menu-section',
            icon: Home,
            label: 'Admin Menu',
            path: '#',
            permission: '*',
            roles: ['*'],
            children: tenantNavItems
        });
    }

    // My Profile section: Add for all roles except Institution Faculty.
    // For switcher roles (Admin, Dept Head, Team Lead), Sidebar uses this when user selects "My Personal Page".
    // For non-switcher roles (Employee, Student), this is shown as the main nav.
    const isInstitutionFaculty = tenant?.type === 'INSTITUTION' && ['EMPLOYEE', 'ASSESSOR'].includes(user.role);
    const showMyProfile = !isInstitutionFaculty;

    if (showMyProfile) {
        const effectiveTenantType = tenant?.type ?? (user.role === 'INDIVIDUAL' ? 'SYSTEM' : null);
        const myPageItems = MY_PAGE_NAV_ITEMS
            .filter(item => item.roles.includes('*') || item.roles.includes(role))
            .filter(item => !item.tenantTypes || (tenant && item.tenantTypes.includes(tenant.type)))
            .filter(item => item.id !== 'my-hierarchy' || user.role !== 'INDIVIDUAL') // M15: Hide hierarchy for B2C
            .map(item => {
                const path = typeof item.path === 'function' ? item.path(basePath) : item.path;
                const label = typeof item.label === 'function' ? item.label(effectiveTenantType ?? 'CORPORATE') : item.label;
                return {
                    ...item,
                    label,
                    path,
                    children: item.children?.map(child => ({
                        ...child,
                        path: typeof child.path === 'function' ? child.path(basePath) : child.path
                    }))
                };
            });

        if (myPageItems.length > 0) {
            navigation.push({
                id: 'my-page-section',
                icon: User,
                label: 'My Profile',
                path: '#',
                permission: '*',
                roles: ['*'],
                children: myPageItems,
                defaultExpanded: true
            });
        }
    }

    // Institution Faculty: My Personal Page not available; provide minimal Dashboard link
    if (isInstitutionFaculty && tenant && basePath) {
        navigation.push({
            id: 'institution-faculty-dashboard',
            icon: Home,
            label: 'Dashboard',
            path: `${basePath}/dashboard`,
            permission: '*',
            roles: ['*'],
        });
    }

    return navigation;
}

// 6. PERMISSION FILTERING (Applied in component)
export function filterNavigationByPermissions(
    navigation: NavigationItem[],
    userPermissions: string[] | undefined
): NavigationItem[] {
    // If user has '*' (wildcard) or no permissions provided, allow all (role filter already applied)
    if (!userPermissions || userPermissions.includes('*')) {
        return navigation.map(item => ({
            ...item,
            children: item.children ? filterNavigationByPermissions(item.children, userPermissions) : undefined
        }));
    }

    return navigation
        .filter(item => item.permission === '*' || userPermissions.includes(item.permission))
        .map(item => ({
            ...item,
            children: item.children
                ? filterNavigationByPermissions(item.children, userPermissions)
                : undefined
        }));
}
