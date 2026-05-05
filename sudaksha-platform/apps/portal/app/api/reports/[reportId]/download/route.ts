/**
 * Report Download Endpoint
 * SEPL/INT/2026/IMPL-GAPS-01 Step G20
 * Patent claim C-09 — signed-URL retrieval for persisted report PDFs
 *
 * GET /api/reports/[reportId]/download
 *   Auth: requires session
 *   Authz: report must belong to caller's tenant (SUPER_ADMIN bypasses)
 *   Returns: 302 redirect to a 1-hour signed S3 URL
 *
 * Failure modes:
 *   • 401 — no session
 *   • 403 — caller not in the report's tenant (and not SUPER_ADMIN)
 *   • 404 — report not found, or fileUrl unset (PDF not yet generated)
 *   • 503 — S3 unconfigured / signing failed
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getReportSignedUrl, isS3Configured, reportExists } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await params;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, tenantId: true, fileUrl: true, status: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Tenant-scope guard
  const userRole = (session.user as any).role;
  const userTenantId = (session.user as any).clientId ?? (session.user as any).tenantId;
  if (userRole !== "SUPER_ADMIN" && userTenantId !== report.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // No PDF yet — file not generated or upload failed
  if (!report.fileUrl || report.fileUrl === "#") {
    return NextResponse.json(
      { error: "Report PDF not available yet", status: report.status },
      { status: 404 },
    );
  }

  if (!isS3Configured()) {
    return NextResponse.json(
      { error: "S3 storage is not configured on this server" },
      { status: 503 },
    );
  }

  try {
    // Verify the object actually exists in the bucket — saves the user from
    // following a signed URL that returns AWS XML 404.
    const exists = await reportExists(report.fileUrl);
    if (!exists) {
      return NextResponse.json({ error: "Stored file not found in bucket" }, { status: 404 });
    }

    const signedUrl = await getReportSignedUrl(report.fileUrl, 3600);
    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    console.error("[Report Download] Sign error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 503 },
    );
  }
}
