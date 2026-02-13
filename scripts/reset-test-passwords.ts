
import { PrismaClient, MemberRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting password reset for all users...');

    // Default password: password123
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    try {
        // 1. Update User table (NextAuth)
        const userResult = await prisma.user.updateMany({
            data: {
                password: hashedPassword
            }
        });
        console.log(`✅ Updated ${userResult.count} users with password: password123`);

        // 2. Update Member table (Profiles)
        const updateResult = await prisma.member.updateMany({
            data: {
                password: hashedPassword
            }
        });
        console.log(`✅ Updated ${updateResult.count} members with password: password123`);

        // List credentials for reference
        const admins = await prisma.member.findMany({
            where: { role: { in: [MemberRole.SUPER_ADMIN, MemberRole.TENANT_ADMIN] } },
            select: { email: true, role: true, type: true }
        });

        console.log('\n🔐 ADMIN CREDENTIALS (password123):');
        admins.forEach(a => console.log(`- ${a.email} [${a.role}]`));

    } catch (error) {
        console.error('Error updating passwords:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
