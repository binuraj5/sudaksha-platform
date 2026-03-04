import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIneligibleMemberIds } from "@/lib/assessment-student-restrictions";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'MANAGER'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { modelId, targetType, projectId, memberId } = body;

        if (!modelId || !targetType) {
            return NextResponse.json({ error: "modelId and targetType are required" }, { status: 400 });
        }

        const assignerId = session.user.id as string;

        // Verify assessment model exists
        const model = await prisma.assessmentModel.findFirst({
            where: { id: modelId, isActive: true }
        });
        if (!model) {
            return NextResponse.json({ error: "Assessment model not found" }, { status: 404 });
        }

        if (targetType === "PROJECT") {
            const { projectId, dueDate, isMandatory } = body;
            if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

            // Assign to all users in project
            const project = await prisma.activity.findUnique({
                where: { id: projectId },
                include: { members: true }
            });

            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            const members = await prisma.member.findMany({
                where: { id: { in: project.members.map(m => m.memberId) } },
                select: { id: true, email: true, type: true, hasGraduated: true }
            });

            const ineligible = getIneligibleMemberIds(members as any[], model.targetLevel);
            if (ineligible.length > 0) {
                return NextResponse.json({ error: `Cannot assign ${model.targetLevel} assessment to ungraduated students in this project.` }, { status: 400 });
            }

            // Create project assignment
            const assignment = await prisma.projectAssessmentModel.create({
                data: {
                    projectId,
                    modelId,
                    assignedBy: assignerId,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    isMandatory: isMandatory || false,
                    assignmentLevel: 'PROJECT' as any
                }
            });

            // Create user assessments for all project members
            const users = await prisma.user.findMany({
                where: { email: { in: members.map(m => m.email) } },
                select: { id: true, email: true }
            });

            const emailToUserId = new Map(users.map(u => [u.email, u.id]));
            const memberIdToUserId = new Map(members.map(m => [m.id, emailToUserId.get(m.email)]));

            const userAssessments = await Promise.all(
                project.members.map(async (activityMember) => {
                    const userId = memberIdToUserId.get(activityMember.memberId);
                    if (!userId) return null;

                    return prisma.projectUserAssessment.create({
                        data: {
                            userId: userId,
                            projectAssignmentId: assignment.id,
                            status: 'DRAFT' as any
                        }
                    });
                })
            );

            const successfulAssignments = userAssessments.filter(Boolean);

            return NextResponse.json({
                success: true,
                message: `Assessment assigned to ${successfulAssignments.length} users in project`,
                assignment,
                userAssignments: successfulAssignments.length
            });
        }

        if (targetType === "INDIVIDUAL") {
            if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });
            const member = await prisma.member.findFirst({
                where: { id: memberId, tenantId: clientId },
                select: { id: true, type: true, hasGraduated: true }
            });
            if (!member) {
                return NextResponse.json({ error: "Member not found" }, { status: 404 });
            }

            const ineligible = getIneligibleMemberIds([member as any], model.targetLevel);
            if (ineligible.length > 0) {
                return NextResponse.json({ error: `Cannot assign ${model.targetLevel} assessment to ungraduated student.` }, { status: 400 });
            }

            // We need to fetch the full member record to generate the assignment
            const assignment = await prisma.memberAssessment.create({
                data: {
                    memberId,
                    assessmentModelId: modelId,
                    assignedBy: assignerId,
                    assignmentType: 'ASSIGNED',
                    status: 'DRAFT' as any
                }
            });
            return NextResponse.json({ success: true, message: "Assessment assigned to individual", assignment });
        }

        return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
    } catch (error) {
        console.error("Assign assessment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
