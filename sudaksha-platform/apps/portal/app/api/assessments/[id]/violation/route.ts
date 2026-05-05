/**
 * Browser Lockdown Violation Logger
 * SEPL/INT/2026/IMPL-GAPS-01 Step G15
 * Patent claim C-09 — proctored-mode integrity logging
 *
 * POST /api/assessments/[id]/violation
 * Body: { type: "TAB_SWITCH" | "COPY" | "PASTE" | "CUT", count?: number }
 *
 * Persists a BiasFlag with the violation type. Only B2C MemberAssessment
 * sessions are logged because BiasFlag.memberAssessmentId requires a
 * MemberAssessment FK — org/Project sessions are dropped silently.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["TAB_SWITCH", "COPY", "PASTE", "CUT"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getApiSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assessmentId } = await params;
    const body = await req.json().catch(() => ({}));
    const rawType = String(body?.type ?? "").toUpperCase();
    const count = typeof body?.count === "number" && body.count > 0 ? Math.floor(body.count) : 1;

    if (!ALLOWED_TYPES.has(rawType)) {
      return NextResponse.json({ error: "Invalid violation type" }, { status: 400 });
    }

    // Resolve to a MemberAssessment owned by this user
    const member = await prisma.member.findFirst({
      where: { email: (session.user as { email?: string }).email ?? "" },
      select: { id: true },
    });
    if (!member) {
      // Org / Project session — no MemberAssessment to attach to. Accept silently.
      return NextResponse.json({ ok: true, logged: false, reason: "no_member_context" });
    }

    const memberAssessment = await prisma.memberAssessment.findFirst({
      where: { id: assessmentId, memberId: member.id },
      select: { id: true },
    });
    if (!memberAssessment) {
      return NextResponse.json({ ok: true, logged: false, reason: "not_member_assessment" });
    }

    const severity = count >= 3 ? "HIGH" : count >= 2 ? "MEDIUM" : "LOW";

    await prisma.biasFlag.create({
      data: {
        memberAssessmentId: memberAssessment.id,
        flagType: rawType, // TAB_SWITCH | COPY | PASTE | CUT
        severity,
        affectedLayer: "ALL",
        correctionApplied: false,
        details: { count, recordedAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({ ok: true, logged: true });
  } catch (error) {
    console.error("[Violation] Failed to log:", error);
    // Never break the user flow — return 200 so the client doesn't retry-storm.
    return NextResponse.json({ ok: false, error: "internal" }, { status: 200 });
  }
}
