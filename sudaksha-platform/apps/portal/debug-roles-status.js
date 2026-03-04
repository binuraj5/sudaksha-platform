import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const roles = await prisma.role.findMany({
        where: { tenantId: { not: null } },
        select: { id: true, name: true, tenantId: true, status: true, visibility: true, isActive: true }
    });
    console.log("Org Roles:", roles);

    const unv = await prisma.role.findMany({
        where: { visibility: "UNIVERSAL" },
        select: { id: true, name: true, status: true, visibility: true, isActive: true }
    });
    console.log("Universal Roles:", unv.slice(0, 3));
    process.exit(0);
}

check();
