'use server'
import { prisma } from '@/lib/prisma'

export async function getAnalyticsData(timeRange: string) {
    const now = new Date();
    let startDate = new Date();

    if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
    else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
    else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);
    else if (timeRange === '1y') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setDate(now.getDate() - 30); // Default 30d

    // Previous period for growth calculation
    const previousStartDate = new Date(startDate);
    const timeDiff = now.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - timeDiff);

    // Revenue (Batch Price * Current Students)
    // Note: This is an estimation. Real revenue needs a Transaction model.
    const batches = await prisma.courseBatch.findMany({
        select: {
            price: true,
            currentStudents: true,
            createdAt: true
        }
    });

    const calculateRevenue = (start: Date, end: Date) => {
        return batches
            .filter(b => b.createdAt >= start && b.createdAt < end)
            .reduce((acc, b) => acc + ((b.price || 0) * b.currentStudents), 0);
    };

    const currentRevenue = calculateRevenue(startDate, now);
    const previousRevenue = calculateRevenue(previousStartDate, startDate);
    const revenueGrowth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // Enrollments (Total students in batches created in period + Form submissions?)
    // Using Batch.currentStudents as proxy or FormSubmission 'ENROLLMENT_INQUIRY'
    const calculateEnrollments = (start: Date, end: Date) => {
        return batches
            .filter(b => b.createdAt >= start && b.createdAt < end)
            .reduce((acc, b) => acc + b.currentStudents, 0);
    };

    const currentEnrollments = calculateEnrollments(startDate, now);
    const previousEnrollments = calculateEnrollments(previousStartDate, startDate);
    const enrollmentGrowth = previousEnrollments === 0 ? 100 : ((currentEnrollments - previousEnrollments) / previousEnrollments) * 100;

    // Courses
    const totalCourses = await prisma.course.count();
    const activeCourses = await prisma.course.count({ where: { status: 'PUBLISHED' } });

    // Trainers
    const totalTrainers = await prisma.trainer.count();
    const activeTrainers = await prisma.trainer.count({ where: { status: 'ACTIVE' } });

    return {
        revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            growth: revenueGrowth,
            monthlyData: [] // TODO: Implement graph data
        },
        enrollments: {
            current: currentEnrollments,
            previous: previousEnrollments,
            growth: enrollmentGrowth,
            monthlyData: []
        },
        courses: {
            total: totalCourses,
            active: activeCourses,
            completed: 0, // Need Batch logic
            popular: 'MERN Stack', // Placeholder
            monthlyData: []
        },
        trainers: {
            total: totalTrainers,
            active: activeTrainers,
            avgWorkload: 0,
            topPerformer: 'N/A'
        }
    };
}
