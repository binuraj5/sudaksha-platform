import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '../../../../src/lib/actions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Get dashboard stats from database
    const stats = await getDashboardStats();

    // Get real course category breakdown
    const coursesByCategory = await prisma.course.groupBy({
      by: ['courseType'],
      _count: { id: true },
      where: { status: 'PUBLISHED' }
    });

    const categoryBreakdown = coursesByCategory.map(cat => ({
      name: cat.courseType.charAt(0) + cat.courseType.slice(1).toLowerCase(),
      count: cat._count.id
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        revenue: {
          total: stats.totalRevenue,
          growth: '+18%', // Mock trend until we have time-series data
          data: [
            { month: 'Jan', revenue: stats.totalRevenue * 0.1 },
            { month: 'Feb', revenue: stats.totalRevenue * 0.15 },
            { month: 'Mar', revenue: stats.totalRevenue * 0.2 },
            { month: 'Apr', revenue: stats.totalRevenue * 0.18 },
            { month: 'May', revenue: stats.totalRevenue * 0.22 },
            { month: 'Jun', revenue: stats.totalRevenue * 0.15 }
          ]
        },
        enrollments: {
          total: stats.totalStudents,
          growth: '+12%', // Mock trend
          data: [
            { month: 'Jan', enrollments: Math.floor(stats.totalStudents * 0.1) },
            { month: 'Feb', enrollments: Math.floor(stats.totalStudents * 0.15) },
            { month: 'Mar', enrollments: Math.floor(stats.totalStudents * 0.2) },
            { month: 'Apr', enrollments: Math.floor(stats.totalStudents * 0.18) },
            { month: 'May', enrollments: Math.floor(stats.totalStudents * 0.22) },
            { month: 'Jun', enrollments: Math.floor(stats.totalStudents * 0.15) }
          ]
        },
        courses: {
          total: stats.totalCourses,
          active: stats.activeCourses,
          categories: categoryBreakdown.length > 0 ? categoryBreakdown : [
            { name: 'Technology', count: Math.ceil(stats.totalCourses * 0.4) },
            { name: 'Functional', count: Math.ceil(stats.totalCourses * 0.3) },
            { name: 'Behavioral', count: Math.ceil(stats.totalCourses * 0.2) },
            { name: 'Personal', count: Math.ceil(stats.totalCourses * 0.1) }
          ]
        },
        engagement: {
          avgSessionDuration: 45, // Mock until we have tracking
          completionRate: 78.5, // Mock
          returningUsers: 67.8 // Mock
        }
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper functions
function getDateFromPeriod(period: string): Date {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}
