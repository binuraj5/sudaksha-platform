import { notFound } from 'next/navigation';
import { CourseHero } from '@/components/courses/CourseDetails/CourseHero';
import { CourseContent } from '@/components/courses/CourseDetails/CourseContent';
import { EnrollmentCard } from '@/components/courses/CourseDetails/EnrollmentCard';
import { RelatedCourses } from '@/components/courses/CourseDetails/RelatedCourses';
import { Course } from '@/types/course';

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/courses/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CourseHero course={course} />

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Content */}
          <div className="flex-1">
            <CourseContent course={course} />
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:w-96">
            <div className="sticky top-24">
              <EnrollmentCard course={course} />
            </div>
          </div>
        </div>
      </div>

      {/* Related Courses */}
      <RelatedCourses currentCourse={course} />
    </div>
  );
}
