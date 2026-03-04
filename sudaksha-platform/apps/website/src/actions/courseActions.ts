'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CourseStatus, BatchMode } from '@prisma/client';
import slugify from 'slugify';

export interface CourseCreationData {
  course: {
    name: string;
    description: string;
    shortDescription?: string;
    category: string;
    courseType: string;
    categoryType: string;
    industry: string;
    targetLevel: string;
    duration: number;
    price: number;
    skillTags: string[];
    learningObjectives: string[];
  };
  modules: Array<{
    title: string;
    description?: string;
    order: number;
    duration: number;
  }>;
  lessons: Array<{
    title: string;
    description?: string;
    content?: string;
    duration: number;
    order: number;
    isFree?: boolean;
    moduleId: string;
  }>;
}

export async function publishCourse(courseData: CourseCreationData) {
  try {
    // Generate slug from course name
    const slug = slugify(courseData.course.name, { lower: true, strict: true });

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    });

    if (existingCourse) {
      throw new Error('A course with this name already exists');
    }

    // Get a trainer (for now, we'll use the first active trainer)
    // In a real app, this would be based on the admin creating the course
    const trainer = await prisma.trainer.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!trainer) {
      throw new Error('No active trainers found. Please add a trainer first.');
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the course
      const course = await tx.course.create({
        data: {
          name: courseData.course.name,
          slug,
          category: courseData.course.category as any,
          courseType: courseData.course.courseType as any,
          categoryType: courseData.course.categoryType as any,
          industry: courseData.course.industry,
          targetLevel: courseData.course.targetLevel as any,
          description: courseData.course.description,
          shortDescription: courseData.course.shortDescription,
          duration: courseData.course.duration,
          price: courseData.course.price,
          skillTags: courseData.course.skillTags,
          learningObjectives: courseData.course.learningObjectives,
          moduleBreakdown: {
            modules: courseData.modules.map(module => ({
              title: module.title,
              duration: module.duration,
              lessons: [] // Will be populated after lessons are created
            }))
          },
          status: CourseStatus.PUBLISHED,
          audienceLevel: 'BEGINNER', // Default, can be updated later
          language: 'English',
          certification: true,
          trainerId: trainer.id,
        },
      });

      // Create modules
      const createdModules = [];
      for (const moduleData of courseData.modules) {
        const module = await tx.courseModule.create({
          data: {
            title: moduleData.title,
            description: moduleData.description,
            order: moduleData.order,
            duration: moduleData.duration,
            courseId: course.id,
          },
        });
        createdModules.push(module);
      }

      // Create lessons and link them to modules
      for (const lessonData of courseData.lessons) {
        // Find the module by the temporary moduleId
        const moduleIndex = courseData.modules.findIndex(m => m.title === lessonData.moduleId);
        if (moduleIndex === -1) continue;

        const module = createdModules[moduleIndex];

        await tx.courseLesson.create({
          data: {
            title: lessonData.title,
            description: lessonData.description,
            content: lessonData.content,
            duration: lessonData.duration,
            order: lessonData.order,
            isFree: lessonData.isFree || false,
            moduleId: module.id,
          },
        });
      }

      // Create an initial batch for the course (UPCOMING status)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // 30 days from now

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + course.duration * 7); // Rough estimate: 1 week per hour

      await tx.courseBatch.create({
        data: {
          name: `${course.name} - Batch 1`,
          courseId: course.id,
          trainerId: trainer.id,
          startDate,
          endDate,
          schedule: 'To be announced',
          mode: BatchMode.ONLINE,
          maxStudents: 50,
          currentStudents: 0,
          status: 'UPCOMING',
        },
      });

      return course;
    });

    // Revalidate the courses page
    revalidatePath('/courses');
    revalidatePath('/admin/courses');

    return {
      success: true,
      course: result,
      message: 'Course published successfully!',
    };

  } catch (error) {
    console.error('Error publishing course:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish course',
    };
  }
}

export async function updateCourse(courseId: string, courseData: Partial<CourseCreationData>) {
  try {
    // This would implement course updates
    // For now, we'll just return a placeholder
    return {
      success: true,
      message: 'Course update functionality coming soon',
    };
  } catch (error) {
    console.error('Error updating course:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update course',
    };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.ARCHIVED },
    });

    revalidatePath('/courses');
    revalidatePath('/admin/courses');

    return {
      success: true,
      message: 'Course archived successfully',
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete course',
    };
  }
}
