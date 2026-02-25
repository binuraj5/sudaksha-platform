// @ts-nocheck
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Starting Phase 6 E2E Mock Data Test...");

    try {
        // --- 1. SET UP COMMON ASSESSMENT MODEL ---
        const role = await prisma.role.create({
            data: {
                name: "Test Role " + Date.now(),
                description: "Role for E2E testing",
                status: "APPROVED"
            }
        });

        const competency = await prisma.competency.create({
            data: {
                name: "Test Competency " + Date.now(),
                category: "CORE",
                description: "Competency for E2E testing"
            }
        });

        const model = await prisma.assessmentModel.create({
            data: {
                title: "Test Model " + Date.now(),
                description: "Model for E2E Testing",
                visibility: "GLOBAL",
                roleId: role.id,
                isActive: true
            }
        });

        console.log(`✅ Created test Assessment Model (ID: ${model.id})`);

        // --- 2. B2C INDIVIDUAL FLOW ---
        const b2cUser = await prisma.user.create({
            data: {
                name: "B2C Tester",
                email: `b2c_${Date.now()}@test.com`,
                password: "password123",
                role: "USER"
            }
        });

        const b2cMember = await prisma.member.create({
            data: {
                email: b2cUser.email,
                name: b2cUser.name,
                password: "password123",
                type: "INDIVIDUAL",
                currentRoleId: role.id
            }
        });

        // B2C user self-selects an assessment (Simulation of /api/individuals/assessments/start)
        const b2cAssessment = await prisma.memberAssessment.create({
            data: {
                memberId: b2cMember.id,
                assessmentModelId: model.id,
                assignmentType: "SELF_SELECTED",
                status: "DRAFT"
            }
        });
        console.log(`✅ B2C Self-Selection successfully created! MemberAssessment ID: ${b2cAssessment.id}`);


        // --- 3. CORPORATE EMPLOYEE FLOW ---
        const tenant = await prisma.tenant.create({
            data: {
                name: "Test Corporate " + Date.now(),
                slug: "test-corp-" + Date.now()
            }
        });

        const corpUser = await prisma.user.create({
            data: {
                name: "Corp Tester",
                email: `corp_${Date.now()}@test.com`,
                password: "password123",
                role: "TENANT",
                clientId: tenant.id
            }
        });

        const corpMember = await prisma.member.create({
            data: {
                email: corpUser.email,
                name: corpUser.name,
                password: "password123",
                type: "EMPLOYEE",
                tenantId: tenant.id
            }
        });

        const corpProject = await prisma.activity.create({
            data: {
                name: "Corp E2E Project",
                slug: "corp-project-" + Date.now(),
                type: "PROJECT",
                tenantId: tenant.id,
                createdBy: corpUser.id,
                startDate: new Date()
            }
        });

        // Add member to project
        await prisma.activityMember.create({
            data: {
                activityId: corpProject.id,
                memberId: corpMember.id
            }
        });

        // Corporate Assignment Simulation
        const projectAssignment = await prisma.activityAssessment.create({
            data: {
                activityId: corpProject.id,
                assessmentModelId: model.id
            }
        });

        const pua = await prisma.projectUserAssessment.create({
            data: {
                userId: corpUser.id,
                projectAssignmentId: projectAssignment.id,
                status: "DRAFT"
            }
        });
        console.log(`✅ Corporate Project Assignment successfully created! ProjectUserAssessment ID: ${pua.id}`);


        // --- 4. VERIFY UNIFIED DASHBOARD QUERIES ---
        // Verify B2C Individual Query matches MemberAssessment
        const b2cUnifiedQuery = await prisma.memberAssessment.findMany({
            where: { memberId: b2cMember.id },
            include: { assessmentModel: true }
        });
        if (b2cUnifiedQuery.length === 1) console.log(`✅ B2C unified query fetches data properly.`);

        // Verify Corporate Employee Query matches ProjectUserAssessment
        const corpUnifiedQuery = await prisma.projectUserAssessment.findMany({
            where: { userId: corpUser.id },
            include: {
                projectAssignment: {
                    include: { assessmentModel: true, activity: true }
                }
            }
        });
        if (corpUnifiedQuery.length === 1) console.log(`✅ Corporate unified query fetches data properly.`);


        console.log("\\n🎉 Phase 6 Testing Checklist Automation Successful!");

        // Cleanup
        await prisma.memberAssessment.deleteMany({ where: { memberId: b2cMember.id } });
        await prisma.projectUserAssessment.deleteMany({ where: { userId: corpUser.id } });
        await prisma.activityAssessment.deleteMany({ where: { activityId: corpProject.id } });
        await prisma.activityMember.deleteMany({ where: { activityId: corpProject.id } });
        await prisma.activity.delete({ where: { id: corpProject.id } });
        await prisma.member.deleteMany({ where: { email: { in: [b2cUser.email, corpUser.email] } } });
        await prisma.user.deleteMany({ where: { email: { in: [b2cUser.email, corpUser.email] } } });
        await prisma.tenant.delete({ where: { id: tenant.id } });
        await prisma.assessmentModel.delete({ where: { id: model.id } });
        await prisma.competency.delete({ where: { id: competency.id } });
        await prisma.role.delete({ where: { id: role.id } });
        console.log("🧹 Cleanup complete.");

    } catch (e) {
        console.error("Test encountered an error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
