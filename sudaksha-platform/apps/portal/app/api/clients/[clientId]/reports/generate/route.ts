import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// SEPL/INT/2026/IMPL-GAPS-01 Step G20 — S3 persistence for generated PDFs
import { uploadReportPDF, isS3Configured } from "@/lib/storage";

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * PDF generator using pdf-lib.
 * SEPL/INT/2026/IMPL-GAPS-01 Step G20 + Phase 3 T25 PDF integration.
 */
async function generateReportPDF(
    templateId: string,
    filters: unknown,
    tenantId: string,
): Promise<Buffer | null> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText(`Sudaksha Report - Tenant: ${tenantId}`, {
        x: 50,
        y: height - 50,
        size: 24,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.5),
    });

    page.drawText(`Template ID: ${templateId}`, {
        x: 50,
        y: height - 100,
        size: 14,
        font,
    });

    page.drawText(`Filters: ${JSON.stringify(filters || {})}`, {
        x: 50,
        y: height - 130,
        size: 12,
        font,
    });

    page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
        x: 50,
        y: 50,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

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

        // Create the report row first so we have an ID to use as the S3 key.
        const report = await prisma.report.create({
            data: {
                tenantId: clientId,
                templateId,
                userId: session.user.id,
                name: name || `${template.name} - ${new Date().toLocaleDateString()}`,
                filters: filters || {},
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        // SEPL/INT/2026/IMPL-GAPS-01 Step G20 — generate + persist PDF to S3.
        // The PDF generator currently returns null (no renderer wired yet);
        // when implemented, this block will upload to S3 and store the key.
        const pdfBuffer = await generateReportPDF(templateId, filters, clientId);

        if (pdfBuffer && isS3Configured()) {
            try {
                const s3Key = await uploadReportPDF(report.id, pdfBuffer);
                await prisma.report.update({
                    where: { id: report.id },
                    data: { fileUrl: s3Key, status: 'COMPLETED' },
                });
                return NextResponse.json({ ...report, fileUrl: s3Key, status: 'COMPLETED' });
            } catch (s3Err) {
                console.error('[Report] S3 upload failed:', s3Err);
                // Don't fail the whole flow — keep the row in PENDING so a job
                // can retry the upload, and the user still sees the report listed.
                await prisma.report.update({
                    where: { id: report.id },
                    data: { status: 'UPLOAD_FAILED' },
                });
                return NextResponse.json({ ...report, status: 'UPLOAD_FAILED' });
            }
        }

        // No PDF generated yet (mock path) — mark as PENDING so the UI knows
        // the file is not downloadable. fileUrl stays null.
        return NextResponse.json(report);

    } catch (error) {
        console.error('[Report] Generation error:', error);
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
