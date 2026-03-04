/**
 * Activities API - List and Create
 */

import { NextRequest } from 'next/server';
import { getApiSession } from "@/lib/get-session";
import { PrismaClient } from '@sudaksha/db-core';
import {
    sendSuccess,
    sendPaginated,
    ErrorResponses,
    parsePaginationParams,
    parseFilterParams,
} from '@/lib/api-response';
import {
    getTenantContextFromSession,
    withTenantContext,
} from '@/lib/tenant-context';

const prisma = new PrismaClient();

/**
 * GET /api/v1/activities
 */
export async function GET(req: NextRequest) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const searchParams = req.nextUrl.searchParams;

    const { page, pageSize, skip, take } = parsePaginationParams(searchParams);
    const filters = parseFilterParams(searchParams, ['type', 'status']);

    try {
        const data = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const [activities, total] = await Promise.all([
                    prisma.activity.findMany({
                        where: filters,
                        skip,
                        take,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            _count: {
                                select: {
                                    members: true,
                                    orgUnits: true,
                                },
                            },
                        },
                    }),
                    prisma.activity.count({ where: filters }),
                ]);

                return { activities, total };
            }
        );

        return sendPaginated(data.activities, data.total, page, pageSize);
    } catch (error) {
        console.error('Activities API error:', error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * POST /api/v1/activities
 */
export async function POST(req: NextRequest) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const userRole = (session as any).user?.role;

    if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
        return ErrorResponses.forbidden('Insufficient permissions to create activities');
    }

    try {
        const body = await req.json();
        const {
            type = 'PROJECT',
            name,
            slug,
            description,
            status = 'DRAFT',
            startDate,
            endDate,
        } = body;

        if (!name || !slug || !startDate) {
            return ErrorResponses.badRequest('Missing required fields: name, slug, startDate');
        }

        if (!tenantId && !isSuperAdmin) {
            return ErrorResponses.badRequest('Tenant ID is required');
        }

        const activity = await prisma.activity.create({
            data: {
                tenantId: tenantId!,
                type,
                name,
                slug,
                description,
                status,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                createdBy: userId,
            },
        });

        return sendSuccess(activity, 201, 'Activity created successfully');
    } catch (error) {
        console.error('Activities API error:', error);
        return ErrorResponses.internalError('Failed to create activity');
    } finally {
        await prisma.$disconnect();
    }
}
