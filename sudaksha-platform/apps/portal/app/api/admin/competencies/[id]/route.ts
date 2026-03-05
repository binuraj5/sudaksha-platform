import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

const ALLOWED_ROLES = [
    "SUPER_ADMIN", "ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN",
    "DEPARTMENT_HEAD", "DEPT_HEAD", "TEAM_LEAD", "CLASS_TEACHER",
];

function hasAccess(session: any): boolean {
    const u = session?.user as { role?: string; userType?: string } | undefined;
    if (!u) return false;
    if (u.userType === "SUPER_ADMIN") return true;
    return !!u.role && ALLOWED_ROLES.includes(u.role);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, category, description } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const existing = await prisma.competency.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const updated = await prisma.competency.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(category !== undefined && { category }),
                ...(description !== undefined && { description }),
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "A competency with this name already exists." }, { status: 409 });
        }
        console.error("[COMPETENCY_PATCH]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || !hasAccess(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const existing = await prisma.competency.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.competency.delete({ where: { id } });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[COMPETENCY_DELETE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
