/**
 * Create info@tra.tz user with known password
 * Usage: npx tsx scripts/create-info-tra-user.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "info@tra.tz";
const PASSWORD = "password123";
const NAME = "TRA User";

async function main() {
    const emailFilter = { equals: EMAIL.toLowerCase(), mode: "insensitive" as const };

    // Check if already exists
    const existingUser = await prisma.user.findFirst({
        where: { email: emailFilter }
    });
    if (existingUser) {
        const hash = await bcrypt.hash(PASSWORD, 10);
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hash, failedAttempts: 0, lockoutUntil: null }
        });
        console.log("\n✅ User already exists – password reset.");
    } else {
        const hash = await bcrypt.hash(PASSWORD, 10);
        await prisma.user.create({
            data: {
                email: EMAIL,
                password: hash,
                name: NAME,
                role: "ASSESSOR",
                userType: "TENANT",
                accountType: "INDIVIDUAL",
                isActive: true
            }
        });
        console.log("\n✅ User created.");
    }

    console.log("\n📧 LOGIN CREDENTIALS:");
    console.log("   Email:    " + EMAIL);
    console.log("   Password: " + PASSWORD);
    console.log("\n   Use at: /assessments/login\n");
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
