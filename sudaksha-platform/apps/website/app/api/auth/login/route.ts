import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/lib/admin-auth";
import { errorResponse, successResponse } from "@/lib/api-utils";

/**
 * POST /api/auth/login
 * Authenticate admin user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Invalid email or password format", 400);
    }

    const { email, password } = validation.data;
    const result = await loginUser(email, password);

    if (!result.success) {
      console.warn(`[AUTH] Failed login attempt for email: ${email}`);
      return errorResponse(result.error || "Authentication failed", 401);
    }

    console.log(`[AUTH] Successful login for: ${email}`);
    return successResponse({ email }, "Login successful", 200);
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * GET /api/auth/login - Not supported
 */
export async function GET() {
  return errorResponse("Method not allowed", 405);
}
