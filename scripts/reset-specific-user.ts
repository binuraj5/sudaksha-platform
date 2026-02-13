/**
 * Reset password for a specific email (e.g. info@tra.tz)
 * Usage: npx tsx scripts/reset-specific-user.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TARGET_EMAIL = "info@tra.tz";
const NEW_PASSWORD = "password123";

async function main() {
    const emailFilter = { equals: TARGET_EMAIL.toLowerCase(), mode: "insensitive" as const };

    console.log(`\n🔍 Looking for: ${TARGET_EMAIL}\n`);

    // AdminUser
    const adminUser = await prisma.adminUser.findFirst({
        where: { email: emailFilter }
    });
    if (adminUser) {
        const hash = await bcrypt.hash(NEW_PASSWORD, 10);
        await prisma.adminUser.update({
            where: { id: adminUser.id },
            data: { passwordHash: hash }
        });
        console.log("✅ Found in AdminUser – password reset.");
        console.log("\n📧 CREDENTIALS:");
        console.log(`   Email:    ${adminUser.email}`);
        console.log(`   Password: ${NEW_PASSWORD}`);
        console.log(`   (Use at /assessments/auth/admin/login for Super Admin)\n`);
        return;
    }

    // User
    const user = await prisma.user.findFirst({
        where: { email: emailFilter }
    });
    if (user) {
        const hash = await bcrypt.hash(NEW_PASSWORD, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hash, failedAttempts: 0, lockoutUntil: null }
        });
        console.log("✅ Found in User – password reset.");
        console.log("\n📧 CREDENTIALS:");
        console.log(`   Email:    ${user.email}`);
        console.log(`   Password: ${NEW_PASSWORD}`);
        console.log(`   (Use at /assessments/login)\n`);
        return;
    }

    // Member
    const member = await prisma.member.findFirst({
        where: { email: emailFilter }
    });
    if (member) {
        const hash = await bcrypt.hash(NEW_PASSWORD, 10);
        await prisma.member.update({
            where: { id: member.id },
            data: { password: hash }
        });
        console.log("✅ Found in Member – password reset.");
        console.log("\n📧 CREDENTIALS:");
        console.log(`   Email:    ${member.email}`);
        console.log(`   Password: ${NEW_PASSWORD}`);
        console.log(`   (Use at /assessments/login)\n`);
        return;
    }

    console.log("❌ No account found with that email in AdminUser, User, or Member.\n");
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
