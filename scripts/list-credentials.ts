
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Listing Test Credentials for all User Types...');

    // Enum-based roles
    const roles: { label: string, filter: any }[] = [
        { label: 'SUPER ADMIN', filter: { role: 'SUPER_ADMIN' } },
        { label: 'CORPORATE ADMIN', filter: { role: 'TENANT_ADMIN', tenant: { type: 'CORPORATE' } } },
        { label: 'INSTITUTION ADMIN', filter: { role: 'TENANT_ADMIN', tenant: { type: 'INSTITUTION' } } },

        // Employee / Student / B2C
        { label: 'EMPLOYEE', filter: { role: 'EMPLOYEE', type: 'EMPLOYEE' } },
        { label: 'STUDENT', filter: { role: 'STUDENT', type: 'STUDENT' } },
        { label: 'INDIVIDUAL (B2C)', filter: { role: 'INDIVIDUAL', type: 'INDIVIDUAL' } },
        { label: 'ASSESSOR', filter: { role: 'ASSESSOR' } }
    ];


    // Derived Roles
    const deptHead = await prisma.member.findFirst({
        where: { managedUnits: { some: { type: 'DEPARTMENT' } } },
        select: { email: true }
    });

    const teamLead = await prisma.member.findFirst({
        where: { managedUnits: { some: { type: 'TEAM' } } },
        select: { email: true }
    });

    console.log('\n--- CREDENTIALS (Password: password123) ---');

    // Derived
    if (deptHead) console.log(`[DEPARTMENT HEAD]: ${deptHead.email} (Derived)`);
    else console.log(`[DEPARTMENT HEAD]: -- Not Found --`);

    if (teamLead) console.log(`[TEAM LEAD]: ${teamLead.email} (Derived)`);
    else console.log(`[TEAM LEAD]: -- Not Found --`);

    // Standard
    for (const r of roles) {
        try {
            const user = await prisma.member.findFirst({
                where: r.filter,
                include: { tenant: { select: { type: true } } },
                orderBy: { createdAt: 'asc' }
            });

            if (user) {
                console.log(`[${r.label}]: ${user.email}`);
            } else {
                console.log(`[${r.label}]: -- Not Found --`);
            }
        } catch (e) {
            console.log(`[${r.label}]: Error querying (Role might vary in schema)`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
