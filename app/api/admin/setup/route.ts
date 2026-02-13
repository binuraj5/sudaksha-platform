import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// Helper function to check if we're in mock mode
const isMockMode = () => Object.keys(prisma).length === 0

export async function POST(request: NextRequest) {
  try {
    if (isMockMode()) {
      console.log('🔄 Mock mode: Returning setup API data')
      return NextResponse.json({
        success: true,
        trainer: {
          id: 'mock-trainer-1',
          name: 'Admin Trainer',
          email: 'admin@sudaksha.com'
        },
        mockMode: true
      })
    }

    // Create a default trainer if it doesn't exist
    const existingTrainer = await prisma.trainer.findFirst({
      where: { email: 'admin@sudaksha.com' }
    })

    let trainer
    if (!existingTrainer) {
      trainer = await prisma.trainer.create({
        data: {
          name: 'Admin Trainer',
          email: 'admin@sudaksha.com',
          bio: 'Default trainer for admin-created courses',
          expertise: ['Software Development', 'Web Development', 'Database Management'],
          experience: 5,
          rating: 4.5,
          status: 'ACTIVE'
        }
      })
    } else {
      trainer = existingTrainer
    }

    return NextResponse.json({
      success: true,
      trainer: {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email
      }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Setup failed' },
      { status: 500 }
    )
  }
}
