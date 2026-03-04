import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email!;

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, accountType: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isEmployee = user.accountType === "CLIENT_USER";
    let assessments: any[] = [];

    if (isEmployee) {
        // ── Corporate employee ──────────────────────────────────────────────
        // Show ONLY org-assigned ProjectUserAssessments — never global catalog
        const userAssessments = await prisma.projectUserAssessment.findMany({
            where: { userId: user.id },
            include: {
                projectAssignment: {
                    include: {
                        model: {
                            include: {
                                role: true,
                                components: {
                                    include: {
                                        competency: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        assessments = userAssessments.map((ua) => ({
            id: ua.id,
            modelName: ua.projectAssignment.model.name,
            roleName: ua.projectAssignment.model.role?.name,
            competencies: ua.projectAssignment.model.components
                .map((c: any) => c.competency?.name)
                .filter((v: any, i: any, a: any) => v && a.indexOf(v) === i),
            status: ua.status,
            score: ua.overallScore != null ? Number(ua.overallScore) : undefined,
            dueDate: ua.projectAssignment.dueDate?.toISOString() ?? undefined,
            completedAt: ua.completedAt?.toISOString() ?? undefined,
            isMandatory: ua.projectAssignment.isMandatory,
            assignmentType: "ASSIGNED",
            // Pass scope metadata so the UI can verify this is org-assigned
            scope: "TENANT_SPECIFIC",
        }));

        // Corporate employees NEVER see global/self-selected assessments
        return NextResponse.json({ assessments });
    }

    // ── Institution / B2C / Individual members ──────────────────────────────
    // Only fetch MemberAssessments with assignmentType = ASSIGNED
    // (self-selected kept only for B2C individuals — not for org members)
    const member = await prisma.member.findFirst({
        where: { email },
        select: { id: true, type: true, tenantId: true },
    });

    if (!member) {
        return NextResponse.json({ assessments: [] });
    }

    // Determine if this member is from an org (EMPLOYEE/STUDENT) — restrict to ASSIGNED only
    const isOrgMember = member.type === "EMPLOYEE" || member.type === "STUDENT";

    const memberAssessments = await prisma.memberAssessment.findMany({
        where: {
            memberId: member.id,
            // Org members (employees enrolled as Member) see only ASSIGNED, not SELF_SELECTED
            ...(isOrgMember ? { assignmentType: "ASSIGNED" } : {}),
        },
        include: {
            assessmentModel: {
                include: {
                    role: true,
                    components: {
                        include: {
                            competency: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    assessments = memberAssessments.map((ma) => ({
        id: ma.id,
        modelName: ma.assessmentModel.name,
        roleName: ma.assessmentModel.role?.name,
        competencies: ma.assessmentModel.components
            .map((c: any) => c.competency?.name)
            .filter((v: any, i: any, a: any) => v && a.indexOf(v) === i),
        status: ma.status,
        score: ma.overallScore != null ? Number(ma.overallScore) : undefined,
        dueDate: (ma as any).dueDate?.toISOString() ?? undefined,
        completedAt: (ma as any).completedAt?.toISOString() ?? undefined,
        assignmentType: ma.assignmentType,
        scope: "TENANT_SPECIFIC",
    }));

    return NextResponse.json({ assessments });
}
