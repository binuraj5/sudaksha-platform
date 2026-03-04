'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Users, Star, BookOpen, Award, DollarSign, Info, ArrowRight,
  Code, Database, Cloud, Lock, BarChart, Briefcase, Terminal, Cpu, Globe, Layout, Server, Shield
} from 'lucide-react';
import { Course } from '@/types/course';
import Link from 'next/link';
import { GlobalCTAForm } from '../common/GlobalCTAForm';

interface CourseCardProps {
  course: Course;
  viewMode?: 'grid' | 'list';
  onEnroll?: (course: Course) => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('data')) return <Database className="w-8 h-8" />;
  if (normalized.includes('cloud')) return <Cloud className="w-8 h-8" />;
  if (normalized.includes('cyber')) return <Shield className="w-8 h-8" />;
  if (normalized.includes('web')) return <Globe className="w-8 h-8" />;
  if (normalized.includes('devops')) return <Server className="w-8 h-8" />;
  if (normalized.includes('business')) return <Briefcase className="w-8 h-8" />;
  if (normalized.includes('marketing')) return <BarChart className="w-8 h-8" />;
  if (normalized.includes('ai') || normalized.includes('intelligence')) return <Cpu className="w-8 h-8" />;
  if (normalized.includes('management')) return <Users className="w-8 h-8" />;
  return <Code className="w-8 h-8" />;
};

const getCategoryColor = (category: string) => {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('data')) return 'bg-blue-100 text-blue-600';
  if (normalized.includes('cloud')) return 'bg-sky-100 text-sky-600';
  if (normalized.includes('cyber')) return 'bg-red-100 text-red-600';
  if (normalized.includes('business')) return 'bg-amber-100 text-amber-600';
  if (normalized.includes('ai')) return 'bg-purple-100 text-purple-600';
  return 'bg-indigo-100 text-indigo-600';
};

export function CourseCard({
  course,
  viewMode = 'grid',
  onEnroll,
  className = ''
}: CourseCardProps) {
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const CardComponent = viewMode === 'grid' ? motion.div : 'div';

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEnrollForm(true);

    // Track click
    try {
      const { trackEvent } = await import('@/lib/tracking');
      await trackEvent({
        action: 'CLICK_CTA',
        entityType: 'BUTTON',
        entityId: course.id,
        details: { button: 'Enroll Now', courseName: course.name, price: course.price }
      });
    } catch (err) {
      console.error('Tracking failed', err);
    }

    if (onEnroll) {
      onEnroll(course);
    }
  };

  const cardProps = viewMode === 'grid' ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    whileTap: { scale: 0.98 }
  } : {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'BEGINNER': return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE': return 'bg-purple-100 text-purple-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 ${className}`}>
          <div className="flex items-center gap-4">
            <div className={`w-24 h-24 ${getCategoryColor(course.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {getCategoryIcon(course.category)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {course.category}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{course.durationHours} hours</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{course.audienceLevel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.deliveryMode}</span>
                    </div>
                    {course.rating && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.audienceLevel)}`}>
                      {course.audienceLevel}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                    {course.specialFeatures?.map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-xl font-bold text-blue-600">
                    ₹{course.price.toLocaleString('en-IN')}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/courses/${course.slug || course.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      More Details
                    </Link>
                    <button
                      onClick={handleEnrollClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <GlobalCTAForm
          isOpen={showEnrollForm}
          onClose={() => setShowEnrollForm(false)}
          ctaSubject={`Enroll Inquiry: ${course.name}`}
          sourceButton="Enroll - Card List"
        />
      </>
    );
  }

  return (
    <>
      <CardComponent
        {...cardProps}
        className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full ${className}`}
      >
        {/* Icon Header */}
        <div className={`relative h-48 ${getCategoryColor(course.category)} flex items-center justify-center overflow-hidden flex-shrink-0`}>
          <div className="transform scale-150 opacity-90 p-6 rounded-full bg-white/20 backdrop-blur-sm">
            {getCategoryIcon(course.category)}
          </div>

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Industry Badge */}
            {course.industry && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm">
                {course.industry}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {/* Rating */}
            {course.rating && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold">{course.rating.toFixed(1)}</span>
              </div>
            )}
            {/* Popular/New Badges */}
            {course.specialFeatures?.includes('Most Popular') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white shadow-sm">
                Popular
              </span>
            )}
            {course.specialFeatures?.includes('New Program') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white shadow-sm">
                New
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="space-y-4 flex-1">
            {/* Title and Category */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[3.5rem]">
                {course.name}
              </h3>
              <p className="text-sm text-gray-600">{course.category}</p>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
              {course.description}
            </p>

            {/* Course Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.durationHours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.audienceLevel}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.deliveryMode}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getLevelColor(course.audienceLevel)} bg-opacity-10 border border-opacity-20`}>
                {course.audienceLevel}
              </span>

              {/* Delivery Mode Icon Badge */}
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                {course.deliveryMode === 'Online' || course.deliveryMode === 'ONLINE' ? <Globe className="w-3 h-3 mr-1" /> :
                  course.deliveryMode === 'Offline' || course.deliveryMode === 'OFFLINE' ? <Users className="w-3 h-3 mr-1" /> :
                    <Layout className="w-3 h-3 mr-1" />
                }
                {course.deliveryMode}
              </span>

              {/* Next Batch (Mock) */}
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <Clock className="w-3 h-3 mr-1" />
                Next Batch: Soon
              </span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between gap-3">
            <div className="text-xl font-bold text-blue-600">
              ₹{course.price.toLocaleString('en-IN')}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/courses/${course.slug || course.id}`}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
              >
                Details
              </Link>
              <motion.button
                onClick={handleEnrollClick}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Enroll
              </motion.button>
            </div>
          </div>
        </div>
      </CardComponent>
      <GlobalCTAForm
        isOpen={showEnrollForm}
        onClose={() => setShowEnrollForm(false)}
        ctaSubject={`Enroll Inquiry: ${course.name}`}
        sourceButton="Enroll - Card Grid"
      />
    </>
  );
}
