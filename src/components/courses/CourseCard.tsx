import Link from 'next/link';
import { Star, Clock, Users, Calendar, Award, DollarSign, CheckCircle, BookOpen, Monitor, MapPin, Users as UsersIcon, Building2 } from 'lucide-react';
import { Course } from '../../types/course';

interface CourseCardProps {
  course: Course;
  viewMode?: 'grid' | 'list';
}

const CourseCard = ({ course, viewMode = 'grid' }: CourseCardProps) => {
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

  const getCategoryColor = (category: string) => {
    // Map both old Enum values and new string values if needed
    const colors: Record<string, string> = {
      'SOFTWARE_DEVELOPMENT': 'bg-blue-100 text-blue-800',
      'DATA_ANALYTICS': 'bg-green-100 text-green-800',
      'CLOUD_DEVOPS': 'bg-purple-100 text-purple-800',
      'AI_ML': 'bg-red-100 text-red-800',
      'CYBERSECURITY': 'bg-yellow-100 text-yellow-800',
      'BUSINESS_ANALYSIS': 'bg-indigo-100 text-indigo-800',
      'PROJECT_MANAGEMENT': 'bg-pink-100 text-pink-800',
      'DIGITAL_MARKETING': 'bg-orange-100 text-orange-800',
      // Fallback/New categories
      'Technology': 'bg-blue-50 text-blue-700',
      'Healthcare': 'bg-teal-50 text-teal-700',
      'Finance': 'bg-emerald-50 text-emerald-700',
      'Retail': 'bg-orange-50 text-orange-700',
      'Manufacturing': 'bg-slate-100 text-slate-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
      'ADVANCED': 'bg-red-100 text-red-800',
      'ALL_LEVELS': 'bg-blue-100 text-blue-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE': return <Monitor className="w-3 h-3" />;
      case 'Live Online': return <Monitor className="w-3 h-3" />;
      case 'OFFLINE': return <MapPin className="w-3 h-3" />;
      case 'Offline': return <MapPin className="w-3 h-3" />;
      case 'HYBRID': return <UsersIcon className="w-3 h-3" />;
      case 'Hybrid': return <UsersIcon className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const getDeliveryModeColor = (mode: string) => {
    // Simply hash string to color if not matched
    switch (mode) {
      case 'ONLINE': return 'bg-blue-100 text-blue-800';
      case 'Live Online': return 'bg-blue-100 text-blue-800';
      case 'OFFLINE': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-green-100 text-green-800';
      case 'HYBRID': return 'bg-purple-100 text-purple-800';
      case 'Hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Safe access for array fields
  const deliveryModes = course.newDeliveryModes && course.newDeliveryModes.length > 0
    ? course.newDeliveryModes
    : [course.deliveryMode];

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        {/* List View Implementation - Simplified for brevity, follows same logic */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1`}>
                <Building2 className="w-3 h-3" /> {course.industry || 'General'}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(course.category)}`}>
                {course.category.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
            {/* ... rest of list view ... */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Course Image */}
      <div className="relative h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
        {course.imageUrl || course.image ? (
          <img src={course.imageUrl || course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <BookOpen className="w-10 h-10 text-gray-400" />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span className={`px-2 py-1 rounded-md text-xs font-medium shadow-sm backdrop-blur-sm ${getCategoryColor(course.category)}`}>
            {course.category.replace('_', ' ')}
          </span>
          {course.industry && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {course.industry}
            </span>
          )}
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {course.isPopular && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-500 text-white shadow-sm">
              Popular
            </span>
          )}
          {course.isNew && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-500 text-white shadow-sm">
              New
            </span>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] text-balance">{course.title || course.name}</h3>

        {/* Course Meta */}
        <div className="space-y-3 mb-4">
          {/* Level & Duration */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatDuration(course.durationHours || course.duration)}</span>
            </div>
            <div className={`px-2 py-1 rounded ${getLevelColor(course.targetLevel || course.audienceLevel)}`}>
              {course.targetLevel || course.audienceLevel?.replace('_', ' ')}
            </div>
          </div>

          {/* Delivery Modes */}
          <div className="flex flex-wrap gap-1">
            {deliveryModes.map((mode, idx) => (
              <span key={idx} className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 ${getDeliveryModeColor(mode)}`}>
                {getDeliveryModeIcon(mode)} {mode}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-lg font-bold text-navy-700">
              {formatPrice(course.price)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="font-medium text-gray-700">{course.rating || 'New'}</span>
              <span>({course.enrolledCount || 0})</span>
            </div>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="px-3 py-1.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 text-sm font-medium transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
