import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const competencies = await prisma.competency.findMany({
            include: {
                _count: {
                    select: { indicators: true, roleLinks: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(competencies);
    } catch (error) {
        console.error("Fetch competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, description } = body;

        if (!name || !category) {
            return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
        }

        const competency = await prisma.competency.create({
            data: {
                name,
                category,
                description: description || ""
            }
        });

        return NextResponse.json(competency);
    } catch (error) {
        console.error("Create competency error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
