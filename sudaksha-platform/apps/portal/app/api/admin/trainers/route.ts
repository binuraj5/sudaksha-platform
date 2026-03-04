import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Helper function to check if we're in mock mode
// Helper function to check if we're in mock mode
const isMockMode = () => false;

// ...

// GET - Fetch all trainers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single trainer
      const trainer = await prisma.trainer.findUnique({
        where: { id },
        include: {
          courses: {
            select: { id: true, name: true }
          }
        }
      })
      if (trainer) {
        return NextResponse.json({ success: true, trainer })
      }
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 })
    } else {
      // Get all trainers
      const trainers = await prisma.trainer.findMany({
        include: {
          courses: {
            select: { id: true, name: true }
          },
          batches: {
            select: { currentStudents: true, status: true }
          },
          _count: { select: { courses: true, batches: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Map trainers to include aggregated student counts
      const trainersWithStats = trainers.map(trainer => ({
        ...trainer,
        studentsCount: trainer.batches
          .filter(b => b.status === 'ONGOING' || b.status === 'UPCOMING')
          .reduce((sum, batch) => sum + batch.currentStudents, 0)
      }))

      return NextResponse.json({ success: true, trainers: trainersWithStats })
    }
  } catch (error) {
    console.error('Trainers API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trainers' },
      { status: 500 }
    )
  }
}

// POST - Create new trainer
export async function POST(request: NextRequest) {
  try {
    const trainerData = await request.json()

    const trainer = await prisma.trainer.create({
      data: {
        ...trainerData,
        status: 'ACTIVE'
      }
    })
    revalidatePath('/admin/trainers')
    return NextResponse.json({ success: true, trainer })
  } catch (error) {
    console.error('Trainer creation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create trainer' },
      { status: 500 }
    )
  }
}

// PUT - Update trainer
export async function PUT(request: NextRequest) {
  try {
    const trainerData = await request.json()

    const trainer = await prisma.trainer.update({
      where: { id: trainerData.id },
      data: trainerData
    })
    revalidatePath('/admin/trainers')
    return NextResponse.json({ success: true, trainer })
  } catch (error) {
    console.error('Trainer update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update trainer' },
      { status: 500 }
    )
  }
}

// DELETE - Delete trainer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Trainer ID required' },
        { status: 400 }
      )
    }

    await prisma.trainer.delete({ where: { id } })
    revalidatePath('/admin/trainers')
    return NextResponse.json({ success: true, message: 'Trainer deleted successfully' })

  } catch (error) {
    console.error('Trainer deletion API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete trainer' },
      { status: 500 }
    )
  }
}

