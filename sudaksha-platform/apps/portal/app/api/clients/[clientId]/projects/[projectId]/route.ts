import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; projectId: string }> }
) {
    const session = await getApiSession();
    const { clientId, projectId } = await params;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const project = await prisma.activity.findUnique({
            where: { id: projectId },
            include: {
                owner: true,
                orgUnits: { include: { orgUnit: true } }, // Departments
                members: { include: { member: true } }, // Team
                assessments: { include: { assessmentModel: true } }
            }
        });

        if (!project || project.tenantId !== clientId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; projectId: string }> }
) {
    const session = await getApiSession();
    const { clientId, projectId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();
        const { departmentIds, employeeIds, ...rest } = body;

        // Handle relations update if supplied
        // This is tricky with simple update. Usually need transaction to delete/create.
        // For MVP, if array is passed, replace all? Or add? 
        // Let's assume separate endpoints for adding members usually, but for simple edit form we might reset.

        if (departmentIds || employeeIds) {
            const ops = [];
            if (departmentIds) {
                ops.push(prisma.activityOrgUnit.deleteMany({ where: { activityId: projectId } }));
                ops.push(prisma.activityOrgUnit.createMany({
                    data: departmentIds.map((id: string) => ({ activityId: projectId, orgUnitId: id }))
                }));
            }
            if (employeeIds) {
                ops.push(prisma.activityMember.deleteMany({ where: { activityId: projectId } }));
                ops.push(prisma.activityMember.createMany({
                    data: employeeIds.map((id: string) => ({ activityId: projectId, memberId: id }))
                }));
            }

            // Run relation updates
            await prisma.$transaction(ops);

            // --- Automatic Assessment Assignment Trigger ---
            if (employeeIds && employeeIds.length > 0) {
                const projectAssessments = await prisma.projectAssessmentModel.findMany({
                    where: { projectId: projectId }
                });

                if (projectAssessments.length > 0) {
                    const members = await prisma.member.findMany({
                        where: { id: { in: employeeIds } },
                        select: { email: true }
                    });

                    const users = await prisma.user.findMany({
                        where: { email: { in: members.map(m => m.email) } },
                        select: { id: true }
                    });

                    const newAssignments: any[] = [];
                    for (const user of users) {
                        for (const pa of projectAssessments) {
                            newAssignments.push({
                                userId: user.id,
                                projectAssignmentId: pa.id,
                                status: 'DRAFT' as any
                            });
                        }
                    }

                    if (newAssignments.length > 0) {
                        await prisma.projectUserAssessment.createMany({
                            data: newAssignments,
                            skipDuplicates: true
                        });
                    }
                }
            }
        }

        const project = await prisma.activity.update({
            where: { id: projectId },
            data: rest
        });

        return NextResponse.json(project);

    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; projectId: string }> }
) {
    const session = await getApiSession();
    const { clientId, projectId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        // Soft delete (Archive)
        await prisma.activity.update({
            where: { id: projectId },
            data: { status: 'ARCHIVED' }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
