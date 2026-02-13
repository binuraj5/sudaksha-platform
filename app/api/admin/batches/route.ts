import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Helper function to check if we're in mock mode
// Helper function to check if we're in mock mode
const isMockMode = () => false;

// GET - Fetch all batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!prisma || !('courseBatch' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    if (id) {
      // Get single batch
      const batch = await prisma.courseBatch.findUnique({
        where: { id },
        include: {
          course: {
            select: { id: true, name: true, duration: true }
          },
          trainer: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      if (batch) {
        return NextResponse.json({
          success: true,
          batch
        })
      } else {
        return NextResponse.json(
          { success: false, error: 'Batch not found' },
          { status: 404 }
        )
      }
    } else {
      // Get all batches
      const batches = await prisma.courseBatch.findMany({
        include: {
          course: {
            select: { id: true, name: true, duration: true }
          },
          trainer: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { startDate: 'asc' }
      })

      return NextResponse.json({
        success: true,
        batches
      })
    }
  } catch (error) {
    console.error('Batches API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

// POST - Create new batch
export async function POST(request: NextRequest) {
  try {
    const batchData = await request.json()

    if (!prisma || !('courseBatch' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    const batch = await prisma.courseBatch.create({
      data: {
        name: batchData.name,
        courseId: batchData.courseId,
        trainerId: batchData.trainerId,
        startDate: new Date(batchData.startDate),
        endDate: new Date(batchData.endDate),
        status: batchData.status || 'UPCOMING',
        maxStudents: Number(batchData.maxStudents),
        schedule: batchData.schedule,
        mode: batchData.mode,
        location: batchData.location,
        price: batchData.price ? Number(batchData.price) : undefined,
        currentStudents: Number(batchData.currentStudents || 0)
      },
      include: {
        course: {
          select: { id: true, name: true }
        },
        trainer: {
          select: { id: true, name: true }
        }
      }
    })

    revalidatePath('/admin/batches')
    return NextResponse.json({
      success: true,
      batch
    })
  } catch (error) {
    console.error('Batch creation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}

// PUT - Update batch
export async function PUT(request: NextRequest) {
  try {
    const batchData = await request.json()

    if (!prisma || !('courseBatch' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    const batch = await prisma.courseBatch.update({
      where: { id: batchData.id },
      data: {
        name: batchData.name,
        courseId: batchData.courseId,
        trainerId: batchData.trainerId,
        startDate: batchData.startDate ? new Date(batchData.startDate) : undefined,
        endDate: batchData.endDate ? new Date(batchData.endDate) : undefined,
        status: batchData.status,
        maxStudents: batchData.maxStudents ? Number(batchData.maxStudents) : undefined,
        schedule: batchData.schedule,
        mode: batchData.mode,
        location: batchData.location,
        price: batchData.price ? Number(batchData.price) : undefined,
        currentStudents: batchData.currentStudents ? Number(batchData.currentStudents) : undefined
      },
      include: {
        course: {
          select: { id: true, name: true }
        },
        trainer: {
          select: { id: true, name: true }
        }
      }
    })

    revalidatePath('/admin/batches')
    return NextResponse.json({
      success: true,
      batch
    })

  } catch (error) {
    console.error('Batch update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update batch' },
      { status: 500 }
    )
  }
}

// DELETE - Delete batch
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Batch ID required' },
        { status: 400 }
      )
    }

    if (!prisma || !('courseBatch' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    await prisma.courseBatch.delete({
      where: { id }
    })

    revalidatePath('/admin/batches')
    return NextResponse.json({
      success: true,
      message: 'Batch deleted successfully'
    })
  } catch (error) {
    console.error('Batch deletion API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete batch' },
      { status: 500 }
    )
  }
}
