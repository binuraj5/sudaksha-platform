// @ts-nocheck
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Starting Phase 6 Verification Script...");

    try {
        // 1. Corporate Employee Flow
        console.log("\\n--- Checking Corporate Employee Capabilities ---");
        const corporateProject = await prisma.activity.findFirst({
            where: { type: "PROJECT" },
            include: { members: true, assessments: true }
        });

        if (corporateProject) {
            console.log(`Found corporate project: ${corporateProject.name} with ${corporateProject.members.length} members`);
            if (corporateProject.assessments.length > 0) {
                const projectAssignmentId = corporateProject.assessments[0].id;
                const pua = await prisma.projectUserAssessment.findFirst({
                    where: { projectAssignmentId }
                });
                if (pua) console.log(`Project User Assessment created correctly: ${pua.id} for user ${pua.userId}`);
                else console.log(`No Project User Assessment found for assignment ${projectAssignmentId}`);
            } else {
                console.log("No assessments deployed to this project yet.");
            }
        } else {
            console.log("No corporate projects found.");
        }

        // 2. Institution Student Flow
        console.log("\\n--- Checking Institution Class Capabilities ---");
        const orgUnit = await prisma.organizationUnit.findFirst({
            where: { members: { some: { type: "STUDENT" } } },
            include: { members: true }
        });

        if (orgUnit) {
            console.log(`Found Organization Unit: ${orgUnit.name} with ${orgUnit.members.length} members`);
            const memberIds = orgUnit.members.map((m: any) => m.id);
            const studentAssessments = await prisma.memberAssessment.findMany({
                where: { memberId: { in: memberIds }, assignmentType: "ASSIGNED" }
            });
            console.log(`Found ${studentAssessments.length} assigned assessments for students in this unit`);
        } else {
            console.log("No student-populated organization units found.");
        }

        // 3. B2C Individual Flow
        console.log("\\n--- Checking B2C Individual Capabilities ---");
        const b2cMember = await prisma.member.findFirst({
            where: { type: "INDIVIDUAL" },
            include: { assessments: true, currentRole: true, aspirationalRole: true }
        });

        if (b2cMember) {
            console.log(`Found B2C member: ${b2cMember.email}`);
            const selfSelect = b2cMember.assessments.filter((a: any) => a.assignmentType === "SELF_SELECTED");
            console.log(`B2C Member has ${selfSelect.length} self-selected assessments`);

            // 4. Career Page Capabilities
            console.log("\\n--- Checking Career Page Features ---");
            console.log(`Current Role set: ${!!b2cMember.currentRole}`);
            console.log(`Aspirational Role set: ${!!b2cMember.aspirationalRole}`);
            if (b2cMember.developmentPlan) {
                console.log("Development Plan has been generated successfully.");
            } else {
                console.log("Development Plan not strictly tested or generated yet.");
            }
        } else {
            console.log("No INDIVIDUAL B2C members found.");
        }

    } catch (e) {
        console.error("Verification encountered an error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
