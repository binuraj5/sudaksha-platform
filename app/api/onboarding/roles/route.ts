import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: Request) {
    const session = await getApiSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const roles = await prisma.role.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                competencies: {
                    select: { competency: { select: { id: true, name: true, category: true } } }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("[ONBOARDING_ROLES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
