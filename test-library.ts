import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const libs = await prisma.componentLibrary.findMany({ take: 2 });
    console.log(JSON.stringify(libs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
