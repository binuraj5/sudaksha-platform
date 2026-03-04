/**
 * Admin permission helpers (no "use server" - used by API routes only).
 * Keep canCreate here so admin-auth.ts only exports Server Actions (all async).
 */

export async function canCreate(_role?: string): Promise<boolean> {
  return true;
}
