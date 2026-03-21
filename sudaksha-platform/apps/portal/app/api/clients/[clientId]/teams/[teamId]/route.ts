import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const team = await prisma.organizationUnit.findUnique({
            where: { id: teamId },
            include: {
                manager: true,
                parent: true,
                members: { include: { currentRole: true } },
                _count: { select: { members: true } }
            }
        });

        if (!team || team.tenantId !== clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(team);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, description, managerId } = body;

        const team = await prisma.organizationUnit.findUnique({
            where: { id: teamId, tenantId: clientId }
        });

        if (!team || team.type !== 'TEAM') return NextResponse.json({ error: "Team not found" }, { status: 404 });

        const updatedTeam = await prisma.$transaction(async (tx) => {
            const t = await tx.organizationUnit.update({
                where: { id: team.id },
                data: {
                    name: name || undefined,
                    description: description !== undefined ? description : undefined,
                    managerId: managerId || null
                }
            });

            if (managerId && managerId !== team.managerId) {
                await tx.member.update({
                    where: { id: managerId, tenantId: clientId },
                    data: { orgUnitId: t.id }
                });
            }
            return t;
        });

        return NextResponse.json(updatedTeam);
    } catch (error) {
        console.error("Team Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const team = await prisma.organizationUnit.findUnique({
            where: { id: teamId, tenantId: clientId }
        });

        if (!team || team.type !== 'TEAM') return NextResponse.json({ error: "Team not found" }, { status: 404 });

        await prisma.$transaction(async (tx) => {
            if (team.parentId) {
                await tx.member.updateMany({
                    where: { orgUnitId: team.id, tenantId: clientId },
                    data: { orgUnitId: team.parentId }
                });
            } else {
                await tx.member.updateMany({
                    where: { orgUnitId: team.id, tenantId: clientId },
                    data: { orgUnitId: null }
                });
            }

            await tx.organizationUnit.delete({
                where: { id: team.id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Team Delete Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
