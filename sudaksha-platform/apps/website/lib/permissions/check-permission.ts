import { getApiSession } from "@/lib/get-session";
import { Permission, hasPermission as checkRoleHasPermission } from "./permissions";

/**
 * Validates if the current session has a specific permission.
 * 
 * @param permission - The permission to check
 * @returns boolean indicating if allowed
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
    const session = await getApiSession();
    if (!session?.user?.role) return false;

    return checkRoleHasPermission(session.user.role, permission);
}

/**
 * Middleware-style permission check for API routes.
 * Throws an error if not authorized.
 */
export async function authorize(permission: Permission): Promise<void> {
    const isAllowed = await hasPermission(permission);
    if (!isAllowed) {
        throw new Error("Forbidden: Insufficient permissions");
    }
}
