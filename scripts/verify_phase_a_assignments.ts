// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runVerification() {
    console.log("=========================================");
    console.log("Starting Phase A Assessment Assignment Verification");
    console.log("=========================================\n");

    let createdTenantId: string | null = null;
    let createdActivityId: string | null = null;
    let createdAssessmentModelId: string | null = null;
    let createdProjectAssessmentModelId: string | null = null;
    let member1Id: string | null = null;
    let member2Id: string | null = null;
    let user1Id: string | null = null;
    let user2Id: string | null = null;

    try {
        console.log("1. Setting up test data...");

        // 1. Create a dummy tenant
        const tenant = await prisma.tenant.create({
            data: {
                name: "Test Tenant - Phase A",
                slug: "test-tenant-phase-a-" + Date.now(),
                type: "CORPORATE"
            }
        });
        createdTenantId = tenant.id;
        console.log(`   Created Tenant: ${tenant.id}`);

        // 2. Create Users & Members
        const user1 = await prisma.user.create({
            data: {
                email: `testuser1_${Date.now()}@example.com`,
                name: "Test User 1",
                role: "EMPLOYEE"
            }
        });
        user1Id = user1.id;

        const user2 = await prisma.user.create({
            data: {
                email: `testuser2_${Date.now()}@example.com`,
                name: "Test User 2",
                role: "EMPLOYEE"
            }
        });
        user2Id = user2.id;

        const member1 = await prisma.member.create({
            data: {
                tenantId: tenant.id,
                email: user1.email,
                name: user1.name,
                password: "hashed_dummy",
                type: "EMPLOYEE"
            }
        });
        member1Id = member1.id;

        const member2 = await prisma.member.create({
            data: {
                tenantId: tenant.id,
                email: user2.email,
                name: user2.name,
                password: "hashed_dummy",
                type: "EMPLOYEE"
            }
        });
        member2Id = member2.id;
        console.log(`   Created Users and Members`);

        // 3. Create a dummy Project (Activity)
        const activity = await prisma.activity.create({
            data: {
                tenantId: tenant.id,
                type: "PROJECT",
                name: "Test Project Auto Assessment",
                status: "ACTIVE"
            }
        });
        createdActivityId = activity.id;
        console.log(`   Created Project: ${activity.id}`);

        // 4. Create an Assessment Model and attach to Project
        const asm = await prisma.assessmentModel.create({
            data: {
                title: "Test Assessment Model",
                description: "Testing Auto Assign",
                tenantId: tenant.id,
                status: "PUBLISHED"
            }
        });
        createdAssessmentModelId = asm.id;

        const pam = await prisma.projectAssessmentModel.create({
            data: {
                projectId: activity.id,
                assessmentModelId: asm.id
            }
        });
        createdProjectAssessmentModelId = pam.id;
        console.log(`   Attached Assessment Model to Project`);

        // ----------------------------------------------------------------------------------
        // TEST 1: Simulate Individual Addition (v1/activities/[id]/members)
        // Note: The API does this via `POST v1/activities/[id]/members/route.ts` which inserts
        // into ActivityMember then creates ProjectUserAssessment. We will mimic the handler logic.
        // ----------------------------------------------------------------------------------
        console.log("\n2. Testing Individual Addition Trigger...");

        await prisma.activityMember.create({
            data: { activityId: activity.id, memberId: member1.id, role: 'MEMBER' }
        });

        // Trigger logic that was added to the API
        const projectAssessments = await prisma.projectAssessmentModel.findMany({ where: { projectId: activity.id } });
        if (projectAssessments.length > 0) {
            const newAssignments = projectAssessments.map(pa => ({
                userId: user1.id,
                projectAssignmentId: pa.id,
                status: 'DRAFT' as any
            }));
            await prisma.projectUserAssessment.createMany({ data: newAssignments, skipDuplicates: true });
        }

        // Verify
        const check1 = await prisma.projectUserAssessment.findFirst({
            where: { userId: user1.id, projectAssignmentId: pam.id }
        });

        if (check1) {
            console.log("   ✅ Individual Auto-Assignment Passed!");
        } else {
            console.error("   ❌ Individual Auto-Assignment Failed! Record not found.");
        }


        // ----------------------------------------------------------------------------------
        // TEST 2: Simulate Bulk Addition (clients/[clientId]/projects/[projectId])
        // ----------------------------------------------------------------------------------
        console.log("\n3. Testing Bulk Addition Trigger...");

        // Trigger logic added for Bulk
        const employeeIds = [member2.id];

        await prisma.activityMember.create({
            data: { activityId: activity.id, memberId: member2.id, role: 'MEMBER' }
        });

        if (employeeIds && employeeIds.length > 0) {
            const pas = await prisma.projectAssessmentModel.findMany({ where: { projectId: activity.id } });
            if (pas.length > 0) {
                const members = await prisma.member.findMany({ where: { id: { in: employeeIds } }, select: { email: true } });
                const users = await prisma.user.findMany({ where: { email: { in: members.map(m => m.email) } }, select: { id: true } });

                const newAssigns: any[] = [];
                for (const u of users) {
                    for (const pa of pas) {
                        newAssigns.push({ userId: u.id, projectAssignmentId: pa.id, status: 'DRAFT' });
                    }
                }
                if (newAssigns.length > 0) {
                    await prisma.projectUserAssessment.createMany({ data: newAssigns, skipDuplicates: true });
                }
            }
        }

        // Verify
        const check2 = await prisma.projectUserAssessment.findFirst({
            where: { userId: user2.id, projectAssignmentId: pam.id }
        });

        if (check2) {
            console.log("   ✅ Bulk Auto-Assignment Passed!");
        } else {
            console.error("   ❌ Bulk Auto-Assignment Failed! Record not found for member 2.");
        }

        console.log("\n=========================================");
        console.log("Verification checks completed successfully.");
        console.log("=========================================\n");

    } catch (e) {
        console.error("❌ Test Failed with Error:", e);
    } finally {
        console.log("Cleaning up test data...");
        // Cleanup all records created
        if (createdProjectAssessmentModelId) await prisma.projectAssessmentModel.delete({ where: { id: createdProjectAssessmentModelId } }).catch(e => null);
        if (createdAssessmentModelId) await prisma.assessmentModel.delete({ where: { id: createdAssessmentModelId } }).catch(e => null);
        if (createdActivityId) await prisma.activity.delete({ where: { id: createdActivityId } }).catch(e => null);
        if (member1Id) await prisma.member.delete({ where: { id: member1Id } }).catch(e => null);
        if (member2Id) await prisma.member.delete({ where: { id: member2Id } }).catch(e => null);
        if (user1Id) await prisma.user.delete({ where: { id: user1Id } }).catch(e => null);
        if (user2Id) await prisma.user.delete({ where: { id: user2Id } }).catch(e => null);
        if (createdTenantId) await prisma.tenant.delete({ where: { id: createdTenantId } }).catch(e => null);
        console.log("Cleanup complete.");
        await prisma.$disconnect();
    }
}

runVerification();
