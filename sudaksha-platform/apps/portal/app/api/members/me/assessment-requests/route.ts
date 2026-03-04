import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaAssessments } from "@sudaksha/db-assessments";

/**
 * POST /api/members/me/assessment-requests
 * Employee submits an assessment request for an entire Role or a specific Competency.
 * Stored as an ApprovalRequest { type: "ASSESSMENT_REQUEST" }.
 * Visible to the Department Head in the admin approvals queue.
 *
 * GET /api/members/me/assessment-requests
 * Returns the employee's own requests with status.
 */

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, type, source, note } = body;

    if (!id || !type) {
        return NextResponse.json({ error: "id and type are required" }, { status: 400 });
    }

    // Resolve the member and their tenant
    const member = await prisma.member.findFirst({
        where: { email: session.user.email },
        select: { id: true, tenantId: true, name: true },
    });

    if (!member?.tenantId) {
        return NextResponse.json({ error: "No tenant found for this user" }, { status: 400 });
    }

    // Validate that the request is part of their allowed scope
    const fullMember = await prisma.member.findFirst({
        where: { id: member.id },
        include: {
            currentRole: { select: { id: true } },
            aspirationalRole: { select: { id: true } },
        },
    });

    const careerFormData = (fullMember as any)?.careerFormData as any;
    const skillsToDevote: string[] = Array.isArray(careerFormData?.skillsToDevote)
        ? careerFormData.skillsToDevote
        : [];

    const allowedRoleIds = new Set<string>();
    const allowedCompIds = new Set<string>();

    if (fullMember?.currentRole) allowedRoleIds.add(fullMember.currentRole.id);
    if (fullMember?.aspirationalRole) allowedRoleIds.add(fullMember.aspirationalRole.id);
    skillsToDevote.forEach(skillId => allowedCompIds.add(skillId));

    if (type === "ROLE" && !allowedRoleIds.has(id)) {
        return NextResponse.json({ error: "You can only request assessments for your assigned roles." }, { status: 403 });
    }
    if (type === "COMPETENCY" && !allowedCompIds.has(id)) {
        return NextResponse.json({ error: "You can only request standalone assessments for designated skills to develop." }, { status: 403 });
    }

    // Check for duplicate pending requests
    const existing = await prismaAssessments.approvalRequest.findFirst({
        where: {
            tenantId: member.tenantId,
            type: "ASSESSMENT_REQUEST" as any,
            requesterId: session.user.id,
            status: "PENDING",
        },
    });

    if (existing) {
        const modifiedData = existing.modifiedData as any;
        if (type === "ROLE" && modifiedData?.roleId === id) {
            return NextResponse.json({ error: "You already have a pending request for this role." }, { status: 409 });
        }
        if (type === "COMPETENCY" && modifiedData?.competencyId === id) {
            return NextResponse.json({ error: "You already have a pending request for this competency." }, { status: 409 });
        }
    }

    const modifiedDataPayload: any = {
        source,
        note: note || "",
        memberId: member.id,
        memberName: member.name || session.user.email,
        scope: "TENANT_SPECIFIC",
    };

    if (type === "ROLE") {
        modifiedDataPayload.roleId = id;
        modifiedDataPayload.roleName = name || id;
    } else {
        modifiedDataPayload.competencyId = id;
        modifiedDataPayload.competencyName = name || id;
    }

    const request = await prismaAssessments.approvalRequest.create({
        data: {
            tenantId: member.tenantId,
            type: "ASSESSMENT_REQUEST" as any,
            entityId: id,
            status: "PENDING",
            requesterId: session.user.id,
            modifiedData: modifiedDataPayload,
        },
    });

    return NextResponse.json({ request }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawRequests = await prismaAssessments.approvalRequest.findMany({
        where: {
            type: "ASSESSMENT_REQUEST" as any,
            requesterId: session.user.id,
        },
        orderBy: { createdAt: "desc" },
    });

    const requests = rawRequests.map(r => {
        const data = r.modifiedData as any;
        return {
            id: r.id,
            itemName: data?.roleName || data?.competencyName || r.entityId, // display the name
            itemType: data?.roleId ? "Role" : "Competency",
            note: data?.note || undefined,
            status: r.status,
            rejectionReason: r.rejectionReason || undefined,
            createdAt: r.createdAt.toISOString(),
        };
    });

    return NextResponse.json({ requests });
}
