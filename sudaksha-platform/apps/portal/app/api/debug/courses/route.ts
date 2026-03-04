import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🔍 Debug: Checking database connection and courses...');
  
  try {
    // Check if Prisma is available
    console.log('📊 Prisma object keys:', Object.keys(prisma));
    console.log('🎯 Is Prisma empty?', Object.keys(prisma).length === 0);
    
    if (Object.keys(prisma).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prisma client is not initialized (mock mode)',
        courses: [],
        databaseConnected: false
      });
    }
    
    // Test database connection
    console.log('🗄️ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Get all courses
    console.log('📚 Fetching all courses from database...');
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
        trainer: true
      }
    });
    
    // Get all trainers
    console.log('👨‍🏫 Fetching all trainers from database...');
    const trainers = await prisma.trainer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📋 Found ${courses.length} courses in database`);
    console.log(`👨‍🏫 Found ${trainers.length} trainers in database`);
    
    // Get database info
    const databaseInfo = {
      connected: true,
      courseCount: courses.length,
      trainerCount: trainers.length,
      recentCourses: courses.slice(0, 5).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        createdAt: c.createdAt,
        moduleCount: c.modules?.length || 0,
        trainerId: c.trainerId,
        trainerName: c.trainer?.name || 'No trainer'
      }))
    };
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      databaseInfo,
      courses: courses,
      trainers: trainers,
      allCourseNames: courses.map(c => c.name),
      allTrainerNames: trainers.map(t => t.name)
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      courses: [],
      databaseConnected: false,
      prismaAvailable: Object.keys(prisma).length > 0
    });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}
