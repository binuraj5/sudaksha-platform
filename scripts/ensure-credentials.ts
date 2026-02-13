
import { PrismaClient, MemberRole, MemberType, TenantType, UnitType, AccountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔐 Ensuring Test Credentials for 10 User Types...');

    // Standard Password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Helper to ensure tenant exists
    // Helper to ensure tenant AND matching client exists
    const ensureTenant = async (type: TenantType, name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');

        // 1. Ensure Tenant (for Members/Assessments)
        let tenant = await prisma.tenant.findUnique({ where: { slug } });
        if (!tenant) {
            console.log(`Creating tenant ${name}...`);
            try {
                tenant = await prisma.tenant.create({
                    data: {
                        name,
                        slug,
                        type,
                        email: `contact@${slug}.com`,
                        phone: '1234567890',
                        address: '123 Tech Park',
                        isActive: true,
                        createdBy: 'system'
                    } as any
                });
            } catch (e: any) {
                console.error(`❌ Failed to create tenant ${name}:`, e.message);
                tenant = await prisma.tenant.findFirst({ where: { slug } });
            }
        }

        // 2. Ensure Client (for Users/NextAuth)
        let client = await prisma.client.findUnique({ where: { slug } });
        if (!client) {
            console.log(`Creating matching client ${name}...`);
            try {
                // Use the same ID if possible to keep them linked, but Prisma IDs are cuid by default
                client = await prisma.client.create({
                    data: {
                        id: tenant?.id, // Try to mirror the ID for simplicity
                        name,
                        slug,
                        email: `contact@${slug}.com`,
                        isActive: true,
                        createdBy: 'system',
                        subscriptionStart: new Date(),
                    } as any
                });
            } catch (e: any) {
                console.log(`Matching client ${name} creation failed or exists.`);
                client = await prisma.client.findFirst({ where: { slug } });
            }
        }

        return tenant || client;
    };

    const corpTenant = await ensureTenant('CORPORATE', 'Tech Corp');
    const eduTenant = await ensureTenant('INSTITUTION', 'City University');

    // Helper to ensure user exists in both Member and User tables
    const ensureUser = async (email: string, memberRole: MemberRole, type: MemberType, tenantId: string | null, name: string) => {
        // Map MemberRole to UserRole (Schema sync)
        let userRole: any = 'ASSESSOR';
        if (memberRole === 'SUPER_ADMIN') userRole = 'SUPER_ADMIN';
        else if (memberRole === 'TENANT_ADMIN') userRole = 'CLIENT_ADMIN';
        else if (memberRole === 'DEPT_HEAD') userRole = 'DEPT_HEAD';
        else if (memberRole === 'TEAM_LEAD') userRole = 'TEAM_LEAD';
        else if (memberRole === 'MANAGER') userRole = 'MANAGER';
        else if (memberRole === 'EMPLOYEE' || memberRole === 'ASSESSOR') userRole = 'EMPLOYEE';
        else if (memberRole === 'INDIVIDUAL') userRole = 'INDIVIDUAL';

        // 1. Ensure User table record exists (for NextAuth)
        let authUser = await prisma.user.findUnique({ where: { email } });
        try {
            if (!authUser) {
                authUser = await prisma.user.create({
                    data: {
                        email,
                        name,
                        password: hashedPassword,
                        role: userRole,
                        clientId: tenantId,
                        isActive: true,
                        accountType: (type === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'CLIENT_USER') as AccountType
                    }
                });
                console.log(`👤 Created Auth User: ${email} [${userRole}]`);
            } else {
                await prisma.user.update({
                    where: { id: authUser.id },
                    data: { password: hashedPassword, role: userRole, clientId: tenantId, isActive: true }
                });
                console.log(`👤 Updated Auth User: ${email} [${userRole}]`);
            }
        } catch (e: any) {
            console.error(`❌ User Table Error for ${email}:`, e.message);
        }

        // 2. Ensure Member table record exists (for Profile/Logic)
        let member = await prisma.member.findUnique({ where: { email } });
        if (!member) {
            member = await prisma.member.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: memberRole,
                    type,
                    tenantId,
                    isActive: true,
                }
            });
            console.log(`✅ Created Member: ${name} (${email}) [${memberRole}]`);
        } else {
            await prisma.member.update({
                where: { id: member.id },
                data: { password: hashedPassword, role: memberRole, tenantId }
            });
            console.log(`✅ Updated Member: ${name} (${email}) [${memberRole}]`);
        }
        return member;
    };

    // 1. Super Admin
    await ensureUser('superadmin@sudaksha.com', 'SUPER_ADMIN', 'EMPLOYEE', null, 'Super Administrator');

    if (!corpTenant || !eduTenant) {
        console.error('Failed to create required tenants.');
        process.exit(1);
    }

    // 2. Corporate Admin
    await ensureUser('admin@techcorp.com', 'TENANT_ADMIN', 'EMPLOYEE', corpTenant.id, 'Corporate Admin');

    // 3. Institution Admin
    await ensureUser('principal@university.edu', 'TENANT_ADMIN', 'EMPLOYEE', eduTenant.id, 'Institution Principal');

    // 4. Dept Head
    await ensureUser('depthead@techcorp.com', 'DEPT_HEAD', 'EMPLOYEE', corpTenant.id, 'Department Head');

    // 5. Team Lead
    await ensureUser('teamlead@techcorp.com', 'TEAM_LEAD', 'EMPLOYEE', corpTenant.id, 'Team Lead');

    // 6. Corporate Employee
    await ensureUser('employee@techcorp.com', 'ASSESSOR', 'EMPLOYEE', corpTenant.id, 'Jane Employee');

    // 7. Student
    await ensureUser('student@university.edu', 'ASSESSOR', 'STUDENT', eduTenant.id, 'John Student');

    // 8. Individual (B2C)
    await ensureUser('individual@gmail.com', 'ASSESSOR', 'INDIVIDUAL', null, 'Public User');

    // 9. Assessor (External) - Role ASSESSOR, check logic (Assuming INDIVIDUAL type is fine)
    await ensureUser('assessor@expert.com', 'ASSESSOR', 'INDIVIDUAL', null, 'Expert Assessor');

    // 10. Manager
    await ensureUser('manager@techcorp.com', 'MANAGER', 'EMPLOYEE', corpTenant.id, 'Project Manager');


    console.log('\n==========================================');
    console.log('   LOGIN CREDENTIALS (PWD: password123)   ');
    console.log('==========================================');
    const users = [
        ['Super Admin', 'superadmin@sudaksha.com'],
        ['Corp Admin', 'admin@techcorp.com'],
        ['Inst Admin', 'principal@university.edu'],
        ['Dept Head', 'depthead@techcorp.com'],
        ['Team Lead', 'teamlead@techcorp.com'],
        ['Manager', 'manager@techcorp.com'],
        ['Corp Employee', 'employee@techcorp.com'],
        ['Student', 'student@university.edu'],
        ['Individual', 'individual@gmail.com'],
        ['Assessor', 'assessor@expert.com']
    ];

    console.table(users);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
