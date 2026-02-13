import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const roles = await prisma.role.findMany({
            include: {
                _count: {
                    select: { competencies: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("Fetch roles error:", error);
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
        const { name, description, industry } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const role = await prisma.role.create({
            data: {
                name,
                description: description || "",
                industries: [industry || "GENERIC"] as any
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error("Create role error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
