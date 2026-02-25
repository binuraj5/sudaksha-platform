import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Assign assessment to all members in an org unit (class/department)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getApiSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  // Ensure slug points to valid tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const body = await req.json();
  const { orgUnitId, assessmentModelId } = body; // removed dueDate since it's not in schema

  if (!orgUnitId || !assessmentModelId) {
    return NextResponse.json({ error: "orgUnitId and assessmentModelId are required" }, { status: 400 });
  }

  // Get all members in this org unit (and child units recursively)
  async function getMembersInUnit(unitId: string): Promise<string[]> {
    const unit = await prisma.organizationUnit.findUnique({
      where: { id: unitId },
      include: {
        members: true,
        children: true
      }
    });

    if (!unit) return [];

    const memberIds = unit.members.map(m => m.id);

    // Recursively get members from child units
    for (const child of unit.children) {
      const childMembers = await getMembersInUnit(child.id);
      memberIds.push(...childMembers);
    }

    return memberIds;
  }

  const memberIds = await getMembersInUnit(orgUnitId);

  // Filter out students if assessment is SENIOR/EXPERT level
  const model = await prisma.assessmentModel.findUnique({
    where: { id: assessmentModelId }
  });

  if (!model) {
    return NextResponse.json({ error: "Assessment Model not found" }, { status: 404 });
  }

  let eligibleMemberIds = memberIds;

  if (model.targetLevel && ['SENIOR', 'EXPERT'].includes(model.targetLevel)) {
    // Only assign to members who are not students (or are graduated students)
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } }
    });

    eligibleMemberIds = members
      .filter(m => m.type !== 'STUDENT' || m.hasGraduated)
      .map(m => m.id);
  }

  // Create MemberAssessment for each eligible member
  const assignerId = session.user.id as string;

  const assignments = await Promise.all(
    eligibleMemberIds.map(async (memberId) => {
      // ensure MemberAssessment doesn't already exist for this combination
      const existing = await prisma.memberAssessment.findFirst({
        where: { memberId, assessmentModelId }
      });

      if (existing) return existing;

      return prisma.memberAssessment.create({
        data: {
          memberId,
          assessmentModelId,
          assignmentType: 'ASSIGNED',
          assignedBy: assignerId,
          status: 'DRAFT' as any
        }
      });
    })
  );

  return NextResponse.json({
    assigned: assignments.length,
    total: memberIds.length,
    skipped: memberIds.length - assignments.length,
    message: `Assessment assigned to ${assignments.length} members`
  }, { status: 201 });
}
