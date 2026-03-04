'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Users, Award, Star, BookOpen, Target, CheckCircle,
  Calendar, DollarSign, PlayCircle, Download, Share2, Heart,
  ChevronDown, ChevronUp, ArrowRight, Zap, Shield, TrendingUp
} from 'lucide-react';
import { useParams } from 'next/navigation';

import { useCourse } from '@/hooks/use-courses';
import { CourseCard } from '@/components/courses/course-card'; // This is in root components/courses, but aliased as @/components/... might pick src?
// Actually CourseCard is in root/components. CourseHero is in src/components.
// I will use explicit paths if needed or @/src/ if available, but @/ maps to src.
import { CourseHero } from '@/components/courses/CourseDetails/CourseHero';
import { CourseInstructors } from '@/components/courses/CourseDetails/CourseInstructors';
import { CourseDeliverables } from '@/components/courses/CourseDetails/CourseDeliverables';
import { Course } from '@/types/course';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: course, isLoading, error } = useCourse(slug);

  // Mock related courses (in production, these would come from API)
  const relatedCourses: Course[] = []; // Keep empty or fetch from API later

  const handleEnroll = () => {
    setIsEnrolled(true);
    // Navigate to enrollment flow or show success message
  };

  const toggleModule = (index: number) => {
    setExpandedModule(expandedModule === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-80 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <a
            href="/courses"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Courses
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CourseHero course={course} handleEnroll={handleEnroll} isEnrolled={isEnrolled} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* What You'll Learn */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-8 h-8 mr-3 text-blue-600" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningObjectives && course.learningObjectives.map((objective: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">{objective}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Deliverables Section (New) */}
            {course.deliverables && course.deliverables.length > 0 && (
              <CourseDeliverables deliverables={course.deliverables} industry={course.industry} />
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="w-8 h-8 mr-3 text-green-600" />
                  Prerequisites
                </h2>
                <div className="prose prose-lg text-gray-600">
                  <p>{course.prerequisites}</p>
                </div>
              </motion.section>
            )}

            {/* Course Curriculum */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-8 h-8 mr-3 text-purple-600" />
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.curriculum && Array.isArray(course.curriculum) ? (
                  course.curriculum.map((module: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleModule(index)}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{module.title}</h3>
                            {module.duration && (
                              <p className="text-sm text-gray-600">{module.duration} weeks</p>
                            )}
                          </div>
                        </div>
                        {expandedModule === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedModule === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 py-4 bg-white border-t border-gray-200"
                        >
                          <p className="text-gray-600">{module.description}</p>
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Curriculum details coming soon.</p>
                )}
              </div>
            </motion.section>

            {/* Instructors Section (New) */}
            {course.instructors && course.instructors.length > 0 && (
              <CourseInstructors instructors={course.instructors} />
            )}

            {/* Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="w-8 h-8 mr-3 text-yellow-500" />
                Student Reviews
              </h2>

              <div className="flex items-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{course.rating || 0}</div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(course.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">({course.enrolledCount || 0} students)</div>
                </div>

                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600 w-8">{rating}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${rating === 5 ? 60 : rating === 4 ? 25 : 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-4">
                {[
                  {
                    name: 'Sarah Johnson',
                    rating: 5,
                    comment: 'Excellent course! The instructor was very knowledgeable and the projects were practical.',
                    date: '2 weeks ago'
                  },
                  {
                    name: 'Mike Chen',
                    rating: 4,
                    comment: 'Great content and well-structured curriculum. Would recommend to anyone starting out.',
                    date: '1 month ago'
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{review.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.durationHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{course.audienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium">{course.deliveryMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{course.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course.enrolledCount || 0}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium">{course.rating || 0}/5.0</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Book Free Demo
                </button>
                <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Talk to Advisor
                </button>
                <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Brochure
                </button>
              </div>
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share this course</h3>
              <div className="flex gap-3">
                <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-1 py-2 border rounded-lg transition-colors ${isFavorite
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <Heart className={`w-5 h-5 mx-auto ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((relatedCourse) => (
              <CourseCard
                key={relatedCourse.id}
                course={relatedCourse}
                onEnroll={() => console.log('Enroll in related course:', relatedCourse.name)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
