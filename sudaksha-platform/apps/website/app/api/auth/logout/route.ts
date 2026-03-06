import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/admin-auth";

/**
 * POST /api/auth/logout — destroys admin session cookie and redirects to login
 */
export async function POST(_request: NextRequest) {
  try {
    await destroySession();
  } catch {
    // ignore
  }
  return NextResponse.redirect(new URL('/admin/login', _request.url));
}

/**
 * GET /api/auth/logout — same as POST, for convenience
 */
export async function GET(_request: NextRequest) {
  try {
    await destroySession();
  } catch {
    // ignore
  }
  return NextResponse.redirect(new URL('/admin/login', _request.url));
}
