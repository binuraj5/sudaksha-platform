/**
 * OrganizationUnit API - Get, Update, Delete by ID
 */

import { getApiSession } from "@/lib/get-session";
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
 * GET /api/v1/org-units/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    try {
        const unit = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                return await prisma.organizationUnit.findUnique({
                    where: { id },
                    include: {
                        parent: true,
                        children: true,
                        _count: {
                            select: {
                                children: true,
                            },
                        },
                    },
                });
            }
        );

        if (!unit) {
            return ErrorResponses.notFound('Organization unit');
        }

        return sendSuccess(unit);
    } catch (error) {
        console.error(`OrganizationUnit GET error`, error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * PUT /api/v1/org-units/[id]
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;
    const userRole = (session as any).user?.role;

    if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
        return ErrorResponses.forbidden('Insufficient permissions');
    }

    try {
        const body = await req.json();
        const { name, code, description, parentId, managerId, type } = body;

        const unit = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const existing = await prisma.organizationUnit.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                return await prisma.organizationUnit.update({
                    where: { id },
                    data: {
                        ...(name && { name }),
                        ...(code && { code }),
                        ...(description !== undefined && { description }),
                        ...(parentId !== undefined && { parentId }),
                        ...(managerId !== undefined && { managerId }),
                        ...(type && { type }),
                    },
                    include: {
                        parent: true,
                    },
                });
            }
        );

        if (!unit) {
            return ErrorResponses.notFound('Organization unit');
        }

        return sendSuccess(unit, 200, 'Organization unit updated successfully');
    } catch (error) {
        console.error(`OrganizationUnit PUT error`, error);
        return ErrorResponses.internalError('Failed to update organization unit');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * DELETE /api/v1/org-units/[id]
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;
    const userRole = (session as any).user?.role;

    if (!isSuperAdmin && userRole !== 'TENANT_ADMIN') {
        return ErrorResponses.forbidden('Only tenant admins can delete organization units');
    }

    try {
        const unit = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const existing = await prisma.organizationUnit.findUnique({
                    where: { id },
                    include: { _count: { select: { children: true } } },
                });

                if (!existing) {
                    return null;
                }

                if (existing._count.children > 0) {
                    // Start manually creating the error response since "throw" inside withTenantContext might be caught differently
                    // failed to leverage the throw inside.
                    // Actually withTenantContext just executes the callback. 
                    // So throwing here is fine, but I need to catch it outside properly or handle it.
                    // Let's return a specific symbol or just throw and catch.
                    throw new Error('Cannot delete unit with children');
                }

                return await prisma.organizationUnit.delete({ where: { id } });
            }
        );

        if (!unit) {
            // Need to distinguish between "not found" and "validation error" if using withTenantContext which might return null or confuse.
            // But here if exception was thrown, it goes to catch block.
            return ErrorResponses.notFound('Organization unit');
        }

        return sendSuccess(unit, 200, 'Organization unit deleted successfully');
    } catch (error: any) {
        console.error(`OrganizationUnit DELETE error:`, error);
        if (error.message === 'Cannot delete unit with children') {
            return ErrorResponses.conflict('Cannot delete unit with children');
        }
        return ErrorResponses.internalError('Failed to delete organization unit');
    } finally {
        await prisma.$disconnect();
    }
}
