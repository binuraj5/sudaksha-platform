
"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { Permission, hasPermission } from '@/lib/permissions/permissions';

interface PermissionGateProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    children,
    fallback = null
}) => {
    const { data: session } = useSession();

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!userRole) return <>{fallback}</>;

    const isAllowed = hasPermission(userRole, permission);

    if (!isAllowed) return <>{fallback}</>;

    return <>{children}</>;
};
