import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// Helper function to check if we're in mock mode
const isMockMode = () => Object.keys(prisma).length === 0

export async function GET(request: NextRequest) {
  try {
    if (isMockMode()) {
      console.log('🔄 Mock mode: Returning test-db API data')
      return NextResponse.json({
        success: true,
        data: {
          trainerCount: 8,
          courseCount: 12,
          databaseConnected: false,
          mockMode: true
        }
      })
    }

    // Test database connection
    await prisma.$connect()
    
    // Test basic query
    const trainerCount = await prisma.trainer.count()
    const courseCount = await prisma.course.count()
    
    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        trainerCount,
        courseCount,
        databaseConnected: true
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database connection failed',
        databaseConnected: false
      },
      { status: 500 }
    )
  }
}
