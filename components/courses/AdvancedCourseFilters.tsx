'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, ChevronUp, 
  DollarSign, Clock, Star, Users, MapPin,
  Award, BookOpen, Target, Globe, Briefcase
} from 'lucide-react';

interface AdvancedCourseFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}

const FILTER_OPTIONS = {
  categories: [
    { value: 'SOFTWARE_DEVELOPMENT', label: 'Software Development', icon: '💻' },
    { value: 'BUSINESS_ANALYSIS', label: 'Business Analysis', icon: '📊' },
    { value: 'DATA_SCIENCE', label: 'Data Science', icon: '📈' },
    { value: 'CLOUD_COMPUTING', label: 'Cloud Computing', icon: '☁️' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity', icon: '🔒' },
    { value: 'UI_UX_DESIGN', label: 'UI/UX Design', icon: '🎨' },
    { value: 'DIGITAL_MARKETING', label: 'Digital Marketing', icon: '📱' },
    { value: 'PROJECT_MANAGEMENT', label: 'Project Management', icon: '📋' }
  ],
  industries: [
    { value: 'Technology', label: 'Technology', icon: '💻' },
    { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Education', label: 'Education', icon: '📚' },
    { value: 'Retail', label: 'Retail', icon: '🛍️' },
    { value: 'Manufacturing', label: 'Manufacturing', icon: '🏭' },
    { value: 'Consulting', label: 'Consulting', icon: '💼' },
    { value: 'Sales', label: 'Sales', icon: '💵' }
  ],
  levels: [
    { value: 'BEGINNER', label: 'Beginner', icon: '🌱' },
    { value: 'INTERMEDIATE', label: 'Intermediate', icon: '🌿' },
    { value: 'ADVANCED', label: 'Advanced', icon: '🌳' },
    { value: 'EXPERT', label: 'Expert', icon: '🌲' }
  ],
  courseTypes: [
    { value: 'TECHNOLOGY', label: 'Technology', icon: '💻' },
    { value: 'FUNCTIONAL', label: 'Functional', icon: '📊' },
    { value: 'MANAGEMENT', label: 'Management', icon: '👥' },
    { value: 'DESIGN', label: 'Design', icon: '🎨' }
  ],
  deliveryModes: [
    { value: 'ONLINE', label: 'Online', icon: '🌐' },
    { value: 'OFFLINE', label: 'Offline', icon: '🏢' },
    { value: 'HYBRID', label: 'Hybrid', icon: '🔄' }
  ],
  priceRanges: [
    { value: '0-25000', label: 'Under ₹25,000', min: 0, max: 25000 },
    { value: '25000-50000', label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
    { value: '50000-75000', label: '₹50,000 - ₹75,000', min: 50000, max: 75000 },
    { value: '75000-100000', label: '₹75,000 - ₹1,00,000', min: 75000, max: 100000 },
    { value: '100000+', label: 'Above ₹1,00,000', min: 100000, max: 999999 }
  ],
  durations: [
    { value: '0-8', label: 'Under 8 weeks', min: 0, max: 8 },
    { value: '8-16', label: '8-16 weeks', min: 8, max: 16 },
    { value: '16-24', label: '16-24 weeks', min: 16, max: 24 },
    { value: '24+', label: 'Over 24 weeks', min: 24, max: 999 }
  ],
  ratings: [
    { value: '4.5', label: '4.5+ ⭐', min: 4.5 },
    { value: '4.0', label: '4.0+ ⭐', min: 4.0 },
    { value: '3.5', label: '3.5+ ⭐', min: 3.5 },
    { value: '3.0', label: '3.0+ ⭐', min: 3.0 }
  ]
};

export default function AdvancedCourseFilters({ onFiltersChange, initialFilters = {} }: AdvancedCourseFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories']);
  const [filters, setFilters] = useState({
    categories: initialFilters.categories || [],
    industries: initialFilters.industries || [],
    levels: initialFilters.levels || [],
    courseTypes: initialFilters.courseTypes || [],
    deliveryModes: initialFilters.deliveryModes || [],
    priceRange: initialFilters.priceRange || '',
    duration: initialFilters.duration || '',
    rating: initialFilters.rating || '',
    specialFeatures: {
      isPopular: initialFilters.isPopular || false,
      isNew: initialFilters.isNew || false,
      hasPlacementSupport: initialFilters.hasPlacementSupport || false,
      hasEMI: initialFilters.hasEMI || false
    }
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterType === 'specialFeatures') {
      newFilters.specialFeatures = { ...filters.specialFeatures, ...value };
    } else if (Array.isArray((newFilters as any)[filterType])) {
      const currentArray = (newFilters as any)[filterType] as string[];
      (newFilters as any)[filterType] = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
    } else {
      (newFilters as any)[filterType] = value;
    }
    
    setFilters(newFilters);
    onFiltersChange({ ...newFilters, search: searchTerm });
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      industries: [],
      levels: [],
      courseTypes: [],
      deliveryModes: [],
      priceRange: '',
      duration: '',
      rating: '',
      specialFeatures: {
        isPopular: false,
        isNew: false,
        hasPlacementSupport: false,
        hasEMI: false
      }
    });
    setSearchTerm('');
    onFiltersChange({ search: '' });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.industries.length;
    count += filters.levels.length;
    count += filters.courseTypes.length;
    count += filters.deliveryModes.length;
    count += filters.priceRange ? 1 : 0;
    count += filters.duration ? 1 : 0;
    count += filters.rating ? 1 : 0;
    count += Object.values(filters.specialFeatures).filter(Boolean).length;
    return count;
  };

  const FilterSection = ({ title, icon, sectionKey, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections.includes(sectionKey) ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      <AnimatePresence>
        {expandedSections.includes(sectionKey) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const CheckboxOption = ({ option, checked, onChange, icon }: any) => (
    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(option.value)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />
      <span className="text-lg">{icon}</span>
      <span className="text-gray-700">{option.label}</span>
    </label>
  );

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses, skills, or topics..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFiltersChange({ ...filters, search: e.target.value });
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Categories */}
        <FilterSection
          title="Categories"
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          sectionKey="categories"
        >
          <div className="grid grid-cols-1 gap-2">
            {FILTER_OPTIONS.categories.map((category) => (
              <CheckboxOption
                key={category.value}
                option={category}
                checked={filters.categories.includes(category.value)}
                onChange={(value: any) => handleFilterChange('categories', value)}
                icon={category.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Industries */}
        <FilterSection
          title="Industries"
          icon={<Briefcase className="w-5 h-5 text-green-600" />}
          sectionKey="industries"
        >
          <div className="grid grid-cols-1 gap-2">
            {FILTER_OPTIONS.industries.map((industry) => (
              <CheckboxOption
                key={industry.value}
                option={industry}
                checked={filters.industries.includes(industry.value)}
                onChange={(value: any) => handleFilterChange('industries', value)}
                icon={industry.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Career Level */}
        <FilterSection
          title="Career Level"
          icon={<Target className="w-5 h-5 text-purple-600" />}
          sectionKey="levels"
        >
          <div className="grid grid-cols-2 gap-2">
            {FILTER_OPTIONS.levels.map((level) => (
              <CheckboxOption
                key={level.value}
                option={level}
                checked={filters.levels.includes(level.value)}
                onChange={(value: any) => handleFilterChange('levels', value)}
                icon={level.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Course Type */}
        <FilterSection
          title="Course Type"
          icon={<Award className="w-5 h-5 text-orange-600" />}
          sectionKey="courseTypes"
        >
          <div className="grid grid-cols-2 gap-2">
            {FILTER_OPTIONS.courseTypes.map((type) => (
              <CheckboxOption
                key={type.value}
                option={type}
                checked={filters.courseTypes.includes(type.value)}
                onChange={(value: any) => handleFilterChange('courseTypes', value)}
                icon={type.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Delivery Mode */}
        <FilterSection
          title="Delivery Mode"
          icon={<Globe className="w-5 h-5 text-cyan-600" />}
          sectionKey="deliveryModes"
        >
          <div className="grid grid-cols-1 gap-2">
            {FILTER_OPTIONS.deliveryModes.map((mode) => (
              <CheckboxOption
                key={mode.value}
                option={mode}
                checked={filters.deliveryModes.includes(mode.value)}
                onChange={(value: any) => handleFilterChange('deliveryModes', value)}
                icon={mode.icon}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          sectionKey="price"
        >
          <div className="grid grid-cols-1 gap-2">
            {FILTER_OPTIONS.priceRanges.map((range) => (
              <label key={range.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  checked={filters.priceRange === range.value}
                  onChange={() => handleFilterChange('priceRange', range.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection
          title="Duration"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          sectionKey="duration"
        >
          <div className="grid grid-cols-1 gap-2">
            {FILTER_OPTIONS.durations.map((duration) => (
              <label key={duration.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="duration"
                  value={duration.value}
                  checked={filters.duration === duration.value}
                  onChange={() => handleFilterChange('duration', duration.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{duration.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection
          title="Minimum Rating"
          icon={<Star className="w-5 h-5 text-yellow-600" />}
          sectionKey="rating"
        >
          <div className="grid grid-cols-2 gap-2">
            {FILTER_OPTIONS.ratings.map((rating) => (
              <label key={rating.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={rating.value}
                  checked={filters.rating === rating.value}
                  onChange={() => handleFilterChange('rating', rating.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{rating.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Special Features */}
        <FilterSection
          title="Special Features"
          icon={<Users className="w-5 h-5 text-purple-600" />}
          sectionKey="specialFeatures"
        >
          <div className="space-y-2">
            {[
              { key: 'isPopular', label: 'Most Popular', icon: '🔥' },
              { key: 'isNew', label: 'New Courses', icon: '✨' },
              { key: 'hasPlacementSupport', label: 'Placement Support', icon: '🎯' },
              { key: 'hasEMI', label: 'EMI Available', icon: '💳' }
            ].map((feature) => (
              <label key={feature.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.specialFeatures[feature.key as keyof typeof filters.specialFeatures]}
                  onChange={() => handleFilterChange('specialFeatures', { [feature.key]: !filters.specialFeatures[feature.key as keyof typeof filters.specialFeatures] })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-lg">{feature.icon}</span>
                <span className="text-gray-700">{feature.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
