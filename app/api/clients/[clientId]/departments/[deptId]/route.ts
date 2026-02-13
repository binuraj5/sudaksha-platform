import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; deptId: string }> }
) {
    const session = await getApiSession();
    const { clientId, deptId } = await params;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const dept = await prisma.organizationUnit.findUnique({
            where: { id: deptId },
            include: {
                manager: true,
                children: { // Teams
                    include: { manager: true, _count: { select: { members: true } } }
                },
                members: true, // Direct Employees
                scopedActivities: { include: { activity: true } } // Projects
            }
        });

        if (!dept || dept.tenantId !== clientId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(dept);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; deptId: string }> }
) {
    const session = await getApiSession();
    const { clientId, deptId } = await params;

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'TENANT_ADMIN')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const updated = await prisma.organizationUnit.update({
            where: { id: deptId },
            data: body
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; deptId: string }> }
) {
    const session = await getApiSession();
    const { clientId, deptId } = await params;
    const { searchParams } = new URL(req.url);
    const reassignTo = searchParams.get('reassignTo');

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'TENANT_ADMIN')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Transaction to handle reassignment and deactivation
        await prisma.$transaction(async (tx) => {
            if (reassignTo) {
                // Reassign Members
                await tx.member.updateMany({
                    where: { orgUnitId: deptId },
                    data: { orgUnitId: reassignTo }
                });

                // Reassign Teams (Children)
                await tx.organizationUnit.updateMany({
                    where: { parentId: deptId },
                    data: { parentId: reassignTo }
                });
            }

            // Soft Delete
            await tx.organizationUnit.update({
                where: { id: deptId },
                data: { isActive: false }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
