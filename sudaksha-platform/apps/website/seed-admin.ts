import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding AdminUser...");

    const email = "binuraj@sudaksha.com";
    const password = "Admin@123";
    const name = "Binu Raj";

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            name: name,
            isActive: true,
        },
        create: {
            email: email,
            passwordHash: hashedPassword,
            name: name,
            isActive: true,
        },
    });

    console.log("AdminUser seeded successfully:", {
        id: admin.id,
        email: admin.email,
        name: admin.name,
    });
}

main()
    .catch((e) => {
        console.error("Error seeding AdminUser:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
