import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { errorResponse, successResponse } from "@/lib/api-utils";

const DEFAULT_EMAIL = "superadmin@sudaksha.com";
const DEFAULT_PASSWORD = "Admin@123";
const DEFAULT_NAME = "Super Admin";

/**
 * POST /api/auth/init-super-admin
 * Ensures AdminUser table exists and creates/updates the Super Admin in the
 * same database the app uses. Call once to fix login when script wrote to a different DB.
 *
 * Query: ?secret=YOUR_INIT_SECRET (optional; set INIT_SUPER_ADMIN_SECRET in .env to require it)
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.INIT_SUPER_ADMIN_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return errorResponse("Unauthorized", 401);
    }

    // Ensure AdminUser table exists (same DDL as scripts/fix-db-schema.ts)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdminUser" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "twoFactorSecret" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const email = process.env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD || DEFAULT_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || DEFAULT_NAME;
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.adminUser.upsert({
      where: { email },
      update: { name, passwordHash, isActive: true },
      create: { email, name, passwordHash, isActive: true },
    });

    return successResponse(
      { email, message: `Super Admin ready. Use password: ${password}` },
      "Super Admin created/updated. You can now log in.",
      200
    );
  } catch (e) {
    console.error("[INIT_SUPER_ADMIN]", e);
    return errorResponse(
      e instanceof Error ? e.message : "Failed to init Super Admin",
      500
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
