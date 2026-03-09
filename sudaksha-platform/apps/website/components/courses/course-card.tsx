'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Users, Star, BookOpen,
  Code, Database, Cloud, BarChart, Briefcase, Cpu, Globe, Layout, Server, Shield
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
  if (normalized.includes('data')) return <Database className="w-5 h-5" />;
  if (normalized.includes('cloud')) return <Cloud className="w-5 h-5" />;
  if (normalized.includes('cyber')) return <Shield className="w-5 h-5" />;
  if (normalized.includes('web')) return <Globe className="w-5 h-5" />;
  if (normalized.includes('devops')) return <Server className="w-5 h-5" />;
  if (normalized.includes('business')) return <Briefcase className="w-5 h-5" />;
  if (normalized.includes('marketing')) return <BarChart className="w-5 h-5" />;
  if (normalized.includes('ai') || normalized.includes('intelligence')) return <Cpu className="w-5 h-5" />;
  if (normalized.includes('management')) return <Users className="w-5 h-5" />;
  return <Code className="w-5 h-5" />;
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
        className={`bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-[0_4px_20px_rgba(249,115,22,0.18)] hover:border-orange-300 transition-all duration-200 overflow-hidden flex flex-col h-full ${className}`}
      >
        {/* Branded Header — course name + icon on colored background */}
        <div className={`relative h-32 ${getCategoryColor(course.category)} flex flex-col justify-between overflow-hidden flex-shrink-0 p-4`}>
          {/* Decorative background circles */}
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 w-14 h-14 rounded-full bg-white/10" />

          {/* Top row: icon + badges */}
          <div className="flex items-start justify-between relative z-10">
            <div className="p-1.5 rounded-lg bg-white/25">
              {getCategoryIcon(course.category)}
            </div>
            <div className="flex flex-col gap-1 items-end">
              {course.rating > 0 && (
                <div className="bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">{course.rating.toFixed(1)}</span>
                </div>
              )}
              {course.specialFeatures?.includes('Most Popular') && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500 text-white">Popular</span>
              )}
              {course.specialFeatures?.includes('New Program') && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white">New</span>
              )}
            </div>
          </div>

          {/* Course name at the bottom of header */}
          <h3 className="relative z-10 text-sm font-bold leading-snug line-clamp-2 drop-shadow-sm">
            {course.name}
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="space-y-2 flex-1">
            <p className="text-xs text-gray-500">{course.category}</p>

            {/* Description */}
            {course.description && (
              <p className="text-gray-500 text-xs line-clamp-2">{course.description}</p>
            )}

            {/* Course meta — single row, no duplicates */}
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
              {(course.durationHours ?? 0) > 0 && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.durationHours}h</span>
              )}
              {course.audienceLevel && (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getLevelColor(course.audienceLevel)}`}>
                  {course.audienceLevel}
                </span>
              )}
              {course.deliveryMode && (
                <span className="flex items-center gap-1">
                  {course.deliveryMode.toUpperCase() === 'ONLINE' ? <Globe className="w-3 h-3" /> :
                   course.deliveryMode.toUpperCase() === 'OFFLINE' ? <Users className="w-3 h-3" /> :
                   <Layout className="w-3 h-3" />}
                  {course.deliveryMode}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-3 pt-3 border-t border-orange-100 flex items-center justify-end gap-2">
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
