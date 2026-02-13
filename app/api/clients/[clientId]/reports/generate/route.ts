import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();
        const { templateId, name, filters } = body;

        const template = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

        // Mock Generation Process
        // In real app, this might trigger a background job or generate PDF/Excel using libraries
        const report = await prisma.report.create({
            data: {
                tenantId: clientId,
                templateId,
                userId: session.user.id,
                name: name || `${template.name} - ${new Date().toLocaleDateString()}`,
                filters: filters || {},
                status: 'COMPLETED', // Instant for mock
                fileUrl: '#', // Mock URL
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        return NextResponse.json(report);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // List My Reports
    const reports = await prisma.report.findMany({
        where: { tenantId: clientId, userId: session.user.id },
        include: { template: true },
        orderBy: { generatedAt: 'desc' }
    });

    return NextResponse.json(reports);
}
