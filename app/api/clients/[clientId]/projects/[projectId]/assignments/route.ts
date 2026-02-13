import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssignmentLevel } from "@prisma/client";

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

        const assignments = await prisma.projectAssessmentModel.findMany({
            where: { projectId },
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
