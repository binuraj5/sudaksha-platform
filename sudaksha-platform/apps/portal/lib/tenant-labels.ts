
export type TenantType = 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';

export interface TenantLabels {
    // Members
    member: string;
    memberPlural: string;
    memberCode: string; // "Employee ID" or "Student ID"
    faculty?: string; // "Faculty" (teachers) - for institutions
    facultyPlural?: string; // "Faculty" (same in many contexts) or "Faculty Members"

    // Organization
    orgUnit: string; // "Department"
    orgUnitPlural: string;
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
        faculty: 'Employee',
        facultyPlural: 'Employees',
        orgUnit: 'Department',
        orgUnitPlural: 'Departments',
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
        memberCode: 'Enrollment No.',
        faculty: 'Faculty',
        facultyPlural: 'Faculty',
        orgUnit: 'Department',
        orgUnitPlural: 'Departments',
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
        faculty: 'Staff',
        facultyPlural: 'Staff',
        orgUnit: 'Organization',
        orgUnitPlural: 'Organizations',
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
    return TENANT_LABELS[tenantType] || TENANT_LABELS.SYSTEM;
}
