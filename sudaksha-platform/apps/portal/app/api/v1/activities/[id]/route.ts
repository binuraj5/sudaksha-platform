/**
 * Activity API - Get, Update, Delete by ID
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
 * GET /api/v1/activities/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    try {
        const activity = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                return await prisma.activity.findUnique({
                    where: { id },
                    include: {
                        members: {
                            include: {
                                member: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                        orgUnits: {
                            include: {
                                orgUnit: true,
                            },
                        },
                    },
                });
            }
        );

        if (!activity) {
            return ErrorResponses.notFound('Activity');
        }

        return sendSuccess(activity);
    } catch (error) {
        console.error(`Activity GET error:`, error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * PUT /api/v1/activities/[id]
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
        const {
            name,
            slug,
            description,
            status,
            startDate,
            endDate,
            type,
        } = body;

        const activity = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const existing = await prisma.activity.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                return await prisma.activity.update({
                    where: { id },
                    data: {
                        ...(name && { name }),
                        ...(slug && { slug }),
                        ...(description !== undefined && { description }),
                        ...(status && { status }),
                        ...(startDate && { startDate: new Date(startDate) }),
                        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                        ...(type && { type }),
                    },
                });
            }
        );

        if (!activity) {
            return ErrorResponses.notFound('Activity');
        }

        return sendSuccess(activity, 200, 'Activity updated successfully');
    } catch (error) {
        console.error(`Activity PUT error:`, error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * DELETE /api/v1/activities/[id]
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
        return ErrorResponses.forbidden('Only tenant admins can delete activities');
    }

    try {
        const activity = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const existing = await prisma.activity.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                // Archive instead of delete
                return await prisma.activity.update({
                    where: { id },
                    data: { status: 'ARCHIVED' },
                });
            }
        );

        if (!activity) {
            return ErrorResponses.notFound('Activity');
        }

        return sendSuccess(activity, 200, 'Activity archived successfully');
    } catch (error) {
        console.error(`Activity DELETE error:`, error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}
