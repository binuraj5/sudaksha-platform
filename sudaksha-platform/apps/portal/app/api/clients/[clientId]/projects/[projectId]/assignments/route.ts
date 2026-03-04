import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssignmentLevel } from "@sudaksha/db-core";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ clientId: string; projectId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, projectId } = await params;

        const user = session?.user as any;
        if (!session || !user || (user.role !== "SUPER_ADMIN" && user.clientId !== clientId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = user.role;
        const orgUnitFilter: any = {};

        if (role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD_INST") {
            // Dept Head can see PROJECT level and their own DEPARTMENT level
            orgUnitFilter.OR = [
                { assignmentLevel: "PROJECT" },
                { departmentId: user.departmentId }
            ];
        } else if (role === "TEAM_LEADER" || role === "CLASS_TEACHER" || role === "MEMBER") {
            // Team Leader/Member sees PROJECT and their specific INDIVIDUAL/TEAM assignments (simplified here to just PROJECT and self-assigned for now)
            orgUnitFilter.OR = [
                { assignmentLevel: "PROJECT" },
                { assignedBy: user.id }
            ];
        }

        const assignments = await prisma.projectAssessmentModel.findMany({
            where: {
                projectId,
                ...orgUnitFilter
            },
            include: {
                model: {
                    select: { name: true, durationMinutes: true }
                },
                department: {
                    select: { name: true }
                },
                _count: {
                    select: { userAssignments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Fetch assignments error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ clientId: string; projectId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, projectId } = await params;

        const user = session?.user as any;
        if (!session || !user || (user.role !== "SUPER_ADMIN" && user.clientId !== clientId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { modelId, assignmentLevel, departmentId, userIds, dueDate, isMandatory } = body;

        if (!modelId || !assignmentLevel) {
            return NextResponse.json({ error: "Model ID and Assignment Level are required" }, { status: 400 });
        }

        const role = user.role;

        // Scope Enforcement
        if (assignmentLevel === "DEPARTMENT") {
            if (role === "TEAM_LEADER" || role === "CLASS_TEACHER" || role === "MEMBER") {
                return NextResponse.json({ error: "Team Leaders and Members cannot assign at the Department level" }, { status: 403 });
            }
            if ((role === "DEPARTMENT_HEAD" || role === "DEPT_HEAD_INST") && user.departmentId !== departmentId) {
                return NextResponse.json({ error: "You can only assign assessments to your own department" }, { status: 403 });
            }
        }

        // 1. Create the Project-level assignment record
        const projectAssignment = await prisma.projectAssessmentModel.create({
            data: {
                projectId,
                modelId,
                assignedBy: session.user.id,
                assignmentLevel,
                departmentId: assignmentLevel === "DEPARTMENT" ? departmentId : null,
                dueDate: dueDate ? new Date(dueDate) : null,
                isMandatory: isMandatory !== undefined ? isMandatory : true,
            }
        });

        // 2. Identify users to assign
        let usersToAssign: string[] = [];

        if (assignmentLevel === "PROJECT") {
            const projectUsers = await prisma.user.findMany({
                where: { projectId, accountType: "CLIENT_USER" },
                select: { id: true }
            });
            usersToAssign = projectUsers.map(u => u.id);
        } else if (assignmentLevel === "DEPARTMENT") {
            const deptUsers = await prisma.user.findMany({
                where: { departmentId, accountType: "CLIENT_USER" },
                select: { id: true }
            });
            usersToAssign = deptUsers.map(u => u.id);
        } else if (assignmentLevel === "INDIVIDUAL") {
            usersToAssign = userIds || [];
        }

        // 3. Create individual user assignments
        if (usersToAssign.length > 0) {
            await prisma.projectUserAssessment.createMany({
                data: usersToAssign.map(userId => ({
                    projectAssignmentId: projectAssignment.id,
                    userId,
                    status: "DRAFT"
                }))
            });

            // Update total assigned count
            await prisma.projectAssessmentModel.update({
                where: { id: projectAssignment.id },
                data: { totalAssigned: usersToAssign.length }
            });
        }

        return NextResponse.json(projectAssignment);
    } catch (error) {
        console.error("Create assignment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
