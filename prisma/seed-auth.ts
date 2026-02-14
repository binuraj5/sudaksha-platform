
import { PrismaClient, TenantType, MemberType, MemberRole, UnitType, TenantPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding authentication data...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const superAdminPasswordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Create System Tenant
    console.log('Creating System Tenant...');
    const systemTenant = await prisma.tenant.upsert({
        where: { slug: 'system' },
        update: {},
        create: {
            name: 'Sudaksha System',
            slug: 'system',
            type: TenantType.SYSTEM,
            email: 'system@sudaksha.com',
            isActive: true,
            createdBy: 'SYSTEM_SEED',
        },
    });

    // 2. Create Corporate Tenant (TechCorp)
    console.log('Creating TechCorp Tenant...');
    const techCorpTenant = await prisma.tenant.upsert({
        where: { slug: 'techcorp' },
        update: {},
        create: {
            name: 'TechCorp Solutions',
            slug: 'techcorp',
            type: TenantType.CORPORATE,
            email: 'admin@techcorp.com',
            isActive: true,
            plan: TenantPlan.ENTERPRISE,
            createdBy: 'SYSTEM_SEED',
        },
    });

    // 3. Create Institution Tenant (State University)
    console.log('Creating State University Tenant...');
    const universityTenant = await prisma.tenant.upsert({
        where: { slug: 'university-edu' },
        update: {},
        create: {
            name: 'State University',
            slug: 'university-edu',
            type: TenantType.INSTITUTION,
            email: 'principal@university.edu',
            isActive: true,
            plan: TenantPlan.ENTERPRISE,
            createdBy: 'SYSTEM_SEED',
        },
    });

    // 4. Create B2C Tenant (Individual)
    console.log('Creating Individual Tenant...');
    const individualTenant = await prisma.tenant.upsert({
        where: { slug: 'individual' },
        update: {},
        create: {
            name: 'Individual B2C',
            slug: 'individual',
            type: TenantType.CORPORATE,
            email: 'individual@gmail.com',
            isActive: true,
            createdBy: 'SYSTEM_SEED',
        },
    });

    // 5. Create Organization Units (Departments)
    console.log('Creating Departments...');
    const engineering = await prisma.organizationUnit.upsert({
        where: { tenantId_code: { tenantId: techCorpTenant.id, code: 'ENG' } },
        update: {},
        create: {
            name: 'Engineering',
            code: 'ENG',
            type: UnitType.DEPARTMENT,
            tenantId: techCorpTenant.id,
        },
    });

    const sales = await prisma.organizationUnit.upsert({
        where: { tenantId_code: { tenantId: techCorpTenant.id, code: 'SALES' } },
        update: {},
        create: {
            name: 'Sales',
            code: 'SALES',
            type: UnitType.DEPARTMENT,
            tenantId: techCorpTenant.id,
        },
    });

    const cs101 = await prisma.organizationUnit.upsert({
        where: { tenantId_code: { tenantId: universityTenant.id, code: 'CS101' } },
        update: {},
        create: {
            name: 'Computer Science 101',
            code: 'CS101',
            type: UnitType.CLASS,
            tenantId: universityTenant.id,
        },
    });

    // 6. Create Members
    console.log('Creating Members...');
    const members = [
        {
            email: 'superadmin@sudaksha.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: MemberRole.SUPER_ADMIN,
            type: MemberType.EMPLOYEE,
            tenantId: systemTenant.id,
        },
        {
            email: 'admin@techcorp.com',
            name: 'TechCorp Admin',
            password: hashedPassword,
            role: MemberRole.TENANT_ADMIN,
            type: MemberType.EMPLOYEE,
            tenantId: techCorpTenant.id,
        },
        {
            email: 'principal@university.edu',
            name: 'University Principal',
            password: hashedPassword,
            role: MemberRole.TENANT_ADMIN,
            type: MemberType.STUDENT,
            tenantId: universityTenant.id,
        },
        {
            email: 'john.doe@techcorp.com',
            name: 'John Doe',
            password: hashedPassword,
            role: MemberRole.ASSESSOR,
            type: MemberType.EMPLOYEE,
            tenantId: techCorpTenant.id,
            orgUnitId: engineering.id,
        },
        {
            email: 'jane.smith@techcorp.com',
            name: 'Jane Smith',
            password: hashedPassword,
            role: MemberRole.MANAGER,
            type: MemberType.EMPLOYEE,
            tenantId: techCorpTenant.id,
            orgUnitId: sales.id,
        },
        {
            email: 'student1@university.edu',
            name: 'Student One',
            password: hashedPassword,
            role: MemberRole.ASSESSOR,
            type: MemberType.STUDENT,
            tenantId: universityTenant.id,
            orgUnitId: cs101.id,
        },
        {
            email: 'individual@gmail.com',
            name: 'Individual User',
            password: hashedPassword,
            role: MemberRole.ASSESSOR,
            type: MemberType.INDIVIDUAL,
            tenantId: individualTenant.id,
        },
    ];

    for (const member of members) {
        await prisma.member.upsert({
            where: { email: member.email },
            update: member,
            create: member,
        });
    }

    // 7. Create Super Admin user (AdminUser table)
    console.log('Creating Super Admin (AdminUser)...');
    await prisma.adminUser.upsert({
        where: { email: 'superadmin@sudaksha.com' },
        update: {
            name: 'Super Admin',
            passwordHash: superAdminPasswordHash,
            isActive: true,
        },
        create: {
            email: 'superadmin@sudaksha.com',
            name: 'Super Admin',
            passwordHash: superAdminPasswordHash,
            isActive: true,
        },
    });

    // 8. Create matching User for Super Admin (required for ComponentLibrary.createdBy, etc.)
    console.log('Creating Super Admin (User table for createdBy)...');
    await prisma.user.upsert({
        where: { email: 'superadmin@sudaksha.com' },
        update: { name: 'Super Admin', isActive: true },
        create: {
            email: 'superadmin@sudaksha.com',
            name: 'Super Admin',
            password: superAdminPasswordHash,
            role: 'SUPER_ADMIN',
            userType: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Authentication seeding complete.');
    console.log('Use password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
