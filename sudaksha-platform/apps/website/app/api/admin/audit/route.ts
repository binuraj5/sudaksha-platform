import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    return !!JSON.parse(raw)?.email;
  } catch { return false; }
}

// GET /api/admin/audit?search=&severity=&status=&dateFrom=&dateTo=&page=&limit=
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const severity = searchParams.get("severity") ?? "ALL";
  const status = searchParams.get("status") ?? "ALL";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

  try {
    const where: any = {};

    if (severity !== "ALL") where.severity = severity;
    if (status !== "ALL") where.status = status;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59");
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { entityType: { contains: search, mode: "insensitive" } },
        { entityName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rawLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Map to page-expected shape
    const logs = rawLogs.map(l => {
      const details = (l.details as Record<string, any>) ?? {};
      const description = details.description
        ?? details.button ? `CTA click: "${details.button}"${details.courseName ? ` on "${details.courseName}"` : ""}` : null
        ?? details.message
        ?? l.action.replace(/_/g, " ").toLowerCase();

      return {
        id: l.idEntity,
        action: l.action,
        category: l.entityType ?? "SYSTEM",
        severity: l.severity,
        actor: l.userName ?? "system",
        actorRole: details.role ?? "SYSTEM",
        targetEntity: l.entityType,
        targetId: l.entityId,
        description: typeof description === "string" ? description : l.action.replace(/_/g, " "),
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        metadata: details,
        timestamp: l.createdAt.toISOString(),
        status: l.status,
      };
    });

    // Summary counts (unfiltered)
    const [totalAll, criticalCount, warningCount, failedCount] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { severity: { in: ["CRITICAL", "ERROR"] } } }),
      prisma.auditLog.count({ where: { severity: "WARNING" } }),
      prisma.auditLog.count({ where: { status: "FAILED" } }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      summary: { total: totalAll, critical: criticalCount, warnings: warningCount, failed: failedCount },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/audit — write an audit log entry
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, entityType, entityId, entityName, details, severity, status, userName, userId } = body;
    if (!action) return NextResponse.json({ success: false, error: "action is required" }, { status: 400 });

    const cookieStore = await cookies();
    const session = JSON.parse(cookieStore.get("admin_session")?.value ?? "{}");
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;

    const log = await prisma.auditLog.create({
      data: {
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        entityName: entityName ?? null,
        details: details ?? {},
        severity: severity ?? "INFO",
        status: status ?? "SUCCESS",
        userName: userName ?? session.email ?? null,
        userId: userId ?? null,
        ipAddress: ipAddress ?? null,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
