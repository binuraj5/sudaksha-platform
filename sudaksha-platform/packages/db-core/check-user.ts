import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.user.findUnique({
        where: { id: 'cmlrqwyad0003ma5we8ptz1d6' },
        select: { clientId: true }
    });
    console.log('USER FROM DB-CORE:', user);
}

run().catch(console.error).finally(() => prisma.$disconnect());
