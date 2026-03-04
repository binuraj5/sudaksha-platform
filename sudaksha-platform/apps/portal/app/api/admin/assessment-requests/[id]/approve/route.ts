import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaAssessments } from "@sudaksha/db-assessments";
import { getApiSession } from "@/lib/get-session";
import { normalizeUserRole } from "@/lib/permissions/role-competency-permissions";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getApiSession();
    const u = session?.user as any;

    if (!session?.user || !u?.role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = normalizeUserRole(u.role);
    const isSuperAdmin = role === "SUPER_ADMIN" || u.userType === "SUPER_ADMIN";
    const isTenantAdmin = ["TENANT_ADMIN", "INSTITUTION_ADMIN", "CLIENT_ADMIN"].includes(role);
    const isDeptHead = ["DEPARTMENT_HEAD", "DEPT_HEAD_INST"].includes(role);

    if (!isSuperAdmin && !isTenantAdmin && !isDeptHead) {
        return NextResponse.json({ error: "Unauthorized to approve requests" }, { status: 403 });
    }

    try {
        const requestId = params.id;
        if (!requestId) {
            return NextResponse.json({ error: "Missing request ID" }, { status: 400 });
        }

        const request = await prismaAssessments.approvalRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.type !== "ASSESSMENT_REQUEST") {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.status !== "PENDING") {
            return NextResponse.json({ error: "Request is no longer pending" }, { status: 400 });
        }

        // Branch A/B: Check if a Published/Draft model exists for this tenant & role/competency
        const modData = request.modifiedData as any;
        const targetMemberId = modData?.memberId;
        const targetId = request.entityId; // roleId or competencyId
        const isRoleRequest = !!modData?.roleId;

        if (!targetMemberId || !targetId) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // First resolve the full member to get their roles (we need role context to find the best-fit model)
        const member = await prisma.member.findUnique({
            where: { id: targetMemberId },
            include: { currentRole: true, aspirationalRole: true }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const source = modData?.source;
        let roleIdToMatch: string | null = null;
        if (source === "current-role" && member.currentRoleId) {
            roleIdToMatch = member.currentRoleId;
        } else if (source === "aspirational-role" && member.aspirationalRoleId) {
            roleIdToMatch = member.aspirationalRoleId;
        }

        // Search for existing models in this tenant
        // If Role Request => match roleId
        // If Competency Request => match components
        const matchingModels = await prisma.assessmentModel.findMany({
            where: {
                tenantId: request.tenantId,
                ...(isRoleRequest ? { roleId: targetId } : { components: { some: { competencyId: targetId } } })
            },
            include: { components: true },
            orderBy: [
                { status: 'asc' }, // PUBLISHED (P) comes before DRAFT (D) naturally, but let's sort in code to be safe
                { version: 'desc' }
            ]
        });

        if (matchingModels.length === 0) {
            // Branch A: No model exists. Inform the frontend to show the "Build Model" modal/prompt
            // By rejecting with a specific payload, the frontend knows what to do
            return NextResponse.json({
                error: "NO_MODEL_EXISTS",
                message: "No assessment model exists for this request. You must build one first."
            }, { status: 404 });
        }

        // Sort: Prioritize PUBLISHED, then matching roleId
        const activeModels = matchingModels.filter(m => m.status === "PUBLISHED" || m.status === "DRAFT");
        if (activeModels.length === 0) {
            return NextResponse.json({
                error: "NO_ACTIVE_MODEL",
                message: "All matching models are archived. Please duplicate one and publish it."
            }, { status: 404 });
        }

        let bestFit = activeModels.find(m => m.status === "PUBLISHED" && m.roleId === roleIdToMatch) ||
            activeModels.find(m => m.status === "PUBLISHED") ||
            activeModels.find(m => m.status === "DRAFT" && m.roleId === roleIdToMatch) ||
            activeModels[0];

        // Branch B: The Atomic Publish-and-Assign
        await prisma.$transaction(async (tx) => {
            // 1. If the best-fit model is DRAFT, publish it
            if (bestFit.status === "DRAFT") {
                bestFit = await tx.assessmentModel.update({
                    where: { id: bestFit.id },
                    data: { status: "PUBLISHED" },
                    include: { components: true }
                });
            }

            // 2. Assign to member (ProjectUserAssessment / MemberAssessment based on schema logic)
            // We'll create a direct MemberAssessment assignment for simplicity and correctness in this scope
            await tx.memberAssessment.create({
                data: {
                    memberId: member.id,
                    assessmentModelId: bestFit.id,
                    status: "ASSIGNED",
                    assignedByRoles: [role],
                    progress: 0,
                }
            });
        });

        // 3. Mark request as APPROVED traversing db boundaries (db-assessments)
        await prismaAssessments.approvalRequest.update({
            where: { id: requestId },
            data: { status: "APPROVED", reviewerId: u.id },
        });

        return NextResponse.json({
            success: true,
            message: "Request approved and assessment assigned automatically."
        });

    } catch (error) {
        console.error("[APPROVE_ASSESSMENT_REQ_POST]", error);
        return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
    }
}
