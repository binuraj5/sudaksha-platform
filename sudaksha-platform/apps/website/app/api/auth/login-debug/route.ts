import { NextRequest, NextResponse } from "next/server";

// In-memory store for last login debug payload (dev/debug only)
declare global {
  // eslint-disable-next-line no-var
  var __loginDebug: Record<string, unknown> | null;
}
if (typeof globalThis.__loginDebug === "undefined") {
  globalThis.__loginDebug = null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") ?? "";
    const hasNextAuth = cookieHeader.includes("next-auth.session-token");
    const payload = {
      ...body,
      _receivedAt: new Date().toISOString(),
      _serverReceived: {
        cookieHeader: cookieHeader ? "present" : "missing",
        cookieHeaderLength: cookieHeader.length,
        nextAuthSessionCookie: hasNextAuth ? "present" : "missing",
      },
    };
    globalThis.__loginDebug = payload;
    return NextResponse.json({
      ok: true,
      redirectUrl: "/assessments/login-debug-view",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 400 }
    );
  }
}

export async function GET() {
  const payload = globalThis.__loginDebug;
  return NextResponse.json(payload ?? { message: "No debug data yet. Submit login first." });
}
