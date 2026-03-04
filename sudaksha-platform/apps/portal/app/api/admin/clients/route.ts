import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma"; // Force refresh named import

export async function GET() {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: { members: true, activities: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tenants);
    } catch (error) {
        console.error("Fetch tenants error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, slug, type } = body;

        if (!name || !email || !slug) {
            return NextResponse.json({ error: "Name, Email, and Slug are required" }, { status: 400 });
        }

        const tenant = await prisma.tenant.create({
            data: {
                name,
                email,
                slug: slug.toLowerCase(),
                type: type || 'CORPORATE',
                isActive: true,
                subscriptionStart: new Date(),
                createdBy: session.user.id
            }
        });

        return NextResponse.json(tenant);
    } catch (error: any) {
        console.error("Create tenant error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "A tenant with this email or slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
