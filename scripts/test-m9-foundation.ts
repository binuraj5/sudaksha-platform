import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Checking AssessmentModel table...");
        const count = await prisma.assessmentModel.count();
        console.log(`AssessmentModel table exists. Count: ${count}`);

        console.log("Creating test model...");
        const model = await prisma.assessmentModel.create({
            data: {
                name: "Test Foundation Model",
                code: "ASM-TEST-001",
                description: "Testing foundation implementation",
                sourceType: "CUSTOM",
                createdBy: "system-test",
                status: "DRAFT"
            }
        });
        console.log(`Success! Created model: ${model.id}`);

        await prisma.assessmentModel.delete({ where: { id: model.id } });
        console.log("Deleted test model.");
    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
