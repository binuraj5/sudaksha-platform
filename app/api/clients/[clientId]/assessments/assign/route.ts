import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
            const activity = await prisma.activity.findFirst({
                where: { id: projectId, tenantId: clientId, type: 'PROJECT' }
            });
            if (!activity) {
                return NextResponse.json({ error: "Project not found" }, { status: 404 });
            }
            await prisma.activityAssessment.create({
                data: {
                    activityId: projectId,
                    assessmentModelId: modelId,
                    assignedBy: assignerId,
                }
            });
            return NextResponse.json({ success: true, message: "Assessment assigned to project" });
        }

        if (targetType === "INDIVIDUAL") {
            if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });
            const member = await prisma.member.findFirst({
                where: { id: memberId, tenantId: clientId }
            });
            if (!member) {
                return NextResponse.json({ error: "Member not found" }, { status: 404 });
            }
            await prisma.memberAssessment.create({
                data: {
                    memberId,
                    assessmentModelId: modelId,
                    assignedBy: assignerId,
                    assignmentType: 'ASSIGNED',
                }
            });
            return NextResponse.json({ success: true, message: "Assessment assigned to individual" });
        }

        return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
    } catch (error) {
        console.error("Assign assessment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
