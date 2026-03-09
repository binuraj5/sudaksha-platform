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

// POST /api/admin/conflicts/action — persist conflict resolution in AuditLog
// Body: { conflictId, action: 'RESOLVED' | 'DISMISSED' | 'ESCALATED', title }
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { conflictId, action, title } = await req.json();
    if (!conflictId || !action) return NextResponse.json({ success: false, error: "conflictId and action required" }, { status: 400 });

    const cookieStore = await cookies();
    const session = JSON.parse(cookieStore.get("admin_session")?.value ?? "{}");
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;

    await prisma.auditLog.create({
      data: {
        action: `CONFLICT_${action}`,
        entityType: "CONFLICT",
        entityId: conflictId,
        entityName: title ?? conflictId,
        details: { conflictId, resolution: action },
        severity: "INFO",
        status: "SUCCESS",
        userName: session.email ?? "admin",
        ipAddress: ipAddress ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/admin/conflicts/action — return IDs that have been resolved/dismissed
export async function GET(_req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const logs = await prisma.auditLog.findMany({
      where: { entityType: "CONFLICT", action: { in: ["CONFLICT_RESOLVED", "CONFLICT_DISMISSED", "CONFLICT_ESCALATED"] } },
      select: { entityId: true, action: true },
      orderBy: { createdAt: "desc" },
    });

    // Latest action per conflict ID wins
    const statusMap: Record<string, string> = {};
    for (const l of [...logs].reverse()) {
      if (l.entityId) statusMap[l.entityId] = l.action.replace("CONFLICT_", "");
    }

    return NextResponse.json({ success: true, statusMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
