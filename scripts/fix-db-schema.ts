import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🛠 Starting DB Schema Fix...');
    try {
        // User fixes
        await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "userType" text DEFAULT \'TENANT\';');

        // Member fixes
        await prisma.$executeRawUnsafe('ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "status" text DEFAULT \'PENDING\';');
        await prisma.$executeRawUnsafe('ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "invitationToken" text;');
        await prisma.$executeRawUnsafe('ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "invitationSentAt" timestamp;');
        await prisma.$executeRawUnsafe('ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "invitationAcceptedAt" timestamp;');
        await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Member_invitationToken_key" ON "Member"("invitationToken");');

        // AdminUser table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "AdminUser" (
                "id" TEXT PRIMARY KEY,
                "email" TEXT UNIQUE NOT NULL,
                "name" TEXT NOT NULL,
                "passwordHash" TEXT NOT NULL,
                "twoFactorSecret" TEXT,
                "isActive" BOOLEAN DEFAULT true,
                "lastLoginAt" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tenant slug cleanup
        await prisma.$executeRawUnsafe(`
            UPDATE "Tenant" 
            SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'))
            WHERE "slug" IS NULL OR "slug" = '';
        `);

        // OrganizationUnit fixes
        await prisma.$executeRawUnsafe('ALTER TABLE "OrganizationUnit" ADD COLUMN IF NOT EXISTS "description" text;');
        await prisma.$executeRawUnsafe('ALTER TABLE "OrganizationUnit" ADD COLUMN IF NOT EXISTS "parentId" text;');
        await prisma.$executeRawUnsafe('ALTER TABLE "OrganizationUnit" ADD COLUMN IF NOT EXISTS "managerId" text;');
        await prisma.$executeRawUnsafe('ALTER TABLE "OrganizationUnit" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;');

        console.log('✅ Synchronized Tenant, Member, User, and AdminUser schema changes.');

        console.log('✅ Synchronized Tenant, Member, and OrganizationUnit columns exhaustively.');
    } catch (error: any) {
        console.error('❌ Error adding column:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
