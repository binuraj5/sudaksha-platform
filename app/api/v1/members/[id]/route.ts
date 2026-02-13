/**
 * Member API - Get, Update, Delete by ID
 * 
 * GET    /api/v1/members/[id] - Get member details
 * PUT    /api/v1/members/[id] - Update member
 * DELETE /api/v1/members/[id] - Deactivate member
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
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/v1/members/[id]
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
        const member = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                return await prisma.member.findUnique({
                    where: { id },
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
                        bio: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
            }
        );

        if (!member) {
            return ErrorResponses.notFound('Member');
        }

        return sendSuccess(member);
    } catch (error) {
        console.error(`Member GET error:`, error);
        return ErrorResponses.internalError('Failed to fetch member');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * PUT /api/v1/members/[id]
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    try {
        const body = await req.json();
        const {
            name,
            email,
            phone,
            avatar,
            bio,
            role,
            type,
            orgUnitId,
            isActive,
            enrollmentNumber,
            employeeId,
            hasGraduated,
            graduationDate,
            password, // Optional password update
        } = body;

        // Users can update their own profile, or admins can update anyone in their tenant
        const isOwnProfile = userId === id;
        const userRole = (session as any).user?.role;
        const canUpdateOthers = isSuperAdmin || userRole === 'TENANT_ADMIN' || userRole === 'MANAGER';

        if (!isOwnProfile && !canUpdateOthers) {
            return ErrorResponses.forbidden('You can only update your own profile');
        }

        // Only admins can update role, type, and isActive
        if (!canUpdateOthers && (role || type || isActive !== undefined)) {
            return ErrorResponses.forbidden('Only admins can update role, type, or active status');
        }

        const member = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // Check if member exists
                const existing = await prisma.member.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                // Hash password if provided
                const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

                // Update member
                return await prisma.member.update({
                    where: { id },
                    data: {
                        ...(name && { name }),
                        ...(email && { email }),
                        ...(phone !== undefined && { phone }),
                        ...(avatar !== undefined && { avatar }),
                        ...(bio !== undefined && { bio }),
                        ...(role && canUpdateOthers && { role }),
                        ...(type && canUpdateOthers && { type }),
                        ...(orgUnitId !== undefined && { orgUnitId }),
                        ...(isActive !== undefined && canUpdateOthers && { isActive }),
                        ...(enrollmentNumber !== undefined && { enrollmentNumber: enrollmentNumber || null }),
                        ...(employeeId !== undefined && { employeeId: employeeId || null }),
                        ...(hasGraduated !== undefined && { hasGraduated: !!hasGraduated }),
                        ...(graduationDate !== undefined && { graduationDate: graduationDate ? new Date(graduationDate) : null }),
                        ...(hashedPassword && { password: hashedPassword }),
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
                        bio: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
            }
        );

        if (!member) {
            return ErrorResponses.notFound('Member');
        }

        return sendSuccess(member, 200, 'Member updated successfully');
    } catch (error) {
        console.error(`Member PUT error:`, error);
        return ErrorResponses.internalError('Failed to update member');
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * DELETE /api/v1/members/[id]
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    // Authenticate
    const session = await getApiSession();

    if (!session) {
        return ErrorResponses.unauthorized();
    }

    const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
    const { id } = await params;

    // Only admins can delete members
    const userRole = (session as any).user?.role;
    if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
        return ErrorResponses.forbidden('Insufficient permissions to delete members');
    }

    try {
        const member = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // Check if member exists
                const existing = await prisma.member.findUnique({ where: { id } });
                if (!existing) {
                    return null;
                }

                // Soft delete
                return await prisma.member.update({
                    where: { id },
                    data: { isActive: false },
                    select: {
                        id: true,
                        tenantId: true,
                        name: true,
                        email: true,
                        isActive: true,
                    },
                });
            }
        );

        if (!member) {
            return ErrorResponses.notFound('Member');
        }

        return sendSuccess(member, 200, 'Member deactivated successfully');
    } catch (error) {
        console.error(`Member DELETE error:`, error);
        return ErrorResponses.internalError('Failed to deactivate member');
    } finally {
        await prisma.$disconnect();
    }
}
