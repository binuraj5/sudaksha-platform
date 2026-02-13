
import { useSession } from "next-auth/react";
import { Permission, hasPermission } from "@/lib/permissions/permissions";
import { useCallback } from "react";

/**
 * usePermissions Hook
 * 
 * Provides permission check functions for components.
 */
export function usePermissions() {
    const { data: session } = useSession();

    const user = session?.user as { role?: string } | undefined;
    const checkPermission = useCallback((permission: Permission) => {
        if (!user?.role) return false;
        return hasPermission(user.role, permission);
    }, [user]);

    return {
        checkPermission,
        role: user?.role,
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
        isTenantAdmin: user?.role === 'TENANT_ADMIN'
    };
}
