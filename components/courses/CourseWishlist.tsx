'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, X, Share2, Eye, Star, Clock, Users, DollarSign,
  ChevronRight, Filter, Search, Grid, List, Trash2,
  Download, Bell
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
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
  imageUrl?: string;
  slug: string;
}

interface CourseWishlistProps {
  courses?: Course[];
  onCourseAction?: (action: string, courseId: string) => void;
}

export default function CourseWishlist({ courses: initialCourses = [], onCourseAction }: CourseWishlistProps) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'duration'>('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNotifications, setShowNotifications] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('courseWishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('courseWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (courseId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      
      // Trigger callback if provided
      if (onCourseAction) {
        onCourseAction(
          prev.includes(courseId) ? 'removed' : 'added',
          courseId
        );
      }
      
      return newWishlist;
    });
  };

  const isInWishlist = (courseId: string) => wishlist.includes(courseId);

  const filteredAndSortedCourses = initialCourses
    .filter(course => isInWishlist(course.id))
    .filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.skillTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

  const categories = [...new Set(initialCourses.map(course => course.category))];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const shareWishlist = () => {
    const wishlistCourses = initialCourses.filter(course => isInWishlist(course.id));
    const shareText = wishlistCourses.map(course => 
      `${course.name} - ${formatPrice(course.price)}\n${window.location.origin}/courses/${course.slug}`
    ).join('\n\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My Course Wishlist',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // Show toast notification
      alert('Wishlist copied to clipboard!');
    }
  };

  const clearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlist([]);
      if (onCourseAction) {
        onCourseAction('cleared', 'all');
      }
    }
  };

  const exportWishlist = () => {
    const wishlistCourses = initialCourses.filter(course => isInWishlist(course.id));
    const csvContent = [
      ['Course Name', 'Category', 'Price', 'Duration', 'Rating', 'URL'],
      ...wishlistCourses.map(course => [
        course.name,
        course.category,
        course.price,
        `${course.duration} weeks`,
        course.rating,
        `${window.location.origin}/courses/${course.slug}`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-wishlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (filteredAndSortedCourses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-sm p-12 max-w-md mx-auto">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {wishlist.length === 0 ? 'Your Wishlist is Empty' : 'No Courses Found'}
              </h2>
              <p className="text-gray-600 mb-8">
                {wishlist.length === 0 
                  ? 'Start adding courses to your wishlist to keep track of programs you\'re interested in.'
                  : 'Try adjusting your search or filters to find courses in your wishlist.'
                }
              </p>
              <a
                href="/courses"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Search className="w-5 h-5" />
                Browse Courses
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                My Wishlist
                <span className="bg-red-100 text-red-800 text-lg px-3 py-1 rounded-full font-medium">
                  {wishlist.length}
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'course' : 'courses'} saved
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={shareWishlist}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share Wishlist"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={exportWishlist}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Export to CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={clearWishlist}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Wishlist"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search wishlist courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="duration">Sort by Duration</option>
            </select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${sortBy}-${filterCategory}-${searchTerm}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAndSortedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={
                  viewMode === 'grid'
                    ? 'bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow'
                    : 'bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow'
                }
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="relative">
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={course.imageUrl || '/images/courses/default.jpg'}
                          alt={course.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <button
                        onClick={() => toggleWishlist(course.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
                        title={isInWishlist(course.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isInWishlist(course.id)
                              ? 'text-red-500 fill-current'
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        />
                      </button>

                      {course.isPopular && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.shortDescription}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{course.rating || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}w</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolledCount}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(course.price)}</span>
                        <a
                          href={`/courses/${course.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  /* List View */
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={course.imageUrl || '/images/courses/default.jpg'}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{course.shortDescription}</p>
                        </div>
                        
                        <button
                          onClick={() => toggleWishlist(course.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={isInWishlist(course.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              isInWishlist(course.id)
                                ? 'text-red-500 fill-current'
                                : 'text-gray-600 hover:text-red-500'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{course.rating || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration} weeks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolledCount} students</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatPrice(course.price)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <a
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Wishlist Updated</span>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Your wishlist has been updated with {filteredAndSortedCourses.length} courses.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
