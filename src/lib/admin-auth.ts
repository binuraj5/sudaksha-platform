/**
 * Admin session helpers. Used by API routes and middleware.
 * IMPORTANT: Do NOT add "use server" to this file. Next.js would treat every
 * export as a Server Action (which must be async). Do NOT add sync exports
 * like canCreate — use @/lib/admin-permissions for canCreate.
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AdminSession {
  email: string;
  name?: string;
}

/**
 * Authenticate admin user with email and password (AdminUser table)
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!admin) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!admin.isActive) {
      return { success: false, error: "Account is inactive" };
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const session: AdminSession = { email: admin.email, name: admin.name };
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return { success: true };
  } catch (e) {
    console.error("[ADMIN_AUTH] loginUser error:", e);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Get current admin session from cookie
 */
export async function getSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!raw) return null;

    const session = JSON.parse(raw) as AdminSession;
    if (!session?.email) return null;

    const admin = await prisma.adminUser.findUnique({
      where: { email: session.email },
    });
    if (!admin || !admin.isActive) return null;

    return { email: admin.email, name: admin.name };
  } catch {
    return null;
  }
}

/**
 * Destroy admin session (clear cookie)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
