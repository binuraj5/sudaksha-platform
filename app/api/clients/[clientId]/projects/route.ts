import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'MANAGER', 'PROJECT_MANAGER'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    try {
        const whereClause: any = {
            tenantId: clientId,
            type: 'PROJECT'
        };

        if (status && status !== 'all') {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }

        const projects = await prisma.activity.findMany({
            where: whereClause,
            include: {
                owner: { select: { id: true, name: true, avatar: true } },
                _count: {
                    select: {
                        members: true,
                        assessments: true
                    }
                },
                orgUnits: { include: { orgUnit: true } }, // Departments
                members: { include: { member: { select: { id: true, name: true, avatar: true, role: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format for easier consumption
        const formatted = projects.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code,
            description: p.description,
            status: p.status,
            startDate: p.startDate,
            endDate: p.endDate,
            owner: p.owner,
            stats: {
                members: p._count.members,
                assessments: p._count.assessments,
                progress: 0 // Logic for progress based on assessment completion needed later
            },
            departments: p.orgUnits.map(ou => ({ id: ou.orgUnit.id, name: ou.orgUnit.name })),
            teamData: p.members.map(m => m.member).slice(0, 5) // Preview members
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("Projects GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, description, startDate, endDate, status, ownerId, departmentIds, employeeIds, budget, priority, curriculumNodeId } = body;

        // Validation
        if (!name || !startDate) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        // Auto-code
        const count = await prisma.activity.count({ where: { tenantId: clientId, type: 'PROJECT' } });
        const code = `PROJ${String(count + 1).padStart(3, '0')}`;

        const project = await prisma.activity.create({
            data: {
                tenantId: clientId,
                type: 'PROJECT',
                name,
                slug: code, // Using slug as code identifier logic for now if slug required
                code,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status: status || 'PLANNED',
                ownerId,
                createdBy: session.user.id,
                metadata: { budget, priority },
                orgUnits: {
                    create: (departmentIds || []).map((id: string) => ({ orgUnitId: id }))
                },
                members: {
                    create: (employeeIds || []).map((id: string) => ({ memberId: id }))
                },
                curriculumNodes: curriculumNodeId ? {
                    create: [{ curriculumNodeId }]
                } : undefined
            }
        });

        return NextResponse.json(project);

    } catch (error) {
        console.error("Project Create Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
