import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'AI/ML & Gen AI Courses - Sudaksha | Artificial Intelligence & Machine Learning Training',
  description: 'Learn artificial intelligence, machine learning, deep learning, and generative AI technologies including ChatGPT and large language models.',
  keywords: 'artificial intelligence, machine learning, deep learning, generative AI, ChatGPT, LLM, neural networks',
};

async function getAIMLCourses() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/courses?technologyDomain=ai-ml&limit=12`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch {
    return [];
  }
}

export default async function AIMLPage() {
  const courses = await getAIMLCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI/ML & Gen AI</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dive into the world of artificial intelligence and machine learning with cutting-edge courses covering traditional ML to generative AI.
          </p>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow line-clamp-2">
                    {course.shortDescription || course.description?.substring(0, 120)}
                  </p>
                  <div className="text-blue-600 font-semibold">
                    Duration: {course.duration} {course.duration > 1 ? 'weeks' : 'week'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No courses available at the moment.</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/demo">Book a Free Demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
