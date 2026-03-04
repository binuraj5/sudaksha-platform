
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, ApprovalType, ProficiencyLevel, CompetencyCategory } from "@prisma/client";
import { withTenantContext } from "./tenant-context";

/**
 * Fetch roles visible to the current tenant
 * Includes global roles (tenantId: null) and tenant-specific roles
 */
export async function getRoles(tenantId: string | null, isSuperAdmin: boolean = false) {
    const whereClause: any = {
        OR: [
            { tenantId: null, status: 'APPROVED' }, // Global approved roles
        ]
    };

    if (tenantId) {
        whereClause.OR.push({ tenantId }); // All tenant roles (regardless of status)
    }

    if (isSuperAdmin) {
        delete whereClause.OR; // Super admin sees everything
    }

    return await prisma.role.findMany({
        where: whereClause,
        include: {
            competencies: {
                include: {
                    competency: true
                }
            }
        },
        orderBy: { name: 'asc' }
    });
}

/**
 * Create a new Role (defaults to DRAFT if created by tenant)
 */
export async function createRole(data: any, tenantId: string | null) {
    return await prisma.role.create({
        data: {
            ...data,
            tenantId,
            status: tenantId ? 'DRAFT' : 'APPROVED' // System created are auto-approved
        }
    });
}

/**
 * Submit a Role for approval
 */
export async function submitRoleForApproval(roleId: string, tenantId: string) {
    return await prisma.$transaction(async (tx) => {
        // Update role status
        await tx.role.update({
            where: { id: roleId, tenantId },
            data: { status: 'PENDING' }
        });

        // Create approval request
        return await tx.approvalRequest.create({
            data: {
                tenantId,
                type: 'ROLE',
                entityId: roleId,
                status: 'PENDING'
            }
        });
    });
}

/**
 * Fetch competencies visible to the current tenant
 */
export async function getCompetencies(tenantId: string | null, isSuperAdmin: boolean = false) {
    const whereClause: any = {
        OR: [
            { tenantId: null, status: 'APPROVED' },
        ]
    };

    if (tenantId) {
        whereClause.OR.push({ tenantId });
    }

    if (isSuperAdmin) {
        delete whereClause.OR;
    }

    return await prisma.competency.findMany({
        where: whereClause,
        include: {
            indicators: true
        },
        orderBy: { name: 'asc' }
    });
}

/**
 * Create a new Competency with Indicators
 */
export async function createCompetency(data: any, indicators: any[], tenantId: string | null) {
    return await prisma.competency.create({
        data: {
            ...data,
            tenantId,
            status: tenantId ? 'DRAFT' : 'APPROVED',
            indicators: {
                create: indicators
            }
        },
    });
}

/**
 * Admin: Approve an Approval Request
 */
export async function approveApprovalRequest(requestId: string, adminId: string, comments?: string) {
    return await prisma.$transaction(async (tx) => {
        const request = await tx.approvalRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                reviewerId: adminId,
                reviewedAt: new Date(),
                comments
            }
        });

        // Update the actual entity status
        if (request.type === 'ROLE') {
            await tx.role.update({
                where: { id: request.entityId },
                data: { status: 'APPROVED' }
            });
        } else {
            await tx.competency.update({
                where: { id: request.entityId },
                data: { status: 'APPROVED' }
            });
        }

        return request;
    });
}

/**
 * Admin: Reject an Approval Request
 */
export async function rejectApprovalRequest(requestId: string, adminId: string, comments: string) {
    return await prisma.$transaction(async (tx) => {
        const request = await tx.approvalRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                reviewerId: adminId,
                reviewedAt: new Date(),
                comments
            }
        });

        // Set entity back to DRAFT or REJECTED state
        if (request.type === 'ROLE') {
            await tx.role.update({
                where: { id: request.entityId },
                data: { status: 'REJECTED' }
            });
        } else {
            await tx.competency.update({
                where: { id: request.entityId },
                data: { status: 'REJECTED' }
            });
        }

        return request;
    });
}

/**
 * Admin: Get all pending approval requests
 */
export async function getPendingApprovals() {
    return await prisma.approvalRequest.findMany({
        where: { status: 'PENDING' },
        include: {
            tenant: true
        },
        orderBy: { createdAt: 'desc' }
    });
}
