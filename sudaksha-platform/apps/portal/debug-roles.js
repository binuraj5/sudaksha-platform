const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const members = await prisma.member.findMany({
        select: { email: true, role: true, tenantId: true, user: { select: { email: true } } }
    });
    console.log("All members:", members.slice(0, 5));
    process.exit(0);
}

check();
