import { NextRequest, NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/admin-auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

/**
 * POST /api/auth/logout
 * Destroy admin session and clear authentication cookie
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return errorResponse("Not authenticated", 401);
    }

    await destroySession();
    console.log(`[AUTH] Logout for user: ${session.email}`);
    return successResponse({}, "Logout successful", 200);
  } catch (error) {
    console.error("[AUTH] Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * GET /api/auth/logout
 * Support GET for convenience (redirect-friendly)
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return errorResponse("Not authenticated", 401);
    }

    await destroySession();
    console.log(`[AUTH] Logout for user: ${session.email}`);
    return successResponse({}, "Logout successful", 200);
  } catch (error) {
    console.error("[AUTH] Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}
