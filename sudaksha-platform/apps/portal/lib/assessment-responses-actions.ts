"use server";

import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD"];

export async function getAdminAssessmentResponses(tenantSlug: string, assessmentModelId?: string) {
    const session = await getApiSession();
    
    if (!session) {
        throw new Error("Unauthorized");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
        throw new Error("Tenant not found");
    }

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const isTenantAdmin = u.role === "TENANT_ADMIN" || u.role === "DEPARTMENT_HEAD";
    const isAdmin = isSuperAdmin || isTenantAdmin;
    const hasAccess = isSuperAdmin || u.tenantSlug === tenantSlug;

    if (!isAdmin || !hasAccess) {
        throw new Error("Access denied");
    }

    // Fetch all member assessments (completed)
    const memberAssessments = await (prisma as any).memberAssessment.findMany({
        where: {
            status: "COMPLETED",
            member: { tenantId: tenant.id },
            ...(assessmentModelId ? { assessmentModelId } : {}),
        },
        include: {
            assessmentModel: {
                select: {
                    id: true,
                    name: true,
                },
            },
            member: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    currentRole: { select: { id: true, name: true } },
                    orgUnit: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { completedAt: "desc" },
    });

    return memberAssessments;
}

export async function getDetailedResponse(tenantSlug: string, memberAssessmentId: string) {
    const session = await getApiSession();
    
    if (!session) {
        throw new Error("Unauthorized");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
        throw new Error("Tenant not found");
    }

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const isTenantAdmin = u.role === "TENANT_ADMIN" || u.role === "DEPARTMENT_HEAD";
    const isAdmin = isSuperAdmin || isTenantAdmin;
    const hasAccess = isSuperAdmin || u.tenantSlug === tenantSlug;

    if (!isAdmin || !hasAccess) {
        throw new Error("Access denied");
    }

    // Fetch member assessment with related data
    const memberAssessment = await (prisma as any).memberAssessment.findFirst({
        where: {
            id: memberAssessmentId,
            member: { tenantId: tenant.id },
        },
        include: {
            assessmentModel: {
                include: {
                    components: {
                        include: {
                            component: {
                                include: {
                                    questions: true,
                                },
                            },
                        },
                    },
                },
            },
            member: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    currentRole: { select: { id: true, name: true } },
                    orgUnit: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!memberAssessment) {
        throw new Error("Assessment not found");
    }

    // Now fetch the corresponding UserAssessmentModel to get the actual responses
    // Get the User associated with this memberAssessment by email lookup
    const user = await (prisma as any).user.findFirst({
        where: { email: memberAssessment.member.email },
        select: { id: true },
    });

    if (!user) {
        throw new Error("User not found for this assessment");
    }

    // Fetch the UserAssessmentModel (which contains actual responses)
    const userAssessmentModel = await (prisma as any).userAssessmentModel.findFirst({
        where: {
            userId: user.id,
            modelId: memberAssessment.assessmentModelId,
        },
        orderBy: { createdAt: "desc" },
        include: {
            componentResults: {
                include: {
                    component: {
                        include: {
                            questions: {
                                include: {
                                    responses: {
                                        select: {
                                            id: true,
                                            questionId: true,
                                            responseData: true,
                                            isCorrect: true,
                                            pointsAwardded: true,
                                            maxPoints: true,
                                            aiEvaluation: true,
                                            aiScore: true,
                                            humanFeedback: true,
                                            humanReviewRequired: true,
                                            humanReviewed: true,
                                            humanReviewedBy: true,
                                            humanReviewedAt: true,
                                            timeSpent: true,
                                            createdAt: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    // Merge the assessment data with the responses
    if (userAssessmentModel) {
        return {
            ...memberAssessment,
            componentResults: userAssessmentModel.componentResults,
            totalTimeSpent: userAssessmentModel.totalTimeSpent,
            overallScore: userAssessmentModel.overallScore,
            passed: userAssessmentModel.passed,
            completedAt: userAssessmentModel.completedAt,
        };
    }

    // Fallback if no UserAssessmentModel found (shouldn't happen for completed assessments)
    return memberAssessment as any;
}

export async function getAllAssessmentModels(tenantSlug: string) {
    const session = await getApiSession();
    
    if (!session) {
        throw new Error("Unauthorized");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
        throw new Error("Tenant not found");
    }

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const isTenantAdmin = u.role === "TENANT_ADMIN" || u.role === "DEPARTMENT_HEAD";
    const isAdmin = isSuperAdmin || isTenantAdmin;
    const hasAccess = isSuperAdmin || u.tenantSlug === tenantSlug;

    if (!isAdmin || !hasAccess) {
        throw new Error("Access denied");
    }

    const models = await (prisma as any).assessmentModel.findMany({
        where: { tenantId: tenant.id },
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    memberAssessments: {
                        where: { status: "COMPLETED" },
                    },
                },
            },
        },
        orderBy: { name: "asc" },
    });

    return models;
}
