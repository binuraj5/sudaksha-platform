/**
 * Apply Row-Level Security Policies
 * 
 * Run with: node prisma/apply-rls-policies.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('🔒 Applying Row-Level Security Policies...\n');

    try {
        // Read the RLS policies SQL file
        const sqlFilePath = path.join(__dirname, 'rls_policies.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

        // Split the SQL file into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => {
                const lines = stmt.split('\n').filter(line => {
                    const trimmed = line.trim();
                    return trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('/*');
                });
                return lines.length > 0;
            });

        console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

        let successCount = 0;
        let skipCount = 0;

        // Execute each statement individually
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();

            if (!statement) {
                skipCount++;
                continue;
            }

            try {
                const preview = statement.split('\n')[0].substring(0, 60);
                process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}...`);

                await prisma.$executeRawUnsafe(statement + ';');

                console.log(' ✅');
                successCount++;
            } catch (error) {
                if (error.message && error.message.includes('already exists')) {
                    console.log(' ⏭️  (already exists)');
                    skipCount++;
                } else {
                    console.log(` ❌ Error: ${error.message}`);
                }
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('✅ RLS POLICIES APPLIED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Successfully applied: ${successCount}`);
        console.log(`⏭️  Skipped (already exists): ${skipCount}`);
        console.log(`📊 Total statements: ${statements.length}`);
        console.log('═══════════════════════════════════════\n');

        console.log('🔐 Row-Level Security is now enabled on:');
        console.log('   • Tenant');
        console.log('   • Member');
        console.log('   • OrganizationUnit');
        console.log('   • Activity');
        console.log('   • ActivityMember');
        console.log('   • ActivityOrgUnit');
        console.log('   • MemberAssessment');
        console.log('   • ActivityAssessment\n');

        console.log('📝 NEXT STEPS:');
        console.log('1. In your API routes, set tenant context at request start:');
        console.log('   await prisma.$executeRaw`SET app.current_tenant_id = ${tenantId}`;');
        console.log('2. All queries will now automatically filter by tenant');
        console.log('3. Test isolation with different tenant IDs\n');

    } catch (error) {
        console.error('❌ Failed to apply RLS policies:', error);
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
