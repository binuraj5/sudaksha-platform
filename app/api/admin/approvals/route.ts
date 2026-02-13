import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    const session = await getApiSession();

    if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    try {
        const requests = await prisma.approvalRequest.findMany({
            where: {
                ...(status ? { status: status as any } : {}),
                ...(type ? { type: type as any } : {}),
            },
            include: {
                tenant: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("[APPROVALS_GET]", error);
        return NextResponse.json({ error: "Failed to load approval requests" }, { status: 500 });
    }
}
