import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userClientId = (session.user as any).clientId || (session.user as any).tenantId;
    const managedOrgUnitId = (session.user as any).managedOrgUnitId;

    if (userRole !== 'SUPER_ADMIN' && userClientId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Scoped access: Determine which members' assessments we can see
        let scopedEmployeeIds: string[] | null = null;

        if (((userRole === 'DEPARTMENT_HEAD' || userRole === 'DEPT_HEAD') || userRole === 'TEAM_LEAD') && managedOrgUnitId) {
            let scopeIds = [managedOrgUnitId];
            if (userRole !== 'TEAM_LEAD') {
                const childUnits = await prisma.organizationUnit.findMany({
                    where: { parentId: managedOrgUnitId, tenantId: clientId },
                    select: { id: true }
                });
                scopeIds = [managedOrgUnitId, ...childUnits.map(u => u.id)];
            }

            const members = await prisma.member.findMany({
                where: {
                    tenantId: clientId,
                    orgUnitId: { in: scopeIds },
                    employeeId: { not: null }
                },
                select: { employeeId: true }
            });
            scopedEmployeeIds = members.map(m => m.employeeId!) as string[];
        }

        // Prepare filter for UserAssessmentComponent
        const whereClause: any = {
            userAssessmentModel: {
                user: {
                    clientId: clientId, // Filter by tenant
                }
            },
            status: 'COMPLETED'
        };

        if (scopedEmployeeIds) {
            whereClause.userAssessmentModel.user.employeeId = { in: scopedEmployeeIds };
        }

        // Fetch completed component results
        const results = await prisma.userAssessmentComponent.findMany({
            where: whereClause,
            include: {
                component: {
                    include: {
                        competency: true
                    }
                }
            },
            take: 1000
        });

        // Group by Competency
        const competencyMap = new Map<string, { total: number; count: number; name: string }>();

        results.forEach(res => {
            const competencyName = (res as any).component?.competency?.name || "General";
            const score = res.percentage || 0;

            if (!competencyMap.has(competencyName)) {
                competencyMap.set(competencyName, { total: 0, count: 0, name: competencyName });
            }
            const entry = competencyMap.get(competencyName)!;
            entry.total += score;
            entry.count += 1;
        });

        const gaps = Array.from(competencyMap.values()).map(c => {
            const currentLevel = c.total / c.count;
            const targetLevel = 85; // Target
            const gapValue = targetLevel - currentLevel;

            let gapSeverity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            if (gapValue > 40) gapSeverity = 'HIGH';
            else if (gapValue > 20) gapSeverity = 'MEDIUM';

            return {
                competency: c.name,
                currentLevel: Math.round(currentLevel),
                targetLevel: targetLevel,
                gap: gapSeverity,
                employeesAffected: c.count
            };
        });

        const sortedGaps = gaps.sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel)).slice(0, 10);

        return NextResponse.json(sortedGaps);

    } catch (error) {
        console.error("Gap Analysis Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
