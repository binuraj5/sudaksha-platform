/**
 * Tenants API - List and Create
 * 
 * GET  /api/v1/tenants - List tenants (super admin: all, tenant admin: own)
 * POST /api/v1/tenants - Create new tenant (super admin only)
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
 * GET /api/v1/tenants
 * 
 * List tenants with pagination and filtering
 */
export async function GET(req: NextRequest) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const searchParams = req.nextUrl.searchParams;

    // Parse params
    const { page, pageSize, skip, take } = parsePaginationParams(searchParams);
    const filters = parseFilterParams(searchParams, ['type', 'isActive', 'plan']);

    try {
        const data = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // RLS will automatically filter:
                // - Super admins see all tenants
                // - Tenant admins see only their own tenant
                const [tenants, total] = await Promise.all([
                    prisma.tenant.findMany({
                        where: filters,
                        skip,
                        take,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            settings: true,
                            _count: {
                                select: {
                                    members: true,
                                    activities: true,
                                    orgUnits: true,
                                },
                            },
                        },
                    }),
                    prisma.tenant.count({ where: filters }),
                ]);

                return { tenants, total };
            }
        );

        return sendPaginated(data.tenants, data.total, page, pageSize);
    } catch (error) {
        console.error('Tenants API error:', error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * POST /api/v1/tenants
 * 
 * Create a new tenant (super admin only)
 */
export async function POST(req: NextRequest) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { isSuperAdmin, userId } = getTenantContextFromSession(session);

    // Only super admins can create tenants
    if (!isSuperAdmin) {
        return ErrorResponses.forbidden('Only super admins can create tenants');
    }

    try {
        const body = await req.json();
        const {
            name,
            slug,
            type = 'CORPORATE',
            email,
            phone,
            address,
            logo,
            brandColor,
            plan = 'STARTER',
            maxMembers = 100,
            maxActivities = 5,
            settings,
        } = body;

        // Validate required fields
        if (!name || !slug || !email) {
            return ErrorResponses.badRequest('Missing required fields: name, slug, email');
        }

        // Check if slug already exists
        const existing = await prisma.tenant.findUnique({ where: { slug } });
        if (existing) {
            return ErrorResponses.conflict(`Tenant with slug '${slug}' already exists`);
        }

        // Check if email already exists
        const existingEmail = await prisma.tenant.findUnique({ where: { email } });
        if (existingEmail) {
            return ErrorResponses.conflict(`Tenant with email '${email}' already exists`);
        }

        // Create tenant
        const tenant = await prisma.tenant.create({
            data: {
                name,
                slug,
                type,
                email,
                phone,
                address,
                logo,
                brandColor,
                plan,
                maxMembers,
                maxActivities,
                createdBy: userId,
                ...(settings && {
                    settings: {
                        create: settings,
                    },
                }),
            },
            include: {
                settings: true,
            },
        });

        return sendSuccess(tenant, 201, 'Tenant created successfully');
    } catch (error) {
        console.error('Tenants API error:', error);
        return ErrorResponses.internalError('Failed to create tenant');
    } finally {
        await prisma.$disconnect();
    }
}
