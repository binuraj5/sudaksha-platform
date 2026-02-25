import { prisma } from '@/lib/prisma';

async function migrateStaffProfiles() {
    console.log('Starting migration of staff profiles...');

    // Find all members who are dept heads or class teachers in institutions
    const staff = await prisma.member.findMany({
        where: {
            tenant: { type: 'INSTITUTION' },
            OR: [
                { facultyType: { in: ['CLASS_TEACHER', 'PROFESSOR', 'LECTURER', 'INSTRUCTOR'] } },
                { designation: { contains: 'Teacher', mode: 'insensitive' } },
                { designation: { contains: 'Professor', mode: 'insensitive' } },
                { designation: { contains: 'Head', mode: 'insensitive' } }
            ]
        }
    });

    if (staff.length === 0) {
        console.log('No institution staff found to migrate.');
        process.exit(0);
    }

    // Set their profile type to RESTRICTED
    await prisma.member.updateMany({
        where: { id: { in: staff.map(s => s.id) } },
        data: { profileType: 'RESTRICTED' }
    });

    console.log(`Updated ${staff.length} staff profiles to RESTRICTED.`);
    process.exit(0);
}

migrateStaffProfiles().catch((e) => {
    console.error(e);
    process.exit(1);
});
