import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const competencies = await prisma.roleCompetency.findMany({
            where: { roleId: id },
            include: { competency: true },
            orderBy: { competency: { name: 'asc' } }
        });

        return NextResponse.json(competencies);
    } catch (error) {
        console.error("Fetch role competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { competencyId, requiredLevel, weight } = body;

        if (!competencyId) {
            return NextResponse.json({ error: "Competency is required" }, { status: 400 });
        }

        const mapping = await prisma.roleCompetency.create({
            data: {
                roleId: id,
                competencyId,
                requiredLevel: requiredLevel || 'INTERMEDIATE',
                weight: weight || 1.0
            },
            include: { competency: true }
        });

        return NextResponse.json(mapping);
    } catch (error) {
        console.error("Link competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
