import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // M2/M3 scoped access: Dept Head and Team Lead see only their scope
    let memberWhere: any = { tenantId: clientId, type: 'EMPLOYEE' };
    let orgUnitWhere: any = { tenantId: clientId };
    let activityWhere: any = { tenantId: clientId };

    if ((userRole === 'DEPARTMENT_HEAD' || userRole === 'DEPT_HEAD') && managedOrgUnitId) {
        const childIds = await prisma.organizationUnit.findMany({
            where: { parentId: managedOrgUnitId, tenantId: clientId },
            select: { id: true }
        });
        const scopeIds = [managedOrgUnitId, ...childIds.map((c) => c.id)];
        memberWhere.orgUnitId = { in: scopeIds };
        orgUnitWhere = {
            tenantId: clientId,
            OR: [{ id: managedOrgUnitId }, { parentId: managedOrgUnitId }]
        };
    } else if (userRole === 'TEAM_LEAD' && managedOrgUnitId) {
        memberWhere.orgUnitId = managedOrgUnitId;
        orgUnitWhere = { tenantId: clientId, id: managedOrgUnitId };
    }

    try {
        // 1. Employee Stats
        const [totalEmployees, activeEmployees] = await Promise.all([
            prisma.member.count({ where: { ...memberWhere } }),
            prisma.member.count({ where: { ...memberWhere, isActive: true } })
        ]);

        // 2. Department & Team Stats (scoped for M2/M3)
        const departmentsCount = await prisma.organizationUnit.count({
            where: { ...orgUnitWhere, type: 'DEPARTMENT' }
        });

        const teamsCount = await prisma.organizationUnit.count({
            where: { ...orgUnitWhere, type: 'TEAM' }
        });

        // 3. Project/Activity Stats
        const activeProjects = await prisma.activity.count({
            where: { ...activityWhere, status: 'ACTIVE' }
        });
        const completedProjects = await prisma.activity.count({
            where: { ...activityWhere, status: 'COMPLETED' }
        });

        // 4. Assessment Stats (scoped by member)
        const assessments = await prisma.memberAssessment.groupBy({
            by: ['status'],
            where: {
                member: memberWhere
            },
            _count: true
        });

        const completedAssessments = assessments.find(a => a.status === 'COMPLETED')?._count || 0;
        const pendingAssessments = assessments.filter(a => a.status !== 'COMPLETED').reduce((acc, curr) => acc + curr._count, 0);

        // 5. Avg Performance (scoped)
        const performance = await prisma.memberAssessment.aggregate({
            where: {
                member: memberWhere,
                status: 'COMPLETED',
                overallScore: { not: null }
            },
            _avg: { overallScore: true }
        });

        const lastMonthEmployees = await prisma.member.count({
            where: {
                ...memberWhere,
                createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
        });

        const employeeTrend = lastMonthEmployees > 0
            ? ((totalEmployees - lastMonthEmployees) / lastMonthEmployees) * 100
            : 0;

        return NextResponse.json({
            employees: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: totalEmployees - activeEmployees,
                trend: employeeTrend
            },
            departments: {
                total: departmentsCount,
                avgEmployeesPerDept: departmentsCount > 0 ? Math.round(totalEmployees / departmentsCount) : 0
            },
            projects: {
                total: activeProjects + completedProjects,
                active: activeProjects,
                completed: completedProjects
            },
            teams: {
                total: teamsCount,
                avgSize: 0 // Simplification for now
            },
            assessments: {
                pending: pendingAssessments,
                completed: completedAssessments,
                avgScore: performance._avg.overallScore || 0
            },
            performance: {
                overall: performance._avg.overallScore || 0,
                byDepartment: [] // To be implemented with complex group by if needed
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
