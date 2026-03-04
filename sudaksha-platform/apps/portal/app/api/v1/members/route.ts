/**
 * Members API - List and Create
 * 
 * GET  /api/v1/members - List members (filtered by tenant via RLS)
 * POST /api/v1/members - Create new member
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
import { validateStudentOrgUnit } from '@/lib/services/class-service';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * GET /api/v1/members
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
    const filters = parseFilterParams(searchParams, ['type', 'role', 'isActive', 'orgUnitId']);

    // Search by name, email, enrollment number, or employee ID
    const search = searchParams.get('search');
    if (search) {
        (filters as any).OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { enrollmentNumber: { contains: search, mode: 'insensitive' } },
            { employeeId: { contains: search, mode: 'insensitive' } },
        ];
    }

    try {
        const data = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const [members, total] = await Promise.all([
                    prisma.member.findMany({
                        where: filters,
                        skip,
                        take,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            tenantId: true,
                            type: true,
                            role: true,
                            email: true,
                            name: true,
                            externalId: true,
                            enrollmentNumber: true,
                            employeeId: true,
                            hasGraduated: true,
                            graduationDate: true,
                            orgUnitId: true,
                            isActive: true,
                            emailVerified: true,
                            phone: true,
                            avatar: true,
                            createdAt: true,
                            updatedAt: true,
                            // Exclude password from response
                        },
                    }),
                    prisma.member.count({ where: filters }),
                ]);

                return { members, total };
            }
        );

        return sendPaginated(data.members, data.total, page, pageSize);
    } catch (error) {
        console.error('Members API error:', error);
        return ErrorResponses.internalError('Failed to process request');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * POST /api/v1/members
 */
export async function POST(req: NextRequest) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);

    // Only tenant admins or super admins can create members
    const userRole = (session as any).user?.role;
    if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
        return ErrorResponses.forbidden('Insufficient permissions to create members');
    }

    try {
        const body = await req.json();
        const {
            type = 'EMPLOYEE',
            role = 'ASSESSOR',
            email,
            password,
            name,
            externalId,
            enrollmentNumber,
            employeeId,
            hasGraduated,
            graduationDate,
            orgUnitId,
            phone,
            avatar,
            bio,
            targetTenantId, // For super admins creating members for other tenants
        } = body;

        // Validate required fields
        if (!email || !password || !name) {
            return ErrorResponses.badRequest('Missing required fields: email, password, name');
        }

        // Determine which tenant this member belongs to
        const memberTenantId = isSuperAdmin && targetTenantId ? targetTenantId : tenantId;

        // Institution students: orgUnitId must be a CLASS (FSD validation)
        if (type === 'STUDENT') {
            const validation = await validateStudentOrgUnit(memberTenantId, orgUnitId ?? null);
            if (!validation.ok) {
                return ErrorResponses.badRequest(validation.error ?? 'Invalid org unit for student');
            }
        }

        // Check if email already exists
        const existing = await prisma.member.findFirst({ where: { email } });
        if (existing) {
            return ErrorResponses.conflict(`Member with email '${email}' already exists`);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create member
        const member = await prisma.member.create({
            data: {
                tenantId: memberTenantId,
                type,
                role,
                email,
                password: hashedPassword,
                name,
                externalId,
                enrollmentNumber: enrollmentNumber ?? undefined,
                employeeId: employeeId ?? undefined,
                hasGraduated: hasGraduated ?? undefined,
                graduationDate: graduationDate ? new Date(graduationDate) : undefined,
                orgUnitId,
                phone,
                avatar,
                bio,
            },
            select: {
                id: true,
                tenantId: true,
                type: true,
                role: true,
                email: true,
                name: true,
                externalId: true,
                enrollmentNumber: true,
                employeeId: true,
                hasGraduated: true,
                graduationDate: true,
                orgUnitId: true,
                isActive: true,
                emailVerified: true,
                phone: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return sendSuccess(member, 201, 'Member created successfully');
    } catch (error) {
        console.error('Members API error:', error);
        return ErrorResponses.internalError('Failed to create member');
    } finally {
        await prisma.$disconnect();
    }
}
