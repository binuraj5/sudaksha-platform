import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addEnumValue(enumName: string, value: string) {
    console.log(`Checking enum ${enumName} for value ${value}...`);
    try {
        // We use a DO block to safely add values without failing if they already exist
        const sql = `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_enum 
                    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
                    WHERE pg_type.typname = '${enumName}' AND pg_enum.enumlabel = '${value}'
                ) THEN
                    ALTER TYPE "${enumName}" ADD VALUE '${value}';
                END IF;
            END
            $$;
        `;
        await prisma.$executeRawUnsafe(sql);
        console.log(`  ✅ Ensured ${value} exists in ${enumName}`);
    } catch (err: any) {
        console.error(`  ❌ Failed to ensure ${value} in ${enumName}:`, err.message);
    }
}

async function main() {
    console.log('🛠 Starting Enum Fix...');

    // UserRole
    const userRoles = ['EMPLOYEE', 'INDIVIDUAL', 'DEPT_HEAD', 'TEAM_LEAD', 'ASSESSOR', 'MANAGER', 'PROJECT_MANAGER', 'CLIENT_ADMIN', 'SUPER_ADMIN'];
    for (const role of userRoles) {
        await addEnumValue('UserRole', role);
    }

    // MemberRole
    const memberRoles = ['EMPLOYEE', 'INDIVIDUAL', 'DEPT_HEAD', 'TEAM_LEAD', 'ASSESSOR', 'MANAGER', 'TENANT_ADMIN', 'SUPER_ADMIN'];
    for (const role of memberRoles) {
        await addEnumValue('MemberRole', role);
    }

    // AccountType
    const accountTypes = ['INDIVIDUAL', 'CLIENT_ADMIN', 'CLIENT_USER'];
    for (const type of accountTypes) {
        await addEnumValue('AccountType', type);
    }

    console.log('✅ Enum fix complete.');
    await prisma.$disconnect();
}

main();
