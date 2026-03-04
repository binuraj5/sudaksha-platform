import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaAssessments } from "@sudaksha/db-assessments";

/**
 * GET /api/members/me/requestable-competencies
 * Returns items the employee is allowed to request an assessment for:
 *   1. Their Current Role (as a single item)
 *   2. Their Aspirational Role (as a single item)
 *   3. Competencies in "Skills I Want to Develop"
 */
export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findFirst({
        where: { email: session.user.email },
        include: {
            currentRole: {
                include: {
                    competencies: { include: { competency: true } },
                },
            },
            aspirationalRole: {
                include: {
                    competencies: { include: { competency: true } },
                },
            },
        },
    });

    if (!member) {
        return NextResponse.json({ items: [] });
    }

    // Fetch all active/completed assessments for this member
    const memberAssessments = await prisma.memberAssessment.findMany({
        where: { memberId: member.id },
        include: { assessmentModel: { include: { components: true } } }
    });

    const projectAssessments = await prisma.projectUserAssessment.findMany({
        where: { userId: member.id },
        include: { projectAssignment: { include: { model: { include: { components: true } } } } }
    });

    // Collect all competency IDs the user is already assigned to or has completed
    const assignedCompetencyIds = new Set<string>();
    let currentRoleCompleted = false;
    let aspirationalRoleCompleted = false;

    const currentRoleCompIds = member.currentRole?.competencies.map(rc => rc.competency.id) || [];
    const aspirationalRoleCompIds = member.aspirationalRole?.competencies.map(rc => rc.competency.id) || [];

    const processModel = (model: any, status: string, passed: boolean | null) => {
        const compIds = model.components.map((c: any) => c.competencyId).filter(Boolean);
        compIds.forEach((id: string) => assignedCompetencyIds.add(id));

        if (currentRoleCompIds.length > 0 && (status === "COMPLETED" || passed === true)) {
            if (currentRoleCompIds.every(id => compIds.includes(id))) {
                currentRoleCompleted = true;
            }
        }
        if (aspirationalRoleCompIds.length > 0 && (status === "COMPLETED" || passed === true)) {
            if (aspirationalRoleCompIds.every(id => compIds.includes(id))) {
                aspirationalRoleCompleted = true;
            }
        }
    };

    memberAssessments.forEach(ma => processModel(ma.assessmentModel, ma.status, ma.passed));
    projectAssessments.forEach(pa => processModel(pa.projectAssignment.model, pa.status, pa.passed));

    // Check existing pending approval requests to NOT show items already requested
    const existingRequests = await prismaAssessments.approvalRequest.findMany({
        where: {
            tenantId: member.tenantId,
            type: "ASSESSMENT_REQUEST" as any,
            requesterId: session.user.id,
            status: "PENDING",
        },
    });

    const pendingRoleIds = new Set<string>();
    const pendingCompIds = new Set<string>();
    existingRequests.forEach(req => {
        const md = req.modifiedData as any;
        if (md?.roleId) pendingRoleIds.add(md.roleId);
        if (md?.competencyId) pendingCompIds.add(md.competencyId);
    });

    const items: any[] = [];

    // 1. Current Role
    if (member.currentRole) {
        const isAssignedOrPending = pendingRoleIds.has(member.currentRole.id) || currentRoleCompleted;
        if (!isAssignedOrPending) {
            items.push({
                id: member.currentRole.id,
                name: member.currentRole.name,
                source: "current-role",
                type: "ROLE",
            });
        }
    } else {
        // If no current role, let's treat it as completed so they can request aspirational.
        currentRoleCompleted = true;
    }

    // 2. Aspirational Role
    if (member.aspirationalRole) {
        const isAssignedOrPending = pendingRoleIds.has(member.aspirationalRole.id) || aspirationalRoleCompleted;
        if (!isAssignedOrPending) {
            items.push({
                id: member.aspirationalRole.id,
                name: member.aspirationalRole.name,
                source: "aspirational-role",
                type: "ROLE",
            });
        }
    }

    // 3. "Skills I Want to Develop" Individual Competencies
    const careerFormData = (member as any).careerFormData as any;
    const skillsToDevote: string[] = Array.isArray(careerFormData?.skillsToDevote)
        ? careerFormData.skillsToDevote
        : [];

    if (skillsToDevote.length > 0) {
        const devComps = await prisma.competency.findMany({
            where: { id: { in: skillsToDevote } },
            select: { id: true, name: true, category: true },
        });
        for (const comp of devComps) {
            if (!assignedCompetencyIds.has(comp.id) && !pendingCompIds.has(comp.id)) {
                items.push({
                    id: comp.id,
                    name: comp.name,
                    category: comp.category || "TECHNICAL",
                    source: "skills-to-develop",
                    type: "COMPETENCY",
                });
            }
        }
    }

    return NextResponse.json({ items, currentRoleCompleted });
}
