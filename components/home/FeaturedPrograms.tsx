'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, Users, Award, ChevronLeft, ChevronRight, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Mock course data for now
const mockCourses = [
  {
    id: '1',
    slug: 'full-stack-web-development',
    name: 'Full Stack Web Development',
    duration: 120,
    price: 49999,
    rating: 4.8,
    category: 'SOFTWARE_DEVELOPMENT',
    level: 'INTERMEDIATE',
    description: 'Master modern web development with React, Node.js, and TypeScript',
    shortDescription: 'Learn to build modern web applications using React, Node.js, and TypeScript',
    skillTags: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    placementRate: 92,
    isPopular: true
  },
  {
    id: '2',
    slug: 'data-science-fundamentals',
    name: 'Data Science Fundamentals',
    duration: 80,
    price: 39999,
    rating: 4.7,
    category: 'DATA_ANALYTICS',
    level: 'BEGINNER',
    description: 'Learn the fundamentals of data science and machine learning',
    shortDescription: 'Introduction to data science and machine learning with Python',
    skillTags: ['Python', 'Machine Learning', 'Statistics', 'Pandas'],
    placementRate: 88,
    isPopular: false
  },
  {
    id: '3',
    slug: 'cloud-architecture-aws',
    name: 'Cloud Architecture with AWS',
    duration: 100,
    price: 44999,
    rating: 4.9,
    category: 'CLOUD_DEVOPS',
    level: 'ADVANCED',
    description: 'Design and deploy scalable cloud solutions on AWS',
    shortDescription: 'Master AWS services and cloud architecture',
    skillTags: ['AWS', 'Cloud Computing', 'DevOps', 'Docker'],
    placementRate: 95,
    isPopular: true
  }
];

export function FeaturedPrograms() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 40) {
      return `${Math.floor(duration / 40)} weeks`;
    }
    return `${duration} hours`;
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, mockCourses.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, mockCourses.length - 2)) % Math.max(1, mockCourses.length - 2));
  };

  const visibleCourses = mockCourses.slice(currentIndex, currentIndex + 3);

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Transform Your Career with Industry-Ready Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handpicked programs with highest placement rates and industry recognition
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevSlide}
              disabled={mockCourses.length <= 3}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: Math.max(1, mockCourses.length - 2) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={mockCourses.length <= 3}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {visibleCourses.map((course: any, index: number) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {course.category.replace('_', ' ')}
                    </span>
                  </div>
                  {course.isPopular && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-blue-600" />
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{course.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.shortDescription || course.description}</p>

                  {/* Key Highlights */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.rating} ⭐</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-1" />
                      <span>{course.placementRate || 85}% Placement</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Next Batch Soon</span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(course.skillTags || []).slice(0, 3).map((skill: string, skillIndex: number) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{formatPrice(course.price)}</div>
                      <div className="text-sm text-gray-500 line-through">{formatPrice(course.price * 1.4)}</div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Save {formatPrice(course.price * 0.4)}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      Enquire
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/courses"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            View All Courses
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
