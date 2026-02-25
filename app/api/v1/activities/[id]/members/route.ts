/**
 * Activity Members API
 * 
 * GET    /api/v1/activities/[id]/members - List activity members
 * POST   /api/v1/activities/[id]/members - Add member to activity
 * DELETE /api/v1/activities/[id]/members - Remove member from activity (via query param)
 */

import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
    getTenantContextFromSession,
    withTenantContext,
} from '@/lib/tenant-context';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getApiSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);

        const members = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                const activity = await prisma.activity.findUnique({
                    where: { id },
                });

                if (!activity) {
                    return null;
                }

                return await prisma.activityMember.findMany({
                    where: { activityId: id },
                    include: {
                        member: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                role: true,
                            },
                        },
                    },
                });
            }
        );

        if (members === null) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: members });
    } catch (error) {
        console.error('GET /api/v1/activities/[id]/members error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getApiSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
        const userRole = (session.user as any)?.role;

        if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { memberId, role = 'PARTICIPANT' } = body;

        if (!memberId) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Member ID is required' } },
                { status: 400 }
            );
        }

        const result = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // Verify activity exists and belongs to tenant
                const activity = await prisma.activity.findUnique({ where: { id } });
                if (!activity) return 'ACTIVITY_NOT_FOUND';

                // Verify member exists and belongs to tenant
                const member = await prisma.member.findUnique({ where: { id: memberId } });
                if (!member) return 'MEMBER_NOT_FOUND';

                // Check if already a member
                const existing = await prisma.activityMember.findUnique({
                    where: {
                        activityId_memberId: {
                            activityId: id,
                            memberId,
                        },
                    },
                });

                if (existing) return 'ALREADY_EXISTS';

                // Add member
                const newMember = await prisma.activityMember.create({
                    data: {
                        activityId: id,
                        memberId,
                        role,
                    },
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
                });

                // --- Automatic Assessment Assignment Trigger ---
                // If there are any ProjectAssessmentModel entries for this project, attach them to the new member.
                const user = await prisma.user.findUnique({ where: { email: member.email } });
                if (user) {
                    const projectAssessments = await prisma.projectAssessmentModel.findMany({
                        where: { projectId: id }
                    });

                    if (projectAssessments.length > 0) {
                        const newAssignments = projectAssessments.map(pa => ({
                            userId: user.id,
                            projectAssignmentId: pa.id,
                            status: 'DRAFT' as any
                        }));

                        await prisma.projectUserAssessment.createMany({
                            data: newAssignments,
                            skipDuplicates: true
                        });
                    }
                }

                return newMember;
            }
        );

        if (result === 'ACTIVITY_NOT_FOUND') {
            return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } }, { status: 404 });
        }
        if (result === 'MEMBER_NOT_FOUND') {
            return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Member not found' } }, { status: 404 });
        }
        if (result === 'ALREADY_EXISTS') {
            return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'Member already in activity' } }, { status: 409 });
        }

        return NextResponse.json({ success: true, data: result, message: 'Member added to activity' }, { status: 201 });
    } catch (error) {
        console.error('POST /api/v1/activities/[id]/members error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getApiSession();

        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        const { tenantId, isSuperAdmin, userId } = getTenantContextFromSession(session);
        const userRole = (session.user as any)?.role;

        if (!isSuperAdmin && userRole !== 'TENANT_ADMIN' && userRole !== 'MANAGER') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('memberId');

        if (!memberId) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Member ID is required query param' } },
                { status: 400 }
            );
        }

        const result = await withTenantContext(
            prisma,
            tenantId,
            isSuperAdmin,
            userId,
            async () => {
                // Verify activity exists
                const activity = await prisma.activity.findUnique({ where: { id } });
                if (!activity) return 'ACTIVITY_NOT_FOUND';

                // Check if membership exists
                const membership = await prisma.activityMember.findUnique({
                    where: {
                        activityId_memberId: {
                            activityId: id,
                            memberId,
                        },
                    },
                });

                if (!membership) return 'MEMBERSHIP_NOT_FOUND';

                // Remove member
                return await prisma.activityMember.delete({
                    where: {
                        activityId_memberId: {
                            activityId: id,
                            memberId,
                        },
                    },
                });
            }
        );

        if (result === 'ACTIVITY_NOT_FOUND') {
            return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } }, { status: 404 });
        }
        if (result === 'MEMBERSHIP_NOT_FOUND') {
            return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Member is not in this activity' } }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Member removed from activity' });
    } catch (error) {
        console.error('DELETE /api/v1/activities/[id]/members error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
