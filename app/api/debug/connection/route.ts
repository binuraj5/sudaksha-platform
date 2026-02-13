import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔍 Checking database connection and environment...');
  
  try {
    // Check environment variables
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET',
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 'SET' : 'NOT SET',
    };
    
    console.log('📋 Environment variables:', envVars);
    
    // Try to import Prisma
    let prismaAvailable = false;
    let prismaError = null;
    
    try {
      const { prisma } = await import('@/lib/prisma');
      prismaAvailable = Object.keys(prisma).length > 0;
      console.log('📊 Prisma available keys:', Object.keys(prisma));
      console.log('🎯 Prisma available:', prismaAvailable);
    } catch (error) {
      prismaError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to import Prisma:', error);
    }
    
    // Test database connection if Prisma is available
    let dbConnected = false;
    let dbError = null;
    
    if (prismaAvailable) {
      try {
        const { prisma } = await import('@/lib/prisma');
        await prisma.$connect();
        dbConnected = true;
        console.log('✅ Database connected successfully');
        
        // Test a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query successful:', result);
        
        await prisma.$disconnect();
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown database error';
        console.error('❌ Database connection failed:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      environment: envVars,
      prisma: {
        available: prismaAvailable,
        error: prismaError,
        keyCount: prismaAvailable ? Object.keys((await import('@/lib/prisma')).prisma).length : 0
      },
      database: {
        connected: dbConnected,
        error: dbError
      },
      recommendations: getRecommendations(envVars, prismaAvailable, dbConnected)
    });
    
  } catch (error) {
    console.error('❌ Debug check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getRecommendations(envVars: any, prismaAvailable: boolean, dbConnected: boolean): string[] {
  const recommendations: string[] = [];
  
  if (!envVars.DATABASE_URL || envVars.DATABASE_URL === 'NOT SET') {
    recommendations.push('❌ DATABASE_URL is not set in .env file');
    recommendations.push('📝 Add DATABASE_URL="postgresql://user:password@localhost:5432/dbname" to .env');
  }
  
  if (!prismaAvailable) {
    recommendations.push('❌ Prisma client is not initialized');
    recommendations.push('🔧 Check if DATABASE_URL is correct and database is running');
    recommendations.push('🏃 Run "npx prisma generate" to generate Prisma client');
  }
  
  if (prismaAvailable && !dbConnected) {
    recommendations.push('❌ Database connection failed');
    recommendations.push('🐘 Check if PostgreSQL is running on localhost:5432');
    recommendations.push('🔍 Verify database credentials in DATABASE_URL');
    recommendations.push('🏃 Run "npx prisma db push" to create database tables');
  }
  
  if (envVars.DATABASE_URL && prismaAvailable && dbConnected) {
    recommendations.push('✅ Database connection is working!');
    recommendations.push('🎯 Check if database tables exist: "npx prisma db push"');
    recommendations.push('👥 Create default trainer if needed');
  }
  
  return recommendations;
}
