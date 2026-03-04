import { prisma } from "@/lib/prisma";
import { AssessmentModel } from "@sudaksha/db-core";

export async function getRecommendedAssessments(
    memberId: string,
    limit: number = 5
): Promise<AssessmentModel[]> {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
            aspirationalRole: true,
            currentRole: true
        }
    });

    if (!member) return [];

    const aspirationalRoleId = member.aspirationalRoleId;
    // const competencyGaps: string[] = ... (calculate from member.competencyGaps logic if stored)

    // Logic: 
    // 1. If aspirational role exists, find assessments for that role.
    // 2. If general competencies defined, find assessments for those.

    const where: any = {
        isActive: true,
        status: { in: ['PUBLISHED', 'ACTIVE'] },
        NOT: {
            memberAssessments: {
                some: {
                    memberId,
                    status: 'COMPLETED'
                }
            }
        }
    };

    if (aspirationalRoleId) {
        where.OR = [
            { roleId: aspirationalRoleId },
            // Add level check if applicable
        ];
    } else {
        // Fallback: Just latest or popular if no goals set
    }

    const assessments = await prisma.assessmentModel.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { memberAssessments: true }
            }
        }
    });

    return assessments;
}
