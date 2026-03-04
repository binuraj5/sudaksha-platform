'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Clock, Users, Star, BookOpen, 
  DollarSign, TrendingUp, Award, Target, ChevronRight
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
  status: string;
  instructor: string;
  industry: string;
  targetLevel: string;
  courseType: string;
  deliveryMode: string;
  isPopular: boolean;
  isNew: boolean;
  hasPlacementSupport: boolean;
  hasEMI: boolean;
  imageUrl: string;
  slug: string;
  shortDescription: string;
}

interface CoursesPageClientProps {
  initialCourses: Course[];
}

export default function CoursesPageClient({ initialCourses }: CoursesPageClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter courses based on search and filters
  useEffect(() => {
    let filtered = courses.filter(course => course.status === 'PUBLISHED');

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => 
        course.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => 
        course.targetLevel?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    // Price filter
    if (selectedPrice !== 'all') {
      switch (selectedPrice) {
        case 'free':
          filtered = filtered.filter(course => course.price === 0);
          break;
        case 'low':
          filtered = filtered.filter(course => course.price > 0 && course.price <= 25000);
          break;
        case 'medium':
          filtered = filtered.filter(course => course.price > 25000 && course.price <= 50000);
          break;
        case 'high':
          filtered = filtered.filter(course => course.price > 50000);
          break;
      }
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedLevel, selectedPrice]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const categories = [...new Set(courses.map(c => c.category?.replace('_', ' ') || 'Other'))];
  const levels = [...new Set(courses.map(c => c.targetLevel || 'Other'))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Your Perfect Course
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Transform your career with our industry-leading programs
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredCourses.length} Courses Available
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level.toLowerCase()}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="low">Under ₹25,000</option>
                  <option value="medium">₹25,000 - ₹50,000</option>
                  <option value="high">Above ₹50,000</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={course.imageUrl || '/images/courses/default.jpg'}
                    alt={course.name}
                    className="w-full h-48 object-cover"
                  />
                  {course.isPopular && (
                    <span className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                      Popular
                    </span>
                  )}
                  {course.isNew && (
                    <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                      New
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {course.category}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration} weeks
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrolledCount} students
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                      {course.hasEMI && (
                        <span className="text-xs text-green-600 ml-2">EMI Available</span>
                      )}
                    </div>
                    <a
                      href={`/courses/${course.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
