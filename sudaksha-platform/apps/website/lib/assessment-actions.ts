import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAssessments(filters: any = {}) {
    try {
        const { page = 1, limit = 10, search, status, department, type } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { employeeId: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (status) queryArrayFilter(where, 'status', status);
        // if (type) queryArrayFilter(where, 'assessmentType', type);

        // For department, we need to filter on the User model or AssessorProfile
        // Currently User has department field
        if (department) {
            where.user = {
                ...where.user,
                department: { contains: department, mode: 'insensitive' }
            };
        }

        const [assessments, total] = await Promise.all([
            prisma.userAssessmentModel.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            employeeId: true,
                            department: true,
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.userAssessmentModel.count({ where })
        ]);

        return {
            success: true,
            data: assessments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        console.error("Error fetching assessments:", error);
        return { success: false, error: "Failed to fetch assessments" };
    }
}

export async function getAssessmentStats() {
    try {
        const [
            total,
            draft,
            inProgress,
            submitted,
            underReview,
            completed
        ] = await Promise.all([
            prisma.userAssessmentModel.count(),
            prisma.userAssessmentModel.count({ where: { status: "DRAFT" } }),
            prisma.userAssessmentModel.count({ where: { status: "ACTIVE" } }),
            prisma.userAssessmentModel.count({ where: { status: "COMPLETED" } }), // Use available statuses
            prisma.userAssessmentModel.count({ where: { status: "EXPIRED" } }),
            prisma.userAssessmentModel.count({ where: { status: "COMPLETED" } }),
        ]);

        // Pending Reviews usually means SUBMITTED or UNDER_REVIEW
        const pendingReviews = 0; // submitted + underReview;

        return {
            success: true,
            stats: {
                total,
                draft,
                inProgress,
                submitted,
                underReview,
                completed,
                pendingReviews
            }
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}

export async function getAssessmentById(id: string) {
    try {
        const assessment = await prisma.userAssessmentModel.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        employeeId: true,
                        department: true,
                    }
                }
            }
        });

        if (!assessment) {
            return { success: false, error: "Assessment not found" };
        }

        return { success: true, data: assessment };
    } catch (error) {
        console.error("Error fetching assessment:", error);
        return { success: false, error: "Failed to fetch assessment details" };
    }
}

export async function bulkDeleteAssessments(ids: string[]) {
    try {
        await prisma.userAssessmentModel.deleteMany({
            where: { id: { in: ids } }
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting assessments:", error);
        return { success: false, error: "Failed to delete assessments" };
    }
}

export async function bulkUpdateAssessmentStatus(ids: string[], status: string) {
    try {
        await prisma.userAssessmentModel.updateMany({
            where: { id: { in: ids } },
            data: {
                status: status as any, // Cast to any to avoid enum issues if string passed
                updatedAt: new Date()
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating assessments:", error);
        return { success: false, error: "Failed to update assessments" };
    }
}

function queryArrayFilter(where: any, field: string, value: any) {
    if (Array.isArray(value)) {
        where[field] = { in: value };
    } else if (value) {
        where[field] = value;
    }
}
