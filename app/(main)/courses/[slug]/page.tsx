import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CourseViewClient from './CourseViewClient';

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'course';

  // Fetch title for metadata
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true }
  });

  return {
    title: course ? `${course.name} - Sudaksha | Course Details` : 'Course Not Found - Sudaksha',
    description: course?.shortDescription || `Detailed information about ${slug} course at Sudaksha.`,
    keywords: `${slug}, course details, training program, sudaksha`,
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  // Fetch course from database
  const courseData = await prisma.course.findUnique({
    where: { slug },
    include: {
      trainer: true,
      modules: {
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      },
      reviews: true
    }
  });

  if (!courseData) {
    notFound();
  }

  // Map database data to component format
  const course = {
    id: courseData.id,
    title: courseData.name,
    description: courseData.description,
    durationHours: courseData.duration,
    level: courseData.audienceLevel === 'ALL_LEVELS' ? 'All Levels' :
      courseData.audienceLevel === 'BEGINNER' ? 'Beginner' :
        courseData.audienceLevel === 'INTERMEDIATE' ? 'Intermediate' : 'Advanced',
    topics: (courseData.skillTags as string[]) || [],
    price: courseData.price ? `₹${courseData.price.toLocaleString()}` : 'Contact for pricing',
    originalPrice: null,
    category: courseData.category,
    placement: 'Placement assistance available',
    avgSalary: 'Varies by role',
    students: `${courseData.maxStudents || '500+'}`,
    rating: courseData.rating || 4.5,
    reviews: courseData.reviews.length,
    instructor: courseData.trainer?.name || 'Expert Instructor',
    instructorBio: courseData.trainer?.bio || 'Experienced professional',
    nextBatch: 'Check Schedule',
    mode: courseData.deliveryMode === 'ONLINE' ? 'Online' :
      courseData.deliveryMode === 'OFFLINE' ? 'Offline' : 'Hybrid',
    certificate: courseData.certification ? 'Industry Recognized' : 'Course Completion Only',
    projects: 3,
    language: courseData.language,
    support: '24/7 Mentorship',
    learningObjectives: Array.isArray(courseData.learningObjectives)
      ? courseData.learningObjectives.map((item: any) =>
        typeof item === 'object' && item !== null && 'outcome' in item
          ? item.outcome
          : String(item)
      )
      : [],
    prerequisites: courseData.prerequisites, // String
    modules: courseData.modules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      duration: module.duration,
      chapters: module.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration || 15, // Default to 15m if missing
        resources: []
      }))
    }))
  };

  return <CourseViewClient course={course} />;
}
