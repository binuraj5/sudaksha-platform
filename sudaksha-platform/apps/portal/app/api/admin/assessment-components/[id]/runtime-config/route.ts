import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: componentId } = await params;

        const config = await (prisma as any).runtimeGenerationConfig.findUnique({
            where: { componentId },
        });

        return NextResponse.json(config || { enabled: false });
    } catch (error) {
        console.error('Fetch runtime config error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch runtime configuration' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: componentId } = await params;
        const body = await request.json();

        const config = await (prisma as any).runtimeGenerationConfig.upsert({
            where: { componentId },
            update: {
                ...body,
                updatedAt: new Date(),
            },
            create: {
                ...body,
                componentId,
            },
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error('Update runtime config error:', error);
        return NextResponse.json(
            { error: 'Failed to update runtime configuration' },
            { status: 500 }
        );
    }
}
