/**
 * Data Migration Script: Legacy Models → Unified Models
 * 
 * This script migrates data from:
 * - Client → Tenant
 * - User → Member  
 * - Department → OrganizationUnit
 * - Project → Activity
 * 
 * Run with: npx ts-node prisma/migrate-to-unified-models.ts
 */

import { PrismaClient, TenantType, MemberType, MemberRole, UnitType, ActivityType, ActivityStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting data migration to unified models...\n');

    try {
        // ============================================
        // STEP 1: Migrate Client → Tenant
        // ============================================
        console.log('📦 Step 1: Migrating Client → Tenant...');

        const clients = await prisma.client.findMany({
            include: {
                settings: true,
            },
        });

        for (const client of clients) {
            const existingTenant = await prisma.tenant.findUnique({
                where: { slug: client.slug },
            });

            if (existingTenant) {
                console.log(`  ⏭️  Tenant "${client.name}" already exists, skipping...`);
                continue;
            }

            const tenant = await prisma.tenant.create({
                data: {
                    id: client.id, // Preserve ID for relationship integrity
                    name: client.name,
                    slug: client.slug,
                    type: TenantType.CORPORATE, // Default to CORPORATE
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    logo: client.logo,
                    brandColor: client.brandColor,
                    isActive: client.isActive,
                    plan: client.plan as any, // TenantPlan matches ClientPlan
                    subscriptionStart: client.subscriptionStart,
                    subscriptionEnd: client.subscriptionEnd,
                    maxMembers: client.maxUsers,
                    maxActivities: client.maxProjects,
                    createdBy: client.createdBy,
                    createdAt: client.createdAt,
                    updatedAt: client.updatedAt,
                    settings: client.settings ? {
                        create: {
                            primaryColor: client.settings.primaryColor,
                            secondaryColor: client.settings.secondaryColor,
                            logoUrl: client.settings.logoUrl,
                            faviconUrl: client.settings.faviconUrl,
                            customDomain: client.settings.customDomain,
                            enableOrgUnits: client.settings.enableDepartments,
                            enableManagers: client.settings.enableManagers,
                            enableCustomTemplates: client.settings.enableCustomTemplates,
                            emailFromName: client.settings.emailFromName,
                            emailFromAddress: client.settings.emailFromAddress,
                            smtpConfig: client.settings.smtpConfig || {},
                        },
                    } : undefined,
                },
            });

            console.log(`  ✅ Migrated: ${client.name} → Tenant [${tenant.id}]`);
        }

        console.log(`\n✨ Migrated ${clients.length} clients to tenants\n`);

        // ============================================
        // STEP 2: Migrate User → Member
        // ============================================
        console.log('👤 Step 2: Migrating User → Member...');

        const users = await prisma.user.findMany();

        for (const user of users) {
            const existingMember = await prisma.member.findUnique({
                where: { email: user.email },
            });

            if (existingMember) {
                console.log(`  ⏭️  Member "${user.name}" already exists, skipping...`);
                continue;
            }

            // Map accountType to MemberType
            let memberType: MemberType;
            if (user.accountType === 'CLIENT_ADMIN') {
                memberType = MemberType.EMPLOYEE;
            } else if (user.accountType === 'CLIENT_USER') {
                memberType = MemberType.EMPLOYEE;
            } else {
                memberType = MemberType.INDIVIDUAL;
            }

            // Map userRole to MemberRole
            let memberRole: MemberRole;
            if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
                memberRole = MemberRole.SUPER_ADMIN;
            } else if (user.role === 'CLIENT_ADMIN') {
                memberRole = MemberRole.TENANT_ADMIN;
            } else if (user.role === 'MANAGER' || user.role === 'PROJECT_MANAGER') {
                memberRole = MemberRole.MANAGER;
            } else {
                memberRole = MemberRole.ASSESSOR;
            }

            const member = await prisma.member.create({
                data: {
                    id: user.id, // Preserve ID
                    tenantId: user.clientId,
                    type: memberType,
                    role: memberRole,
                    email: user.email,
                    password: user.password,
                    name: user.name,
                    externalId: user.employeeId,
                    orgUnitId: user.departmentId,
                    isActive: user.isActive,
                    emailVerified: user.emailVerified,
                    // phone: user.phone,
                    // avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            });

            console.log(`  ✅ Migrated: ${user.name} → Member [${member.id}]`);
        }

        console.log(`\n✨ Migrated ${users.length} users to members\n`);

        // ============================================
        // STEP 3: Migrate Department → OrganizationUnit
        // ============================================
        console.log('🏢 Step 3: Migrating Department → OrganizationUnit...');

        const departments = await prisma.department.findMany();

        for (const dept of departments) {
            const existingUnit = await prisma.organizationUnit.findFirst({
                where: {
                    tenantId: dept.projectId, // Note: projectId maps to tenantId
                    code: dept.code,
                },
            });

            if (existingUnit) {
                console.log(`  ⏭️  OrganizationUnit "${dept.name}" already exists, skipping...`);
                continue;
            }

            const orgUnit = await prisma.organizationUnit.create({
                data: {
                    id: dept.id, // Preserve ID
                    tenantId: dept.projectId, // Map project to tenant
                    type: UnitType.DEPARTMENT,
                    name: dept.name,
                    code: dept.code,
                    description: dept.description,
                    managerId: dept.headOfDepartment, // If it's a user ID
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                },
            });

            console.log(`  ✅ Migrated: ${dept.name} → OrganizationUnit [${orgUnit.id}]`);
        }

        console.log(`\n✨ Migrated ${departments.length} departments to organization units\n`);

        // ============================================
        // STEP 4: Migrate Project → Activity
        // ============================================
        console.log('📋 Step 4: Migrating Project → Activity...');

        const projects = await prisma.project.findMany();

        for (const project of projects) {
            const existingActivity = await prisma.activity.findFirst({
                where: {
                    tenantId: project.clientId,
                    slug: project.slug,
                },
            });

            if (existingActivity) {
                console.log(`  ⏭️  Activity "${project.name}" already exists, skipping...`);
                continue;
            }

            // Map ProjectStatus to ActivityStatus
            let activityStatus: ActivityStatus;
            if (project.status === 'DRAFT') activityStatus = ActivityStatus.DRAFT;
            else if (project.status === 'ACTIVE') activityStatus = ActivityStatus.ACTIVE;
            else if (project.status === 'PAUSED') activityStatus = ActivityStatus.PAUSED;
            else if (project.status === 'COMPLETED') activityStatus = ActivityStatus.COMPLETED;
            else activityStatus = ActivityStatus.ARCHIVED;

            const activity = await prisma.activity.create({
                data: {
                    id: project.id, // Preserve ID
                    tenantId: project.clientId,
                    type: ActivityType.PROJECT,
                    name: project.name,
                    slug: project.slug,
                    description: project.description,
                    status: activityStatus,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    createdBy: project.createdBy,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                },
            });

            console.log(`  ✅ Migrated: ${project.name} → Activity [${activity.id}]`);

            // Migrate project users to ActivityMember
            const projectUsers = await prisma.user.findMany({
                where: { projectId: project.id },
            });

            for (const user of projectUsers) {
                const existingActivityMember = await prisma.activityMember.findFirst({
                    where: {
                        activityId: activity.id,
                        memberId: user.id,
                    },
                });

                if (!existingActivityMember) {
                    await prisma.activityMember.create({
                        data: {
                            activityId: activity.id,
                            memberId: user.id,
                            role: 'PARTICIPANT',
                        },
                    });
                }
            }

            console.log(`    ↳ Added ${projectUsers.length} members to activity`);
        }

        console.log(`\n✨ Migrated ${projects.length} projects to activities\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('═══════════════════════════════════════');
        console.log('✅ MIGRATION COMPLETE!');
        console.log('═══════════════════════════════════════');
        console.log(`📦 Tenants created: ${clients.length}`);
        console.log(`👤 Members created: ${users.length}`);
        console.log(`🏢 OrganizationUnits created: ${departments.length}`);
        console.log(`📋 Activities created: ${projects.length}`);
        console.log('═══════════════════════════════════════\n');

        console.log('⚠️  NEXT STEPS:');
        console.log('1. Verify data integrity in database');
        console.log('2. Update API routes to use new models');
        console.log('3. Update frontend components');
        console.log('4. Apply RLS policies: psql -d DB_NAME -f prisma/rls_policies.sql');
        console.log('5. Test multi-tenant isolation');
        console.log('6. Gradually phase out legacy models\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
