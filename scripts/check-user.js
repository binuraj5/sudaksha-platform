
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@tra.gov.in' }
    });
    if (user) {
        console.log("USER_DATA_START");
        console.log(JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            clientId: user.clientId,
            name: user.name
        }, null, 2));
        console.log("USER_DATA_END");

        if (user.clientId) {
            const client = await prisma.client.findUnique({
                where: { id: user.clientId }
            });
            console.log("CLIENT_DATA_START");
            console.log(JSON.stringify(client, null, 2));
            console.log("CLIENT_DATA_END");
        }
    } else {
        console.log("User not found");
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
