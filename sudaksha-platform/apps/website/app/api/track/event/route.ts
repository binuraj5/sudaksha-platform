/**
 * POST /api/track/event
 * Public endpoint — no admin auth required.
 * Writes visitor interaction events (CTA clicks, page views, etc.) to AuditLog.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Basic rate-limit: reject payloads that are obviously too large
const MAX_BODY_BYTES = 4096;

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json({ success: false }, { status: 413 });
    }

    const body = await req.json();
    const { action, entityType, entityId, entityName, details, severity, userName } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json({ success: false, error: "action is required" }, { status: 400 });
    }

    const ipAddress = (
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      null
    );
    const userAgent = req.headers.get("user-agent") ?? null;

    await prisma.auditLog.create({
      data: {
        action: String(action).slice(0, 100),
        entityType: entityType ? String(entityType).slice(0, 50) : null,
        entityId: entityId ? String(entityId).slice(0, 100) : null,
        entityName: entityName ? String(entityName).slice(0, 200) : null,
        details: typeof details === "object" && details !== null ? details : {},
        severity: ["INFO", "WARNING", "ERROR", "CRITICAL"].includes(severity) ? severity : "INFO",
        status: "SUCCESS",
        userName: userName ? String(userName).slice(0, 100) : "visitor",
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    // Silently swallow — tracking must never break the user experience
    return NextResponse.json({ success: true });
  }
}
