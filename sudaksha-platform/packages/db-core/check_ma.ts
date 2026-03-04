const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@localhost:5433/sudaksha-core?schema=public"
        }
    }
})

async function main() {
    const memberAssessments = await prisma.memberAssessment.findMany({
        include: {
            member: {
                select: { email: true, name: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })
    console.log("=== RECENT MEMBER ASSESSMENTS ===")
    console.log(JSON.stringify(memberAssessments, null, 2))

    const assessments = await prisma.assessmentModel.findMany({
        where: {
            isActive: true
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
            id: true,
            name: true,
            status: true,
            metadata: true
        }
    });

    console.log("\n=== RECENT MODELS ===")
    console.log(JSON.stringify(assessments, null, 2));

    const authUser = await prisma.user.findUnique({ where: { email: 'admin@tnz-ict.com' } });
    console.log("\nUser:", authUser?.id);
    const member = await prisma.member.findFirst({ where: { email: 'admin@tnz-ict.com' } });
    console.log("Member:", member?.id);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
