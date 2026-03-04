'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Course creation server action
export async function createCourse(courseData: {
  name: string
  slug: string
  category: string
  categoryType: string
  targetLevel: string
  courseType: string
  industry?: string
  description: string
  shortDescription?: string
  duration: number
  price: number
  audienceLevel: string
  skillTags: string[]
  learningObjectives: string[]
  trainerId: string
  modules?: Array<{
    title: string
    description?: string
    order: number
    duration: number
    lessons: Array<{
      title: string
      description?: string
      duration: number
      order: number
      is_free: boolean
    }>
  }>
}) {
  try {
    const course = await prisma.course.create({
      data: {
        name: courseData.name,
        slug: courseData.slug,
        category: courseData.category as any,
        categoryType: courseData.categoryType as any,
        targetLevel: courseData.targetLevel as any,
        courseType: courseData.courseType as any,
        industry: courseData.industry || 'Generic/All Industries',
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        duration: courseData.duration,
        price: courseData.price,
        audienceLevel: courseData.audienceLevel as any,
        skillTags: courseData.skillTags,
        learningObjectives: courseData.learningObjectives,
        moduleBreakdown: {},
        trainer: {
          connect: { id: courseData.trainerId }
        },
        status: 'DRAFT'
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    })

    // Create modules and lessons
    if (courseData.modules && courseData.modules.length > 0) {
      for (const moduleData of courseData.modules) {
        const module = await prisma.courseModule.create({
          data: {
            title: moduleData.title,
            description: moduleData.description,
            order: moduleData.order,
            duration: moduleData.duration,
            courseId: course.id
          }
        })

        // Create lessons for this module
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          for (const lessonData of moduleData.lessons) {
            await prisma.courseLesson.create({
              data: {
                title: lessonData.title,
                description: lessonData.description,
                duration: lessonData.duration,
                order: lessonData.order,
                isFree: lessonData.is_free,
                moduleId: module.id
              }
            })
          }
        }
      }
    }

    revalidatePath('/admin/courses')
    return { success: true, course }
  } catch (error) {
    console.error('Failed to create course:', error)
    return { success: false, error: 'Failed to create course' }
  }
}

// Get dashboard stats
export async function getDashboardStats() {
  try {
    const [
      totalCourses,
      activeTrainers,
      upcomingBatches,
      totalStudents
    ] = await Promise.all([
      prisma.course.count(),
      prisma.trainer.count({ where: { status: 'ACTIVE' } }),
      prisma.courseBatch.count({
        where: { status: 'UPCOMING' },
        orderBy: { startDate: 'asc' }
      }),
      prisma.courseBatch.aggregate({
        _sum: { currentStudents: true }
      })
    ])

    return {
      totalCourses,
      activeTrainers,
      upcomingBatches,
      totalStudents: totalStudents._sum.currentStudents || 0
    }
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    throw new Error('Failed to fetch dashboard stats')
  }
}

// Get upcoming batches with details
export async function getUpcomingBatches(limit: number = 5) {
  try {
    const batches = await prisma.courseBatch.findMany({
      where: { status: 'UPCOMING' },
      include: {
        course: {
          select: { name: true }
        },
        trainer: {
          select: { name: true }
        }
      },
      orderBy: { startDate: 'asc' },
      take: limit
    })

    return batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      courseName: batch.course.name,
      trainerName: batch.trainer.name,
      startDate: batch.startDate.toISOString().split('T')[0],
      currentStudents: batch.currentStudents,
      maxStudents: batch.maxStudents
    }))
  } catch (error) {
    console.error('Failed to get upcoming batches:', error)
    throw new Error('Failed to fetch upcoming batches')
  }
}

// Get all courses for admin
export async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        trainer: {
          select: { name: true, email: true }
        },
        modules: {
          include: {
            lessons: true
          }
        },
        batches: {
          select: { id: true, name: true, status: true, startDate: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return courses
  } catch (error) {
    console.error('Failed to get courses:', error)
    throw new Error('Failed to fetch courses')
  }
}

// Get all trainers for admin
export async function getTrainers() {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        courses: {
          select: { id: true, name: true, status: true }
        },
        batches: {
          select: { id: true, name: true, status: true, startDate: true }
        },
        _count: {
          select: { courses: true, batches: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return trainers
  } catch (error) {
    console.error('Failed to get trainers:', error)
    throw new Error('Failed to fetch trainers')
  }
}

// Create new trainer
export async function createTrainer(trainerData: {
  name: string
  email: string
  bio: string
  expertise: string[]
  experience: number
  imageUrl?: string
  linkedinUrl?: string
}) {
  try {
    const trainer = await prisma.trainer.create({
      data: trainerData
    })

    revalidatePath('/admin/trainers')
    return { success: true, trainer }
  } catch (error) {
    console.error('Failed to create trainer:', error)
    return { success: false, error: 'Failed to create trainer' }
  }
}

// Create new batch
export async function createBatch(batchData: {
  name: string
  courseId: string
  trainerId: string
  startDate: Date
  endDate: Date
  schedule: string
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID'
  maxStudents: number
  price?: number
  location?: string
  meetingUrl?: string
}) {
  try {
    const batch = await prisma.courseBatch.create({
      data: {
        name: batchData.name,
        startDate: batchData.startDate,
        endDate: batchData.endDate,
        schedule: batchData.schedule,
        mode: batchData.mode,
        maxStudents: batchData.maxStudents,
        price: batchData.price,
        location: batchData.location,
        meetingUrl: batchData.meetingUrl,
        course: {
          connect: { id: batchData.courseId }
        },
        trainer: {
          connect: { id: batchData.trainerId }
        }
      }
    })

    revalidatePath('/admin/batches')
    return { success: true, batch }
  } catch (error) {
    console.error('Failed to create batch:', error)
    return { success: false, error: 'Failed to create batch' }
  }
}
