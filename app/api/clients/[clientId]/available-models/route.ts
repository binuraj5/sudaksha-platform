import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId } = await params;

        const user = session?.user as any;
        if (!session || !user || (user.role !== "SUPER_ADMIN" && user.clientId !== clientId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const models = await prisma.assessmentModel.findMany({
            where: {
                isActive: true,
                status: { in: ["PUBLISHED", "ACTIVE"] },
                OR: [
                    { tenantId: null },
                    { clientId: clientId }
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                durationMinutes: true,
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(models);
    } catch (error) {
        console.error("Fetch available models error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
