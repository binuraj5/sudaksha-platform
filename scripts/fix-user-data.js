
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@tra.gov.in';

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log(`User ${email} not found`);
        return;
    }

    console.log("Current State:", {
        email: user.email,
        role: user.role,
        accountType: user.accountType
    });

    if (user.role === 'CLIENT_ADMIN' && user.accountType !== 'CLIENT_ADMIN') {
        const updated = await prisma.user.update({
            where: { email },
            data: { accountType: 'CLIENT_ADMIN' }
        });
        console.log("Updated State:", {
            email: updated.email,
            role: updated.role,
            accountType: updated.accountType
        });
    } else {
        console.log("No update needed or profile mismatch.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
