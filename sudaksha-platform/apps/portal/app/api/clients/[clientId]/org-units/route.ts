import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/clients/{clientId}/org-units
 * Returns filterable organization units with RLS (Row Level Security)
 * Supports polymorphic queries: type=DEPARTMENT, type=TEAM, type=CLASS, etc.
 * 
 * Query params:
 * - type: Filter by unit type (DEPARTMENT, TEAM, CLASS)
 * - includeHierarchy: Include parent-child relationships (default: false)
 * - assignable: Only units the user can assign employees to (default: true)
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD'];
    if (!allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // e.g., DEPARTMENT, TEAM, CLASS
        const includeHierarchy = searchParams.get('includeHierarchy') === 'true';
        const assignable = searchParams.get('assignable') !== 'false'; // default true

        // RLS: Build visibility filter based on user role
        const whereClause: any = {
            tenantId: clientId,
            isActive: true
        };

        if (type) {
            whereClause.type = type;
        }

        // RLS Logic: Department Heads can only see their own department and teams within it
        if (session.user.role === 'DEPARTMENT_HEAD' || session.user.role === 'DEPT_HEAD') {
            const managedUnitId = (session.user as any).managedOrgUnitId;
            if (managedUnitId) {
                if (assignable) {
                    // Can assign to own department or teams within it
                    const managedUnit = await prisma.organizationUnit.findUnique({
                        where: { id: managedUnitId },
                        select: { id: true, type: true }
                    });
                    if (managedUnit?.type === 'DEPARTMENT') {
                        // Get this department and all teams under it
                        whereClause.OR = [
                            { id: managedUnitId },
                            { parentId: managedUnitId }
                        ];
                    } else {
                        whereClause.id = managedUnitId;
                    }
                }
            } else {
                return NextResponse.json({ error: "Department Head without Unit" }, { status: 403 });
            }
        }

        // RLS Logic: Team Leads can only see their team
        if (session.user.role === 'TEAM_LEAD') {
            const managedUnitId = (session.user as any).managedOrgUnitId;
            if (managedUnitId) {
                whereClause.id = managedUnitId;
            } else {
                return NextResponse.json({ error: "Team Lead without Unit" }, { status: 403 });
            }
        }

        const orgUnits = await prisma.organizationUnit.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                code: true,
                type: true,
                description: true,
                parentId: true,
                isActive: true,
                ...(includeHierarchy && {
                    parent: {
                        select: { id: true, name: true, type: true }
                    }
                })
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json(orgUnits);
    } catch (error) {
        console.error("Error fetching org units:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
