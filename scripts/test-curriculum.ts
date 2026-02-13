import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING VERIFICATION ---');

    // 1. Create Test Institution Tenant
    const slug = `test-inst-${Date.now()}`;
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Test University',
            email: `${slug}@example.com`,
            slug: slug,
            type: 'INSTITUTION',
            isActive: true,
            subscriptionStart: new Date(),
            createdBy: 'system-test'
        }
    });
    console.log(`✅ Created Institution Tenant: ${tenant.id} (${tenant.slug})`);

    // 2. Verify Hierarchy Creation
    // Level 1: Program
    const program = await prisma.curriculumNode.create({
        data: {
            tenantId: tenant.id,
            type: 'PROGRAM',
            name: 'Engineering',
            code: 'ENG01',
        }
    });
    console.log(`✅ Created Program: ${program.name}`);

    // Level 2: Department
    const dept = await prisma.curriculumNode.create({
        data: {
            tenantId: tenant.id,
            type: 'DEPARTMENT',
            name: 'Computer Science',
            code: 'CS',
            parentId: program.id
        }
    });
    console.log(`✅ Created Department: ${dept.name}`);

    // Level 3: Subject
    const subject = await prisma.curriculumNode.create({
        data: {
            tenantId: tenant.id,
            type: 'SUBJECT',
            name: 'Data Structures',
            code: 'CS201',
            parentId: dept.id
        }
    });
    console.log(`✅ Created Subject: ${subject.name}`);

    // Level 4: Topic
    const topic = await prisma.curriculumNode.create({
        data: {
            tenantId: tenant.id,
            type: 'TOPIC',
            name: 'Binary Trees',
            code: 'BT01',
            parentId: subject.id
        }
    });
    console.log(`✅ Created Topic: ${topic.name}`);

    // 3. Verify Retrieval with Counts
    const rootNodes = await prisma.curriculumNode.findMany({
        where: { tenantId: tenant.id, parentId: null },
        include: {
            _count: { select: { children: true } }
        }
    });

    if (rootNodes.length === 1 && rootNodes[0].name === 'Engineering' && rootNodes[0]._count.children === 1) {
        console.log('✅ Hierarchy Retrieval verified');

        // Deep check
        const subNodes = await prisma.curriculumNode.findMany({
            where: { parentId: rootNodes[0].id },
            include: { _count: { select: { children: true } } }
        });
        console.log(`✅ Level 2 verified: Found ${subNodes.length} children under root`);
    } else {
        console.error('❌ Hierarchy Retrieval failed', JSON.stringify(rootNodes, null, 2));
    }

    console.log('--- VERIFICATION COMPLETE ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
