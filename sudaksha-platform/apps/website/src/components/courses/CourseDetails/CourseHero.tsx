'use client';

import { Star, Clock, Users, Award, Calendar, BookOpen, Play, Download, ChevronRight, Building2, Monitor, MapPin } from 'lucide-react';
import { Course } from '@/types/course';

interface CourseHeroProps {
  course: Course;
  handleEnroll?: () => void;
  isEnrolled?: boolean;
}

export function CourseHero({ course, handleEnroll, isEnrolled }: CourseHeroProps) {
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

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Safe access for array fields
  const deliveryModes = course.newDeliveryModes && course.newDeliveryModes.length > 0
    ? course.newDeliveryModes
    : [course.deliveryMode];

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-emerald-900 text-white relative overflow-hidden">
      {/* Abstract Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-16 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap space-x-2 text-sm text-blue-100 mb-8">
          <span>Home</span>
          <span>/</span>
          <span>Courses</span>
          <span>/</span>
          <span>{course.category.replace('_', ' ')}</span>
          <span>/</span>
          <span className="text-white font-medium">{course.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-100">
                {course.courseType || 'Certification'}
              </span>
              {course.industry && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {course.industry}
                </span>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-balance leading-tight">
              {course.title || course.name}
            </h1>

            <p className="text-xl text-blue-100 mb-8 text-balance leading-relaxed opacity-90">
              {course.shortDescription}
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 border-t border-white/10 pt-8">
              <div>
                <div className="flex items-center mb-1">
                  <Clock className="w-5 h-5 mr-2 text-emerald-400" />
                  <span className="text-xl font-bold">{formatDuration(course.durationHours || course.duration)}</span>
                </div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Duration</p>
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <Users className="w-5 h-5 mr-2 text-emerald-400" />
                  <span className="text-xl font-bold">{course.enrolledCount || 'NEW'}</span>
                </div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Learners</p>
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
                  <span className="text-xl font-bold">{course.rating}</span>
                </div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Rating</p>
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <div className="flex -space-x-2">
                    {deliveryModes.map((mode, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10" title={mode}>
                        {mode.toLowerCase().includes('online') ? <Monitor className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Modes</p>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleEnroll}
                disabled={isEnrolled}
                className={`px-8 py-3.5 rounded-lg font-bold transition-colors flex items-center justify-center shadow-lg shadow-emerald-900/20 ${isEnrolled
                    ? 'bg-emerald-700 text-white cursor-default'
                    : 'bg-emerald-500 text-white hover:bg-emerald-400'
                  }`}
              >
                {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                {!isEnrolled && <ChevronRight className="w-5 h-5 ml-2" />}
              </button>

              <button className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center">
                <Download className="w-5 h-5 mr-2" />
                Brochure
              </button>
            </div>
          </div>

          {/* Right Content - Course Preview */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-video bg-navy-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {course.imageUrl ? (
                <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900">
                  <BookOpen className="w-24 h-24 text-white/20" />
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl group">
                  <Play className="w-8 h-8 text-navy-900 ml-1 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>

              {/* Course Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-emerald-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {course.category.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Abstract Decorative elements */}
            <div className="absolute -z-10 top-1/2 right-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseHero;
