import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get('deptId');
    const search = searchParams.get('search');

    try {
        const whereClause: any = {
            tenantId: clientId,
            type: 'TEAM',
            isActive: true
        };

        const isDeptHead = session.user.role === 'DEPARTMENT_HEAD' || session.user.role === 'DEPT_HEAD';
        const isTeamLead = session.user.role === 'TEAM_LEAD';
        const isAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'TENANT_ADMIN' || session.user.role === 'CLIENT_ADMIN';

        if (isDeptHead) {
            const managedUnit = (session.user as any).managedOrgUnitId;
            if (!managedUnit) return NextResponse.json({ error: "Department Head without Unit" }, { status: 403 });
            whereClause.parentId = managedUnit;
        } else if (isTeamLead) {
            const managedUnit = (session.user as any).managedOrgUnitId;
            if (!managedUnit) return NextResponse.json({ error: "Team Lead without Unit" }, { status: 403 });
            whereClause.id = managedUnit;
        }

        if (deptId && !isDeptHead && isAdmin) {
            whereClause.parentId = deptId;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }

        const teams = await prisma.organizationUnit.findMany({
            where: whereClause,
            include: {
                manager: { select: { id: true, name: true, avatar: true } },
                parent: { select: { id: true, name: true } },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        const formatted = teams.map(t => ({
            id: t.id,
            name: t.name,
            code: t.code,
            description: t.description,
            department: t.parent,
            manager: t.manager,
            memberCount: t._count.members,
            performance: 0 // logic later
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, parentId, managerId, description } = body;

        // Force Parent ID for Department Head (DEPT_HEAD = DEPARTMENT_HEAD)
        const isDeptHead = session.user.role === 'DEPARTMENT_HEAD' || session.user.role === 'DEPT_HEAD';
        const targetParentId = isDeptHead ? (session.user as any).managedOrgUnitId : parentId;

        if (isDeptHead && !targetParentId) {
            return NextResponse.json({ error: "Department Head configuration error" }, { status: 403 });
        }

        if (!name || !targetParentId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        // Auto-code
        const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'TM');
        const random = Math.floor(100 + Math.random() * 900);
        const code = `${prefix}${random}`;

        // Create Team
        // If managerId is provided, we should probably ensure they are in the team?
        // But we can't be in the team until the team exists.
        // So we create team first, then update member.

        const team = await prisma.$transaction(async (tx) => {
            const t = await tx.organizationUnit.create({
                data: {
                    tenantId: clientId,
                    type: 'TEAM',
                    name,
                    code,
                    description,
                    parentId: targetParentId, // Link to Department
                    managerId: managerId || null,
                    isActive: true
                }
            });

            if (managerId) {
                await tx.member.update({
                    where: { id: managerId },
                    data: { orgUnitId: t.id } // Move manager to team
                });
            }
            return t;
        });

        return NextResponse.json(team);

    } catch (error) {
        console.error("Team Create Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
