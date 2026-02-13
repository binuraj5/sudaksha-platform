/**
 * OrganizationUnits API - List and Create
 * 
 * GET  /api/v1/org-units - List organization units (hierarchical)
 * POST /api/v1/org-units - Create new organization unit
 */

import { NextRequest } from 'next/server';
import { getApiSession } from "@/lib/get-session";
import { PrismaClient } from '@prisma/client';
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
 * GET /api/v1/org-units
 */
export async function GET(req: NextRequest) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const searchParams = req.nextUrl.searchParams;

    const { page, pageSize, skip, take } = parsePaginationParams(searchParams);
    const filters = parseFilterParams(searchParams, ['type', 'parentId', 'managerId']);

    try {
        const data = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const [units, total] = await Promise.all([
                    prisma.organizationUnit.findMany({
                        where: filters,
                        skip,
                        take,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            parent: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true,
                                },
                            },
                            _count: {
                                select: {
                                    children: true,
                                },
                            },
                        },
                    }),
                    prisma.organizationUnit.count({ where: filters }),
                ]);

                return { units, total };
            }
        );

        return sendPaginated(data.units, data.total, page, pageSize);
    } catch (error) {
        console.error('OrganizationUnits API error:', error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * POST /api/v1/org-units
 */
export async function POST(req: NextRequest) {
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const userRole = (session as any).user?.role;

    if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
        return ErrorResponses.forbidden('Insufficient permissions to create organization units');
    }

    try {
        const body = await req.json();
        const {
            type = 'DEPARTMENT',
            name,
            code,
            description,
            parentId,
            managerId,
        } = body;

        if (!name || !code) {
            return ErrorResponses.badRequest('Missing required fields: name, code');
        }

        if (!tenantId && !isSuperAdmin) {
            return ErrorResponses.badRequest('Tenant ID is required');
        }

        const unit = await prisma.organizationUnit.create({
            data: {
                tenantId: tenantId!,
                type,
                name,
                code,
                description,
                parentId,
                managerId,
            },
            include: {
                parent: true,
            },
        });

        return sendSuccess(unit, 201, 'Organization unit created successfully');
    } catch (error) {
        console.error('OrganizationUnits API error:', error);
        return ErrorResponses.internalError('Failed to create organization unit');
    } finally {
        await prisma.$disconnect();
    }
}
