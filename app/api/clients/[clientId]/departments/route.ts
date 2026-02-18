import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER', 'EMPLOYEE', 'MANAGER', 'ASSESSOR', 'STUDENT'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userTenantId = (session.user as { clientId?: string; tenantId?: string }).clientId ?? (session.user as any).tenantId;
    if (session.user.role !== 'SUPER_ADMIN' && userTenantId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'
    const search = searchParams.get('search');

    try {
        const whereClause: any = {
            tenantId: clientId,
            type: 'DEPARTMENT'
        };

        const isDeptHead = session.user.role === 'DEPARTMENT_HEAD' || session.user.role === 'DEPT_HEAD';
        if (isDeptHead) {
            const managedUnitId = (session.user as any).managedOrgUnitId;
            if (managedUnitId) {
                whereClause.id = managedUnitId;
            } else {
                return NextResponse.json({ error: "No managed department assigned" }, { status: 403 });
            }
        }

        if (status === 'active') whereClause.isActive = true;
        if (status === 'inactive') whereClause.isActive = false;

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }

        const departments = await prisma.organizationUnit.findMany({
            where: whereClause,
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        children: true, // Teams
                        members: true   // Direct members
                    }
                },
                // To get total employees including sub-teams, we might need to fetch children's member counts
                // But for list view, direct members + team members (implied) is better.
                // Prisma doesn't support recursive count easily.
                // We will fetch children to sum their members if needed, but for complexity we might skip strictly exact recursive count in list view 
                // OR fetch children IDs and count members separately.
                // Let's stick to simple _count first.
                children: {
                    select: {
                        _count: {
                            select: { members: true } // Members in sub-teams
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        const formatted = departments.map(d => ({
            id: d.id,
            name: d.name,
            code: d.code,
            description: d.description,
            isActive: d.isActive,
            manager: d.manager,
            stats: {
                teams: d._count.children,
                employees: d._count.members + d.children.reduce((acc, curr) => acc + curr._count.members, 0),
                projects: 0 // Need separate query or relation for ActivityOrgUnit
            }
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("Departments GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, description, code, managerId } = body;

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        // Generate Code if missing
        let deptCode = code;
        if (!deptCode) {
            const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'DP');
            const random = Math.floor(100 + Math.random() * 900);
            deptCode = `${prefix}${random}`;
        }

        const dept = await prisma.organizationUnit.create({
            data: {
                tenantId: clientId,
                type: 'DEPARTMENT',
                name,
                description,
                code: deptCode,
                managerId: managerId || null,
                isActive: true
            }
        });

        // If manager assigned, verify their type/role? Optional but good practice.

        return NextResponse.json(dept);

    } catch (error) {
        console.error("Departments POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
