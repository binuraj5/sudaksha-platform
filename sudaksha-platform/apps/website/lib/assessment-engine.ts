
import { prisma } from "@/lib/prisma";
import { ProficiencyLevel, IndicatorType } from "@prisma/client";
import { getIneligibleMemberIds, isLevelRestrictedForStudents } from "@/lib/assessment-student-restrictions";

interface SelectionCriteria {
    roleId: string;
    targetLevel?: ProficiencyLevel;
    indicatorCountPerLevel?: number;
}

/**
 * Smart Indicator Selection Algorithm
 * 
 * Generates an assessment structure based on Role competencies and proficiency levels.
 */
export async function generateRoleAssessmentStructure(criteria: SelectionCriteria) {
    const { roleId, indicatorCountPerLevel = 3 } = criteria;

    // 1. Fetch Role with mapped competencies
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
            competencies: {
                include: {
                    competency: {
                        include: {
                            indicators: true
                        }
                    }
                }
            }
        }
    });

    if (!role) throw new Error("Role not found");

    const assessmentStructure: any[] = [];

    // 2. For each competency, select target indicators
    for (const roleComp of role.competencies) {
        const targetLevel = roleComp.requiredLevel;
        const competency = roleComp.competency;

        // Filter indicators for the target level
        const levelIndicators = competency.indicators.filter(ind => ind.level === targetLevel);

        // Split into positive and negative
        const positives = levelIndicators.filter(ind => ind.type === 'POSITIVE');
        const negatives = levelIndicators.filter(ind => ind.type === 'NEGATIVE');

        // Select a subset (Smart Shuffle/Pick)
        const selectedPositives = shuffle(positives).slice(0, Math.ceil(indicatorCountPerLevel * 0.7));
        const selectedNegatives = shuffle(negatives).slice(0, Math.floor(indicatorCountPerLevel * 0.3));

        assessmentStructure.push({
            competencyId: competency.id,
            competencyName: competency.name,
            requiredLevel: targetLevel,
            indicators: [...selectedPositives, ...selectedNegatives]
        });
    }

    return assessmentStructure;
}

/**
 * Assign an assessment model to an Organization Unit
 * (Rolls up to all members in that unit and its children recursively)
 * Enhancement #2: Skips students when model targetLevel is SENIOR/EXPERT; returns skipped count.
 */
export async function assignToOrgUnit(orgUnitId: string, assessmentModelId: string, assignedBy: string): Promise<{
    assignments: Awaited<ReturnType<typeof prisma.memberAssessment.create>>[];
    skippedStudentCount: number;
}> {
    const memberIds = await getMemberIdsInUnitRecursive(orgUnitId);
    const model = await prisma.assessmentModel.findUnique({
        where: { id: assessmentModelId },
        select: { targetLevel: true },
    });
    if (!model) throw new Error("Assessment model not found");

    let eligibleMemberIds = memberIds;
    let skippedStudentCount = 0;

    if (isLevelRestrictedForStudents(model.targetLevel)) {
        const members = await prisma.member.findMany({
            where: { id: { in: memberIds } },
            select: { id: true, type: true, hasGraduated: true },
        });
        const ineligible = getIneligibleMemberIds(members, model.targetLevel);
        eligibleMemberIds = memberIds.filter((id) => !ineligible.includes(id));
        skippedStudentCount = ineligible.length;
    }

    const assignments = await Promise.all(
        eligibleMemberIds.map((memberId) =>
            prisma.memberAssessment.create({
                data: {
                    memberId,
                    assessmentModelId,
                    assignedBy,
                    assignmentType: "ASSIGNED",
                    status: "DRAFT",
                },
            })
        )
    );

    return { assignments, skippedStudentCount };
}

/**
 * Recursively fetch all member IDs within an organizational unit hierarchy
 */
async function getMemberIdsInUnitRecursive(orgUnitId: string): Promise<string[]> {
    const members = await prisma.member.findMany({
        where: { orgUnitId, isActive: true },
        select: { id: true }
    });

    let memberIds = members.map(m => m.id);

    // Fetch child units
    const childUnits = await prisma.organizationUnit.findMany({
        where: { parentId: orgUnitId },
        select: { id: true }
    });

    // Recurse
    for (const unit of childUnits) {
        const childMemberIds = await getMemberIdsInUnitRecursive(unit.id);
        memberIds = [...memberIds, ...childMemberIds];
    }

    return Array.from(new Set(memberIds)); // Re-ensure uniqueness
}

function shuffle(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
}
