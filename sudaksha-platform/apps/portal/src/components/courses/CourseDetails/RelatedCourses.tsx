'use client';

import { Course } from '@/types/course';
import CourseCard from '../CourseCard';
import Link from 'next/link';

interface RelatedCoursesProps {
  currentCourse: Course;
}

export function RelatedCourses({ currentCourse }: RelatedCoursesProps) {
  // Mock related courses - in real app, this would come from API
  const relatedCourses: Course[] = [
    {
      id: '2',
      slug: 'data-science-fundamentals',
      name: 'Data Science Fundamentals',
      description: 'Introduction to data science and machine learning',
      shortDescription: 'Learn the fundamentals of data science and machine learning',
      duration: 240,
      price: 39999,
      rating: 4.7,
      status: 'PUBLISHED' as any,
      audienceLevel: 'BEGINNER' as any,
      category: 'DATA_ANALYTICS' as any,
      courseType: 'TECHNOLOGY' as any,
      targetLevel: 'JUNIOR' as any,
      industry: 'GENERIC' as any,
      categoryType: 'IT' as any,
      deliveryMode: 'ONLINE' as any,
      newDeliveryModes: ['ONLINE'] as any,
      learningOutcomes: [],
      instructors: [],
      includedFeatures: [],
      deliverables: [],
      prerequisites: '',
      curriculum: [],
      isSelfPaced: false,
      skillTags: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
      learningObjectives: ['Understand ML concepts', 'Work with data', 'Build models'],
      moduleBreakdown: {},
      imageUrl: undefined,
      language: 'English',
      certification: true,
      trainerId: '2',
      trainer: {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@sudaksha.com',
        bio: 'Data Science expert specializing in ML and AI',
        expertise: ['Python', 'Machine Learning', 'AI'],
        experience: 8,
        rating: 4.8,
        imageUrl: undefined,
        status: 'ACTIVE' as any
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',

      batches: [],
      reviews: [],
      placementRate: 88,
      isNew: true,
      hasPlacementSupport: true,
      hasEMI: true,
      hasCorporateTraining: false,
      isPopular: false,
      isFinishingSchool: false
    },
    {
      id: '3',
      slug: 'cloud-architecture-aws',
      name: 'Cloud Architecture with AWS',
      description: 'Master AWS services and cloud architecture',
      shortDescription: 'Design and deploy scalable cloud solutions on AWS',
      duration: 280,
      price: 44999,
      rating: 4.9,
      status: 'PUBLISHED' as any,
      audienceLevel: 'ADVANCED' as any,
      category: 'CLOUD_DEVOPS' as any,
      courseType: 'TECHNOLOGY' as any,
      targetLevel: 'SENIOR' as any,
      industry: 'TECHNOLOGY' as any,
      categoryType: 'IT' as any,
      deliveryMode: 'ONLINE' as any,
      newDeliveryModes: ['ONLINE'] as any,
      learningOutcomes: [],
      instructors: [],
      includedFeatures: [],
      deliverables: [],
      prerequisites: '',
      curriculum: [],
      isSelfPaced: false,
      skillTags: ['AWS', 'Cloud Computing', 'DevOps', 'Kubernetes'],
      learningObjectives: ['Master AWS services', 'Design cloud architecture', 'Implement DevOps'],
      moduleBreakdown: {},
      imageUrl: undefined,
      language: 'English',
      certification: true,
      trainerId: '3',
      trainer: {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.wilson@sudaksha.com',
        bio: 'Cloud Architecture specialist',
        expertise: ['AWS', 'Azure', 'DevOps'],
        experience: 12,
        rating: 4.9,
        imageUrl: undefined,
        status: 'ACTIVE' as any
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',

      batches: [],
      reviews: [],
      placementRate: 95,
      isPopular: true,
      hasPlacementSupport: true,
      hasEMI: true,
      hasCorporateTraining: true,
      isNew: false,
      isFinishingSchool: false
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Students Also Viewed</h2>
          <p className="text-gray-600">Explore these popular courses that might interest you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              viewMode="grid"
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
            View All Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RelatedCourses;
