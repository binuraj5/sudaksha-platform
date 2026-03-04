/**
 * Tenant Context Utilities
 * 
 * Helper functions for managing PostgreSQL Row-Level Security (RLS) session variables.
 * These functions set and clear the tenant context for database queries.
 */

import { PrismaClient } from '@sudaksha/db-core';

/**
 * Set tenant context for RLS policies
 * 
 * This sets the PostgreSQL session variables that RLS policies use to filter data:
 * - app.current_tenant_id: The ID of the current tenant
 * - app.is_super_admin: Whether the user has super admin privileges
 * - app.current_user_id: The ID of the current user (for B2C users)
 * 
 * @param prisma - Prisma client instance
 * @param tenantId - ID of the tenant (null for B2C users)
 * @param isSuperAdmin - Whether the user is a super admin
 * @param userId - ID of the current user
 */
export async function setTenantContext(
    prisma: PrismaClient,
    tenantId: string | null,
    isSuperAdmin: boolean = false,
    userId?: string
): Promise<void> {
    // Set tenant ID (empty string if null, as RLS uses NULLIF)
    await prisma.$executeRawUnsafe(
        `SET app.current_tenant_id = '${tenantId || ''}'`
    );

    // Set super admin flag
    await prisma.$executeRawUnsafe(
        `SET app.is_super_admin = ${isSuperAdmin}`
    );

    // Set user ID if provided (for B2C users)
    if (userId) {
        await prisma.$executeRawUnsafe(
            `SET app.current_user_id = '${userId}'`
        );
    }
}

/**
 * Reset tenant context
 * 
 * Clears all RLS session variables. Should be called after queries are complete
 * or in a finally block to ensure cleanup.
 * 
 * @param prisma - Prisma client instance
 */
export async function resetTenantContext(prisma: PrismaClient): Promise<void> {
    await prisma.$executeRawUnsafe(`RESET app.current_tenant_id`);
    await prisma.$executeRawUnsafe(`RESET app.is_super_admin`);
    await prisma.$executeRawUnsafe(`RESET app.current_user_id`);
}

/**
 * Execute a callback with tenant context
 * 
 * This is a convenience function that sets the tenant context, executes the callback,
 * and ensures the context is reset even if an error occurs.
 * 
 * @param prisma - Prisma client instance
 * @param tenantId - ID of the tenant
 * @param isSuperAdmin - Whether the user is a super admin
 * @param callback - Async function to execute with tenant context
 * @returns The result of the callback
 * 
 * @example
 * ```typescript
 * const members = await withTenantContext(
 *   prisma,
 *   'tenant-123',
 *   false,
 *   async () => {
 *     return await prisma.member.findMany();
 *   }
 * );
 * ```
 */
export async function withTenantContext<T>(
    prisma: PrismaClient,
    tenantId: string | null,
    isSuperAdmin: boolean = false,
    userId: string | undefined,
    callback: () => Promise<T>
): Promise<T> {
    try {
        await setTenantContext(prisma, tenantId, isSuperAdmin, userId);
        return await callback();
    } finally {
        await resetTenantContext(prisma);
    }
}

/**
 * Extract tenant info from authenticated session
 * 
 * Helper to extract tenant context from NextAuth session or other auth providers.
 * 
 * @param session - The authenticated session object
 * @returns Tenant context information
 */
export function getTenantContextFromSession(session: any): {
    tenantId: string | null;
    isSuperAdmin: boolean;
    userId: string;
} {
    if (!session?.user) {
        throw new Error('Unauthenticated');
    }

    const user = session.user;

    return {
        tenantId: user.tenantId || null,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        userId: user.id,
    };
}
