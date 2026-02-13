
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const memberCount = await prisma.member.count();
        console.log(`Count in Member table: ${memberCount}`);

        const members = await prisma.member.findMany({
            take: 10,
            select: { email: true, role: true }
        });
        console.log('Sample Members:');
        members.forEach(m => console.log(`- ${m.email} (${m.role})`));

        try {
            const userCount = await (prisma as any).user.count();
            console.log(`Count in User table: ${userCount}`);
        } catch (e) {
            console.log('User model not found or error accessing it.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}
main();
