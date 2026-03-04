import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  console.log('🔧 Creating default trainer...');
  
  try {
    // Check if Prisma is available
    if (Object.keys(prisma).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prisma client is not initialized (mock mode)'
      });
    }
    
    // Connect to database
    await prisma.$connect();
    
    // Check if any trainer already exists
    const existingTrainer = await prisma.trainer.findFirst();
    if (existingTrainer) {
      return NextResponse.json({
        success: true,
        message: 'Trainer already exists',
        trainer: existingTrainer
      });
    }
    
    // Create default trainer
    const defaultTrainer = await prisma.trainer.create({
      data: {
        name: 'Default Trainer',
        email: 'trainer@sudaksha.com',
        bio: 'Default trainer for courses',
        expertise: ['Web Development', 'Programming', 'Software Engineering'],
        experience: 5,
        rating: 4.5,
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Default trainer created:', defaultTrainer.id);
    
    return NextResponse.json({
      success: true,
      message: 'Default trainer created successfully',
      trainer: defaultTrainer
    });
    
  } catch (error) {
    console.error('❌ Failed to create default trainer:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}
