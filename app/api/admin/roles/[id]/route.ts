import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if role exists
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        competencies: true,
                        assessmentModels: true,
                        users: true
                    }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        // Prevent deletion if role has dependencies
        if (role._count.users > 0) {
            return NextResponse.json(
                { error: `Cannot delete role. ${role._count.users} user(s) are assigned to this role.` },
                { status: 400 }
            );
        }

        if (role._count.assessmentModels > 0) {
            return NextResponse.json(
                { error: `Cannot delete role. ${role._count.assessmentModels} assessment model(s) are linked to this role.` },
                { status: 400 }
            );
        }

        // Delete role competency mappings first
        await prisma.roleCompetency.deleteMany({
            where: { roleId: id }
        });

        // Delete the role
        await prisma.role.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
        console.error("Delete role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                competencies: {
                    include: { competency: true }
                },
                _count: {
                    select: {
                        competencies: true,
                        assessmentModels: true
                    }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        return NextResponse.json(role);
    } catch (error) {
        console.error("Fetch role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, department, overallLevel, isActive } = body;

        const role = await prisma.role.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(department !== undefined && { department }),
                ...(overallLevel && { overallLevel }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error("Update role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
