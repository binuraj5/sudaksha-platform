/**
 * Tenant API - Get, Update, Delete by ID
 * 
 * GET    /api/v1/tenants/[id] - Get tenant details
 * PUT    /api/v1/tenants/[id] - Update tenant
 * DELETE /api/v1/tenants/[id] - Delete tenant (soft delete)
 */

import { getApiSession } from "@/lib/get-session";
import { NextRequest } from 'next/server';
import { PrismaClient } from '@sudaksha/db-core';
import {
    sendSuccess,
    ErrorResponses,
} from '@/lib/api-response';
import {
    getTenantContextFromSession,
    withTenantContext,
} from '@/lib/tenant-context';

const prisma = new PrismaClient();

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/v1/tenants/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    try {
        const tenant = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                return await prisma.tenant.findUnique({
                    where: { id },
                    include: {
                        settings: true,
                        _count: {
                            select: {
                                members: true,
                                activities: true,
                                orgUnits: true,
                                roles: true,
                                competencies: true,
                            },
                        },
                    },
                });
            }
        );

        if (!tenant) {
            return ErrorResponses.notFound('Tenant');
        }

        return sendSuccess(tenant);
    } catch (error) {
        console.error(`Tenant GET error:`, error);
        return ErrorResponses.internalError('Failed to fetch tenant');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * PUT /api/v1/tenants/[id]
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    // Only super admins or the tenant's own admin can update
    if (!isSuperAdmin && tenantId !== id) {
        return ErrorResponses.forbidden('You can only update your own tenant');
    }

    try {
        const body = await req.json();
        const {
            name,
            email,
            phone,
            address,
            logo,
            brandColor,
            plan,
            maxMembers,
            maxActivities,
            isActive,
            settings,
        } = body;

        const tenant = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // Check if tenant exists
                const existing = await prisma.tenant.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                // Update tenant
                return await prisma.tenant.update({
                    where: { id },
                    data: {
                        ...(name && { name }),
                        ...(email && { email }),
                        ...(phone !== undefined && { phone }),
                        ...(address !== undefined && { address }),
                        ...(logo !== undefined && { logo }),
                        ...(brandColor !== undefined && { brandColor }),
                        ...(plan && { plan }),
                        ...(maxMembers !== undefined && { maxMembers }),
                        ...(maxActivities !== undefined && { maxActivities }),
                        ...(isActive !== undefined && { isActive }),
                        ...(settings && {
                            settings: {
                                upsert: {
                                    create: settings,
                                    update: settings,
                                },
                            },
                        }),
                    },
                    include: {
                        settings: true,
                    },
                });
            }
        );

        if (!tenant) {
            return ErrorResponses.notFound('Tenant');
        }

        return sendSuccess(tenant, 200, 'Tenant updated successfully');
    } catch (error) {
        console.error(`Tenant PUT error:`, error);
        return ErrorResponses.internalError('Failed to update tenant');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * DELETE /api/v1/tenants/[id]
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    // Only super admins can delete tenants
    if (!isSuperAdmin) {
        return ErrorResponses.forbidden('Only super admins can delete tenants');
    }

    try {
        const tenant = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // Check if tenant exists
                const existing = await prisma.tenant.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                // Soft delete by setting isActive to false
                return await prisma.tenant.update({
                    where: { id },
                    data: { isActive: false },
                });
            }
        );

        if (!tenant) {
            return ErrorResponses.notFound('Tenant');
        }

        return sendSuccess(tenant, 200, 'Tenant deleted successfully');
    } catch (error) {
        console.error(`Tenant DELETE error:`, error);
        return ErrorResponses.internalError('Failed to delete tenant');
    } finally {
        await prisma.$disconnect();
    }
}
