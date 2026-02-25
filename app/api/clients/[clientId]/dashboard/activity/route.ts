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
        // Scoping: Find users whose actions we can see
        let memberWhere: any = { tenantId: clientId };
        if (((userRole === 'DEPARTMENT_HEAD' || userRole === 'DEPT_HEAD') || userRole === 'TEAM_LEAD') && managedOrgUnitId) {
            let scopeIds = [managedOrgUnitId];
            if (userRole !== 'TEAM_LEAD') {
                const childUnits = await prisma.organizationUnit.findMany({
                    where: { parentId: managedOrgUnitId, tenantId: clientId },
                    select: { id: true }
                });
                scopeIds = [managedOrgUnitId, ...childUnits.map(u => u.id)];
            }
            memberWhere.orgUnitId = { in: scopeIds };
        }

        const members = await prisma.member.findMany({
            where: memberWhere,
            select: { email: true }
        });

        const emails = members.map(m => m.email);

        // Fetch audit logs for these users
        // Note: AuditLog stores userName or userId. We'll try to find by userId if we can resolve them via email.
        const users = await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { id: true }
        });
        const userIds = users.map(u => u.id);

        const logs = await prisma.auditLog.findMany({
            where: {
                OR: [
                    { userId: { in: userIds } },
                    { userName: { in: emails } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json(logs.map(log => ({
            id: log.idEntity,
            action: log.action,
            entityName: log.entityName || log.entityType,
            userName: log.userName || "System",
            createdAt: log.createdAt,
            details: log.details
        })));

    } catch (error) {
        console.error("Dashboard Activity Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
