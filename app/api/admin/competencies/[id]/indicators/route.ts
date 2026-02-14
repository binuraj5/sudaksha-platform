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

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const indicators = await prisma.competencyIndicator.findMany({
            where: { competencyId: id },
            orderBy: { level: 'asc' }
        });

        return NextResponse.json(indicators);
    } catch (error) {
        console.error("Fetch indicators error:", error);
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

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Handle Bulk Create
        if (Array.isArray(body)) {
            const results = await prisma.$transaction(
                body.map((ind: any) =>
                    prisma.competencyIndicator.create({
                        data: {
                            competencyId: id,
                            text: ind.text || ind.description,
                            level: ind.level || 'MIDDLE',
                            type: ind.type || 'POSITIVE'
                        }
                    })
                )
            );
            return NextResponse.json({ success: true, count: results.length, indicators: results });
        }

        // Handle Single Create
        const { text, description, level, type } = body;
        const finalContent = text || description;

        if (!finalContent) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const indicator = await prisma.competencyIndicator.create({
            data: {
                competencyId: id,
                text: finalContent,
                level: level || 'MIDDLE',
                type: type || 'POSITIVE'
            }
        });

        return NextResponse.json(indicator);
    } catch (error) {
        console.error("Create indicator error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
