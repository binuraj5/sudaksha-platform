import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { computeWRI } from "@/lib/analytics/computeWorkforceReadinessIndex";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const userRole = (session.user as any).role;
  const userClientId = (session.user as any).clientId || (session.user as any).tenantId;

  if (userRole !== "SUPER_ADMIN" && userClientId !== clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: clientId },
      select: { type: true },
    });
    const sector = String(tenant?.type ?? "DEFAULT").toUpperCase();
    const result = await computeWRI(clientId, sector);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[WORKFORCE_READINESS_API]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
