import { buildAssessmentVisibilityFilter, getRoleCompetencyPermissions } from "../src/lib/permissions/role-competency-permissions";
import { UserRole } from "@prisma/client";

const mockUsers = [
    { name: "Super Admin", role: "SUPER_ADMIN", tenantId: null, departmentId: null, teamId: null, type: "SUPER_ADMIN" },
    { name: "Global Content Editor", role: "CONTENT_EDITOR", tenantId: null, departmentId: null, teamId: null, type: "SUPER_ADMIN" },
    { name: "Institution Exec", role: "UNIVERSITY_EXEC", tenantId: "tenant-inst-1", departmentId: null, teamId: null, type: "INSTITUTION" },
    { name: "Corp Admin", role: "CORPORATE_ADMIN", tenantId: "tenant-corp-1", departmentId: null, teamId: null, type: "CORPORATE" },
    { name: "Dept Head", role: "DEPT_HEAD", tenantId: "tenant-corp-1", departmentId: "dept-1", teamId: null, type: "CORPORATE" },
    { name: "Team Lead", role: "TEAM_LEAD", tenantId: "tenant-corp-1", departmentId: "dept-1", teamId: "team-1", type: "CORPORATE" },
    { name: "Employee", role: "MEMBER", tenantId: "tenant-corp-1", departmentId: "dept-1", teamId: "team-1", type: "CORPORATE" },
];

async function main() {
    console.log("=== Testing Assessment Model RLS ===");
    for (const u of mockUsers) {
        const userContext = {
            id: 'mock-user',
            role: u.role as UserRole,
            tenantId: u.tenantId,
            tenantType: u.type,
            departmentId: u.departmentId,
            teamId: u.teamId,
        };

        const filter = buildAssessmentVisibilityFilter(userContext);
        const perms = getRoleCompetencyPermissions(userContext);

        console.log(`\nUser: ${u.name} (${u.role}, Tenant: ${u.tenantId}, Type: ${u.type})`);
        console.log(`  Can Create Models: ${perms.canCreate}`);
        console.log(`  Creatable Scope: ${perms.creatableScope}`);
        console.log(`  Is Institution:  ${perms.isInstitution}`);
        console.log(`  RLS Filter:`, JSON.stringify(filter));
    }
}

main().catch(console.error);
