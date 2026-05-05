import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const admin = await prisma.adminUser.findFirst({ where: { email: { contains: "admin", mode: "insensitive" } } });
    console.log("AdminUser:", admin);
    const user = await prisma.user.findFirst({ where: { email: { contains: "admin", mode: "insensitive" } } });
    console.log("User:", user);
    const superAdminFallback = await prisma.adminUser.findFirst({ where: { email: "superadmin@sudaksha.com"} });
    console.log("SuperAdmin:", superAdminFallback);
}
main().finally(() => prisma.$disconnect());
