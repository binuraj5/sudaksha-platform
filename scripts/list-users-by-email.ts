/**
 * List all users with a given email (or all if no arg)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const search = process.argv[2] || "";
    const filter = search
        ? { equals: search.toLowerCase(), mode: "insensitive" as const }
        : undefined;

    console.log("\n--- AdminUser ---");
    const admins = await prisma.adminUser.findMany({
        where: filter ? { email: filter } : {},
        select: { email: true, name: true }
    });
    admins.forEach((a) => console.log(`  ${a.email} (${a.name})`));

    console.log("\n--- User ---");
    const users = await prisma.user.findMany({
        where: filter ? { email: filter } : {},
        select: { email: true, name: true }
    });
    users.forEach((u) => console.log(`  ${u.email} (${u.name})`));

    console.log("\n--- Member (first 20) ---");
    const members = await prisma.member.findMany({
        where: filter ? { email: filter } : {},
        select: { email: true, name: true },
        take: 20
    });
    members.forEach((m) => console.log(`  ${m.email} (${m.name})`));

    if (!filter && members.length === 20) {
        const total = await prisma.member.count();
        console.log(`  ... and ${total - 20} more members`);
    }
    console.log("");
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
