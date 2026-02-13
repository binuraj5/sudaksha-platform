import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * Typed session for API routes. Uses auth-config to match NextAuth handler. Session augmentation (types/next-auth.d.ts) is applied.
 */
export async function getApiSession(): Promise<Session | null> {
  return getServerSession(authOptions) as Promise<Session | null>;
}
