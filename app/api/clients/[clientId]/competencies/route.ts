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

    // Fetch Global + Tenant-specific Competencies
    try {
        const competencies = await prisma.competency.findMany({
            where: {
                OR: [
                    { tenantId: null },
                    { tenantId: clientId }
                ],
                status: { in: ['APPROVED', 'DRAFT'] }
            },
            take: 200,
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(competencies);
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

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, description, category, submitForApproval } = body;

        if (!name || !description || !category) {
            return NextResponse.json({ error: "Name, description and category are required" }, { status: 400 });
        }

        const status = submitForApproval ? 'PENDING' : 'DRAFT';

        const competency = await prisma.competency.create({
            data: {
                name,
                description,
                category: category || 'TECHNICAL',
                tenantId: clientId,
                status: status as any,
                industries: ['GENERIC'],
            }
        });

        if (submitForApproval) {
            await prisma.approvalRequest.create({
                data: {
                    tenantId: clientId,
                    type: 'COMPETENCY',
                    entityId: competency.id,
                    status: 'PENDING',
                    originalData: competency as any,
                    comments: "Competency submission for approval"
                }
            });
        }

        return NextResponse.json(competency);
    } catch (error) {
        console.error("Create competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
