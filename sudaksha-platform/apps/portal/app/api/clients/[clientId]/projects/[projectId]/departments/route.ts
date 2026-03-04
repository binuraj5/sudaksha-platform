import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ clientId: string, projectId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, projectId } = await params;

        if (!session || (session.user.role !== "TENANT_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role === "TENANT_ADMIN" && session.user.tenantId !== clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Verify activity belongs to tenant
        const activity = await prisma.activity.findFirst({
            where: { id: projectId, tenantId: clientId }
        });

        if (!activity) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        const orgUnits = await prisma.organizationUnit.findMany({
            where: {
                scopedActivities: {
                    some: { activityId: projectId }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(orgUnits);
    } catch (error) {
        console.error("Fetch org units error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ clientId: string, projectId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, projectId } = await params;

        if (!session || (session.user.role !== "TENANT_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role === "TENANT_ADMIN" && session.user.tenantId !== clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Verify activity belongs to tenant
        const activity = await prisma.activity.findFirst({
            where: { id: projectId, tenantId: clientId }
        });

        if (!activity) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        const body = await request.json();
        const { name, code, description, headName } = body;

        if (!name || !code) {
            return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
        }

        const orgUnit = await prisma.organizationUnit.create({
            data: {
                name,
                code: code.toUpperCase(),
                tenantId: clientId,
                // headName, // Not directly supported on model
                // type: type as any,
                description,
                scopedActivities: {
                    create: { activityId: projectId }
                }
            }
        });

        return NextResponse.json(orgUnit);
    } catch (error: any) {
        console.error("Create org unit error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "An org unit with this code already exists in this activity" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
