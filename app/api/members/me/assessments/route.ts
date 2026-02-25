import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email!;

    // We can pull the full user first
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isEmployee = user.accountType === "CLIENT_USER";
    const member = await prisma.member.findFirst({
        where: { email }
    });

    const isMember = member && ['INSTITUTION', 'B2C', 'INDIVIDUAL'].includes(member.type || user.accountType || "");
    let assessments: any[] = [];

    if (isEmployee) {
        // Corporate employee — get ProjectUserAssessments
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

        assessments = [...assessments, ...userAssessments.map((ua) => ({
            id: ua.id,
            modelName: ua.projectAssignment.model.name,
            roleName: ua.projectAssignment.model.role?.name,
            competencies: ua.projectAssignment.model.components
                .map((c: any) => c.competency?.name)
                .filter((v: any, i: any, a: any) => v && a.indexOf(v) === i), // unique
            status: ua.status,
            score: ua.overallScore ? Number(ua.overallScore) : undefined,
            dueDate: ua.projectAssignment.dueDate?.toISOString(),
            isMandatory: ua.projectAssignment.isMandatory,
            assignmentType: "ASSIGNED",
        }))];
    }

    if (isMember || member) {
        // Student or B2C — get MemberAssessments
        const memberAssessments = await prisma.memberAssessment.findMany({
            where: { memberId: member!.id },
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

        assessments = [...assessments, ...memberAssessments.map((ma) => ({
            id: ma.id,
            modelName: ma.assessmentModel.name,
            roleName: ma.assessmentModel.role?.name,
            competencies: ma.assessmentModel.components
                .map((c: any) => c.competency?.name)
                .filter((v: any, i: any, a: any) => v && a.indexOf(v) === i),
            status: ma.status,
            score: ma.overallScore ? Number(ma.overallScore) : undefined,
            dueDate: undefined, // no dueDate natively on MemberAssessment
            assignmentType: ma.assignmentType,
        }))];
    }

    return NextResponse.json({ assessments });
}
