import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Syncing approved competency requests to ApprovalRequest queue...");
    const reqs = await prisma.competencyDevelopmentRequest.findMany({
        where: { status: 'APPROVED' }
    });

    let count = 0;
    for (const r of reqs) {
        const update = await prisma.approvalRequest.updateMany({
            where: { entityId: r.id, type: 'COMPETENCY' as any, status: 'PENDING' },
            data: { status: 'APPROVED', comments: 'Auto-synced: Competency already created.' }
        });
        count += update.count;
    }

    console.log(`Successfully synced ${count} stale ApprovalRequest rows to APPROVED.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
