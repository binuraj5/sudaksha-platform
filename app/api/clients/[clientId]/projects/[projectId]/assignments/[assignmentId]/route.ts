import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ clientId: string; projectId: string; assignmentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, projectId, assignmentId } = await params;

        const user = session?.user as any;
        if (!session || !user || (user.role !== "SUPER_ADMIN" && user.clientId !== clientId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const assignment = await prisma.projectAssessmentModel.findFirst({
            where: {
                id: assignmentId,
                projectId: projectId
            },
            include: {
                model: {
                    select: {
                        name: true,
                        description: true,
                        durationMinutes: true
                    }
                },
                department: {
                    select: { name: true }
                },
                userAssignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                department: true, // For legacy/profile info
                                dept: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: {
                        user: { name: 'asc' }
                    }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Fetch assignment details error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
