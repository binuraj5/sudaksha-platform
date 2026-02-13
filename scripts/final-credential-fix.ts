import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🚀 Starting Final Prisma-based Credential Fix...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    try {
        // 1. Ensure Organizations
        const orgs = [
            { id: 'cli_techcorp_001', name: 'Tech Corp', slug: 'tech-corp', type: 'CORPORATE' as any },
            { id: 'cli_univedu_001', name: 'University Edu', slug: 'university-edu', type: 'INSTITUTION' as any }
        ];

        const orgSlugToId: Record<string, string> = {};

        for (const org of orgs) {
            console.log(`Ensuring org: ${org.name}`);
            const tenant = await (prisma.tenant as any).upsert({
                where: { slug: org.slug },
                update: { name: org.name, type: org.type },
                create: {
                    id: org.id,
                    name: org.name,
                    slug: org.slug,
                    type: org.type,
                    email: `contact@${org.slug}.com`,
                    isActive: true,
                    createdBy: 'system',
                    subscriptionStart: new Date()
                }
            });

            const client = await (prisma.client as any).upsert({
                where: { slug: org.slug },
                update: { name: org.name },
                create: {
                    id: org.id,
                    name: org.name,
                    slug: org.slug,
                    email: `contact@${org.slug}.com`,
                    isActive: true,
                    createdBy: 'system',
                    subscriptionStart: new Date()
                }
            });
            orgSlugToId[org.slug] = client.id;
        }

        // 2. Ensure Users
        const users = [
            { email: 'superadmin@sudaksha.com', name: 'Super Admin', role: 'SUPER_ADMIN' as any, memberRole: 'SUPER_ADMIN' as any, orgSlug: null, type: 'EMPLOYEE' as any },
            { email: 'admin@techcorp.com', name: 'Tech Admin', role: 'CLIENT_ADMIN' as any, memberRole: 'TENANT_ADMIN' as any, orgSlug: 'tech-corp', type: 'EMPLOYEE' as any },
            { email: 'principal@university.edu', name: 'Univ Principal', role: 'CLIENT_ADMIN' as any, memberRole: 'TENANT_ADMIN', orgSlug: 'university-edu', type: 'EMPLOYEE' as any },
            { email: 'depthead@techcorp.com', name: 'Dept Head', role: 'DEPT_HEAD' as any, memberRole: 'DEPT_HEAD' as any, orgSlug: 'tech-corp', type: 'EMPLOYEE' as any },
            { email: 'teamlead@techcorp.com', name: 'Team Lead', role: 'TEAM_LEAD' as any, memberRole: 'TEAM_LEAD' as any, orgSlug: 'tech-corp', type: 'EMPLOYEE' as any },
            { email: 'employee@techcorp.com', name: 'Jane Employee', role: 'EMPLOYEE' as any, memberRole: 'ASSESSOR' as any, orgSlug: 'tech-corp', type: 'EMPLOYEE' as any },
            { email: 'student@university.edu', name: 'Bob Student', role: 'EMPLOYEE' as any, memberRole: 'ASSESSOR' as any, orgSlug: 'university-edu', type: 'EMPLOYEE' as any },
            { email: 'individual@gmail.com', name: 'John Doe', role: 'INDIVIDUAL' as any, memberRole: 'INDIVIDUAL' as any, orgSlug: null, type: 'INDIVIDUAL' as any },
            { email: 'assessor@sudaksha.com', name: 'Expert Assessor', role: 'ASSESSOR' as any, memberRole: 'ASSESSOR' as any, orgSlug: null, type: 'EMPLOYEE' as any },
            { email: 'manager@techcorp.com', name: 'Project Manager', role: 'MANAGER' as any, memberRole: 'MANAGER' as any, orgSlug: 'tech-corp', type: 'EMPLOYEE' as any }
        ];

        for (const u of users) {
            const clientId = u.orgSlug ? orgSlugToId[u.orgSlug] : null;

            // User for Auth
            const accountType = u.type === 'INDIVIDUAL' ? 'INDIVIDUAL' :
                (u.role === 'CLIENT_ADMIN' ? 'CLIENT_ADMIN' : 'CLIENT_USER');

            console.log(`Ensuring user: ${u.email} (Role: ${u.role}, AccType: ${accountType})`);

            try {
                await prisma.user.upsert({
                    where: { email: u.email },
                    update: {
                        password: hashedPassword,
                        role: u.role,
                        clientId: clientId,
                        accountType: accountType as any
                    },
                    create: {
                        id: `u_${u.email.replace(/[@.]/g, '_')}`,
                        email: u.email,
                        password: hashedPassword,
                        name: u.name,
                        role: u.role,
                        clientId: clientId,
                        accountType: accountType as any,
                        isActive: true
                    }
                });
                console.log(`  ✅ User table updated`);

                // Member for Profile
                await prisma.member.upsert({
                    where: { email: u.email },
                    update: {
                        password: hashedPassword,
                        role: u.memberRole,
                        tenantId: clientId,
                        type: u.type
                    },
                    create: {
                        id: `m_${u.email.replace(/[@.]/g, '_')}`,
                        email: u.email,
                        password: hashedPassword,
                        name: u.name,
                        role: u.memberRole,
                        tenantId: clientId,
                        type: u.type,
                        isActive: true
                    } as any
                });
                console.log(`  ✅ Member table updated`);
            } catch (err: any) {
                console.error(`  ❌ Failed for ${u.email}:`, err.message);
            }
        }

        const count = await prisma.user.count();
        console.log(`✅ TOTAL USERS IN DB: ${count}`);
        console.log('✅ Synchronized all 10 UAT Personas.');
    } catch (error: any) {
        console.error('❌ Prisma fix failed:', error.message);
        if (error.code) console.error('Error code:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

main();
