'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Star, Clock, Users, DollarSign, 
  Award, Target, CheckCircle, BookOpen, Globe,
  ChevronRight, Heart, Share2, ArrowUpDown
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  rating: number;
  enrolledCount: number;
  industry: string;
  targetLevel: string;
  courseType: string;
  deliveryMode: string;
  isPopular: boolean;
  isNew: boolean;
  hasPlacementSupport: boolean;
  hasEMI: boolean;
  skillTags: string[];
  learningObjectives: string[];
  instructor?: {
    name: string;
    rating: number;
  };
  imageUrl?: string;
  slug: string;
}

interface CourseComparisonProps {
  courses: Course[];
  onRemoveCourse?: (courseId: string) => void;
  onAddCourse?: () => void;
}

export default function CourseComparison({ courses, onRemoveCourse, onAddCourse }: CourseComparisonProps) {
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>(['basic']);

  const toggleFeatureSection = (section: string) => {
    setExpandedFeatures(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getComparisonFeatures = () => [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: <BookOpen className="w-5 h-5" />,
      features: [
        { key: 'name', label: 'Course Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'industry', label: 'Industry', type: 'text' },
        { key: 'targetLevel', label: 'Difficulty Level', type: 'text' },
        { key: 'courseType', label: 'Course Type', type: 'text' },
        { key: 'deliveryMode', label: 'Delivery Mode', type: 'text' }
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing & Duration',
      icon: <DollarSign className="w-5 h-5" />,
      features: [
        { key: 'price', label: 'Price', type: 'price' },
        { key: 'duration', label: 'Duration (weeks)', type: 'number' },
        { key: 'hasEMI', label: 'EMI Available', type: 'boolean' }
      ]
    },
    {
      id: 'quality',
      title: 'Quality Metrics',
      icon: <Star className="w-5 h-5" />,
      features: [
        { key: 'rating', label: 'Rating', type: 'rating' },
        { key: 'enrolledCount', label: 'Students Enrolled', type: 'number' },
        { key: 'hasPlacementSupport', label: 'Placement Support', type: 'boolean' }
      ]
    },
    {
      id: 'features',
      title: 'Special Features',
      icon: <Award className="w-5 h-5" />,
      features: [
        { key: 'isPopular', label: 'Most Popular', type: 'boolean' },
        { key: 'isNew', label: 'New Course', type: 'boolean' },
        { key: 'skillTags', label: 'Skills Covered', type: 'array' }
      ]
    },
    {
      id: 'instructor',
      title: 'Instructor Information',
      icon: <Users className="w-5 h-5" />,
      features: [
        { key: 'instructor.name', label: 'Instructor Name', type: 'text' },
        { key: 'instructor.rating', label: 'Instructor Rating', type: 'rating' }
      ]
    }
  ];

  const renderFeatureValue = (course: Course, feature: any) => {
    const value = feature.key.split('.').reduce((obj: any, key: string) => obj?.[key], course);

    switch (feature.type) {
      case 'price':
        return formatPrice(value || 0);
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{value || 0}</span>
          </div>
        );
      case 'boolean':
        return value ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-gray-300" />
        );
      case 'array':
        return (
          <div className="flex flex-wrap gap-1">
            {(value || []).slice(0, 3).map((item: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {item}
              </span>
            ))}
            {(value || []).length > 3 && (
              <span className="text-gray-500 text-xs">+{(value || []).length - 3} more</span>
            )}
          </div>
        );
      case 'number':
        return value?.toLocaleString() || '0';
      default:
        return value || 'N/A';
    }
  };

  const getBestValue = (feature: any) => {
    const values = courses.map(course => {
      const value = feature.key.split('.').reduce((obj: any, key: string) => obj?.[key], course);
      return value;
    });

    if (feature.type === 'price') {
      const minPrice = Math.min(...values.filter(v => v !== undefined));
      return courses.findIndex(course => course.price === minPrice);
    }

    if (feature.type === 'rating') {
      const maxRating = Math.max(...values.filter(v => v !== undefined));
      return courses.findIndex(course => course.rating === maxRating);
    }

    if (feature.type === 'number' && feature.key !== 'price') {
      const maxValue = Math.max(...values.filter(v => v !== undefined));
      return courses.findIndex(course => {
        const value = feature.key.split('.').reduce((obj: any, key: string) => obj?.[key], course);
        return value === maxValue;
      });
    }

    return -1;
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="max-w-md mx-auto">
          <ArrowUpDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses to Compare</h3>
          <p className="text-gray-600 mb-6">Add courses to compare their features side by side</p>
          {onAddCourse && (
            <button
              onClick={onAddCourse}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Courses to Compare
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Course Comparison</h2>
            <p className="text-blue-100">Compare {courses.length} courses side by side</p>
          </div>
          <div className="flex gap-3">
            {onAddCourse && courses.length < 4 && (
              <button
                onClick={onAddCourse}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Course
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              {onRemoveCourse && (
                <button
                  onClick={() => onRemoveCourse(course.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
                >
                  <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                </button>
              )}
              
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img
                  src={course.imageUrl || '/images/courses/default.jpg'}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{course.rating || 0}</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{formatPrice(course.price)}</span>
              </div>
              
              <a
                href={`/courses/${course.slug}`}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-900 border border-gray-200">Feature</th>
                {courses.map((course) => (
                  <th key={course.id} className="text-center p-4 font-semibold text-gray-900 border border-gray-200 min-w-[150px]">
                    <div className="space-y-2">
                      <div className="font-medium line-clamp-2">{course.name}</div>
                      <div className="text-sm font-normal text-gray-600">{formatPrice(course.price)}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getComparisonFeatures().map((section) => (
                <AnimatePresence key={section.id}>
                  {expandedFeatures.includes(section.id) && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={courses.length + 1} className="p-4 font-semibold text-gray-900 border border-gray-200">
                          <button
                            onClick={() => toggleFeatureSection(section.id)}
                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                          >
                            {section.icon}
                            {section.title}
                          </button>
                        </td>
                      </tr>
                      {section.features.map((feature) => {
                        const bestIndex = getBestValue(feature);
                        return (
                          <tr key={feature.key} className="hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-700 border border-gray-200">
                              {feature.label}
                            </td>
                            {courses.map((course, courseIndex) => (
                              <td
                                key={course.id}
                                className={`p-4 text-center border border-gray-200 ${
                                  bestIndex === courseIndex ? 'bg-green-50' : ''
                                }`}
                              >
                                {renderFeatureValue(course, feature)}
                                {bestIndex === courseIndex && (
                                  <div className="text-xs text-green-600 font-medium mt-1">Best Value</div>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </>
                  )}
                </AnimatePresence>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpandedFeatures(expandedFeatures.length > 0 ? [] : getComparisonFeatures().map(f => f.id))}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            {expandedFeatures.length > 0 ? (
                <>
                  <X className="w-5 h-5" />
                  Collapse All Features
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Expand All Features
                </>
              )}
          </button>
        </div>
      </div>
    </div>
  );
}
