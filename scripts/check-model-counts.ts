import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const [
        clientCount,
        userCount,
        departmentCount,
        projectCount,
        tenantCount,
        memberCount,
        orgUnitCount,
        activityCount
    ] = await Promise.all([
        prisma.client.count().catch(() => -1),
        prisma.user.count().catch(() => -1),
        prisma.department.count().catch(() => -1),
        prisma.project.count().catch(() => -1),
        prisma.tenant.count().catch(() => -1),
        prisma.member.count().catch(() => -1),
        prisma.organizationUnit.count().catch(() => -1),
        prisma.activity.count().catch(() => -1)
    ]);

    console.log('Legacy Models:');
    console.log(`- Clients: ${clientCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Departments: ${departmentCount}`);
    console.log(`- Projects: ${projectCount}`);

    console.log('\nUnified Models:');
    console.log(`- Tenants: ${tenantCount}`);
    console.log(`- Members: ${memberCount}`);
    console.log(`- OrganizationUnits: ${orgUnitCount}`);
    console.log(`- Activities: ${activityCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
