'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilters } from '@/hooks/useFilters';
import {
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Building2,
  TrendingUp,
  Users,
  GraduationCap,
  DollarSign,
  Star,
  Award,
  CreditCard,
  Clock,
  Monitor,
  MapPin,
  UserCheck,
  Filter,
  RotateCcw
} from 'lucide-react';
import { CategoryType, TargetLevel, BatchMode, CourseType } from '@/types/course';

interface CourseFiltersProps {
  activeTab: 'courses' | 'finishing-school';
  onClose: () => void;
  isMobile?: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any> | string;
}

interface DynamicFilters {
  categories?: FilterOption[];
  industries?: FilterOption[];
  targetLevels?: FilterOption[];
  courseTypes?: FilterOption[];
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  hasActiveFilters?: boolean;
}

const FilterSection = ({ title, icon, children, isExpanded, onToggle, hasActiveFilters }: FilterSectionProps) => (
  <div className="border-b border-slate-200 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${hasActiveFilters ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'} group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors`}>
          {icon}
        </div>
        <span className="font-medium text-slate-900">{title}</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
        )}
      </div>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-5 h-5 text-slate-500" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const CourseFilters = ({ activeTab, onClose, isMobile = false }: CourseFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [industrySearch, setIndustrySearch] = useState('');
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilters>({});
  const [loadingFilters, setLoadingFilters] = useState(true);
  const { filters, updateFilters, clearAllFilters, hasActiveFilters } = useFilters();

  // Fetch dynamic filter options
  useEffect(() => {
    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const response = await fetch(`/api/filters?activeTab=${activeTab}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDynamicFilters(data.filters);
          }
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, [activeTab]);

  // Debounced filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger API call with current filters
      console.log('Applying filters:', filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCategoryTypeChange = (categoryType: CategoryType | undefined) => {
    updateFilters({ categoryType });
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    const updatedIndustries = checked
      ? [...filters.industries, industry]
      : filters.industries.filter(i => i !== industry);
    updateFilters({ industries: updatedIndustries });
  };

  const handleTargetLevelChange = (level: TargetLevel, checked: boolean) => {
    const updatedLevels = checked
      ? [...filters.targetLevels, level]
      : filters.targetLevels.filter(l => l !== level);
    updateFilters({ targetLevels: updatedLevels });
  };

  const handleCourseTypeChange = (type: CourseType, checked: boolean) => {
    const updatedTypes = checked
      ? [...filters.courseTypes, type]
      : filters.courseTypes.filter(t => t !== type);
    updateFilters({ courseTypes: updatedTypes });
  };

  const handleDeliveryModeChange = (mode: BatchMode, checked: boolean) => {
    const updatedModes = checked
      ? [...filters.deliveryModes, mode]
      : filters.deliveryModes.filter(m => m !== mode);
    updateFilters({ deliveryModes: updatedModes });
  };

  // Static course types data
  const courseTypes: FilterOption[] = [
    { value: 'TECHNOLOGY', label: 'Technology', icon: Monitor },
    { value: 'IT', label: 'IT', icon: Monitor },
    { value: 'FUNCTIONAL', label: 'Functional', icon: Users },
    { value: 'PROCESS', label: 'Process', icon: TrendingUp },
    { value: 'BEHAVIORAL', label: 'Behavioral', icon: UserCheck },
    { value: 'PERSONAL', label: 'Personal', icon: Award },
  ];

  // Dynamic industry data
  const allIndustries = dynamicFilters.industries || [];
  const topIndustries = allIndustries.slice(0, 5); // Show top 5 as "popular"
  const otherIndustries = allIndustries.slice(5);

  const filteredIndustries = useMemo(() => {
    if (!industrySearch) return { top: topIndustries, others: otherIndustries };
    const searchTerm = industrySearch.toLowerCase();
    return {
      top: topIndustries.filter(industry => industry.label.toLowerCase().includes(searchTerm)),
      others: otherIndustries.filter(industry => industry.label.toLowerCase().includes(searchTerm))
    };
  }, [industrySearch]);

  const courseLevels = dynamicFilters.targetLevels?.map(level => ({
    value: level.value as TargetLevel,
    label: level.label,
    icon: level.value === 'JUNIOR' ? '👶' :
          level.value === 'MIDDLE' ? '👔' :
          level.value === 'SENIOR' ? '🏆' :
          level.value === 'MANAGEMENT' ? '👑' : '🎯',
    description: level.value === 'JUNIOR' ? 'Entry-level' :
                level.value === 'MIDDLE' ? 'Mid-level' :
                level.value === 'SENIOR' ? 'Senior-level' :
                level.value === 'MANAGEMENT' ? 'Team leads' : 'C-level'
  })) || [];

  const deliveryModes = [
    { value: 'ONLINE' as BatchMode, label: 'Live Online', icon: Monitor, description: 'Virtual training' },
    { value: 'OFFLINE' as BatchMode, label: 'Offline', icon: MapPin, description: 'In-person' },
    { value: 'HYBRID' as BatchMode, label: 'Hybrid', icon: UserCheck, description: 'Mixed format' }
  ];

  const specialFeatures = [
    { key: 'isPopular', label: 'Most Popular', icon: Award },
    { key: 'isNew', label: 'New Programs', icon: Star },
    { key: 'hasPlacementSupport', label: 'Placement Support', icon: UserCheck },
    { key: 'hasEMI', label: 'EMI Available', icon: CreditCard }
  ];

  const containerClasses = isMobile
    ? "fixed inset-0 z-50 bg-white"
    : "w-80 h-full bg-white border-r border-slate-200 shadow-lg";

  return (
    <motion.div
      initial={isMobile ? { x: "100%" } : { x: 0 }}
      animate={{ x: 0 }}
      exit={isMobile ? { x: "100%" } : { x: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className={containerClasses}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <p className="text-sm text-slate-600">
              {activeTab === 'courses' ? 'Professional Programs' : 'Finishing School'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Domain Toggle */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Monitor className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-900">Domain</span>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => handleCategoryTypeChange(CategoryType.IT)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              filters.categoryType === CategoryType.IT
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            IT
          </button>
          <button
            onClick={() => handleCategoryTypeChange(CategoryType.NON_IT)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              filters.categoryType === CategoryType.NON_IT
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Non-IT
          </button>
          <button
            onClick={() => handleCategoryTypeChange(undefined)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              !filters.categoryType
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Industry Section */}
        <FilterSection
          title="Industry Focus"
          icon={<Building2 className="w-5 h-5" />}
          isExpanded={expandedSections.includes('industry')}
          onToggle={() => toggleSection('industry')}
          hasActiveFilters={filters.industries.length > 0}
        >
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search industries..."
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Top Industries */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Popular</div>
              {filteredIndustries.top.map(industry => {
                const Icon = industry.icon || Building2;
                const displayIcon = typeof industry.icon === 'string' ? industry.icon : null;
                return (
                  <label key={industry.value} className="flex items-center p-2 hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.industries.includes(industry.value)}
                      onChange={(e) => handleIndustryChange(industry.value, (e.target as HTMLInputElement).checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    {displayIcon ? (
                      <span className="ml-3 text-slate-500">{displayIcon}</span>
                    ) : (
                      <Icon className="w-4 h-4 ml-3 text-slate-500" />
                    )}
                    <span className="ml-2 text-sm text-slate-700">{industry.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Other Industries */}
            {filteredIndustries.others.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">All Industries</div>
                {filteredIndustries.others.map(industry => {
                  const Icon = industry.icon || Building2;
                  const displayIcon = typeof industry.icon === 'string' ? industry.icon : null;
                  return (
                    <label key={industry.value} className="flex items-center p-2 hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.industries.includes(industry.value)}
                        onChange={(e) => handleIndustryChange(industry.value, (e.target as HTMLInputElement).checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      {displayIcon ? (
                        <span className="ml-3 text-slate-500">{displayIcon}</span>
                      ) : (
                        <Icon className="w-4 h-4 ml-3 text-slate-500" />
                      )}
                      <span className="ml-2 text-sm text-slate-700">{industry.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </FilterSection>

        {/* Career Level Section */}
        <FilterSection
          title="Career Level"
          icon={<TrendingUp className="w-5 h-5" />}
          isExpanded={expandedSections.includes('level')}
          onToggle={() => toggleSection('level')}
          hasActiveFilters={filters.targetLevels.length > 0}
        >
          <div className="grid grid-cols-2 gap-2">
            {courseLevels.map(level => (
              <button
                key={level.value}
                onClick={() => handleTargetLevelChange(level.value, !filters.targetLevels.includes(level.value))}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  filters.targetLevels.includes(level.value)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-lg mb-1">{level.icon}</div>
                <div className="text-xs font-medium">{level.label}</div>
                <div className="text-xs text-slate-500">{level.description}</div>
              </button>
            ))}
          </div>
        </FilterSection>

      {/* Course Type (for Professional Courses only) */}
      {activeTab === 'courses' && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
          <button
            onClick={() => toggleSection('course-type')}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Course Type</h3>
            </div>
            {expandedSections.includes('course-type') ?
              <ChevronUp className="w-4 h-4 text-gray-600" /> :
              <ChevronDown className="w-4 h-4 text-gray-600" />
            }
          </button>

          {expandedSections.includes('course-type') && (
            <div className="space-y-3">
              {courseTypes.map(type => (
                <label key={type.value} className="flex items-start p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.courseTypes.includes(type.value as CourseType)}
                    onChange={(e) => handleCourseTypeChange(type.value as CourseType, e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{type.label}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Delivery Mode Section */}
        <FilterSection
          title="Delivery Mode"
          icon={<Monitor className="w-5 h-5" />}
          isExpanded={expandedSections.includes('mode')}
          onToggle={() => toggleSection('mode')}
          hasActiveFilters={filters.deliveryModes.length > 0}
        >
          <div className="space-y-2">
            {deliveryModes.map(mode => {
              const Icon = mode.icon;
              return (
                <label key={mode.value} className="flex items-center p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.deliveryModes.includes(mode.value)}
                    onChange={(e) => handleDeliveryModeChange(mode.value, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <Icon className="w-5 h-5 ml-3 text-slate-500" />
                  <div className="ml-3">
                    <div className="font-medium text-slate-900">{mode.label}</div>
                    <div className="text-sm text-slate-600">{mode.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </FilterSection>

        {/* Price Range Section */}
        <FilterSection
          title="Price Range"
          icon={<DollarSign className="w-5 h-5" />}
          isExpanded={expandedSections.includes('price')}
          onToggle={() => toggleSection('price')}
          hasActiveFilters={filters.price.min > 0 || filters.price.max < 100000}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.price.min}
                  onChange={(e) => updateFilters({ price: { ...filters.price, min: parseInt(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.price.max}
                  onChange={(e) => updateFilters({ price: { ...filters.price, max: parseInt(e.target.value) || 100000 } })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Rating Section */}
        <FilterSection
          title="Minimum Rating"
          icon={<Star className="w-5 h-5" />}
          isExpanded={expandedSections.includes('rating')}
          onToggle={() => toggleSection('rating')}
          hasActiveFilters={filters.rating > 0}
        >
          <div className="space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => updateFilters({ rating })}
                  className="w-4 h-4 text-yellow-600 border-slate-300 focus:ring-yellow-500"
                />
                <span className="ml-2 text-sm text-slate-700">
                  {rating}+ {'⭐'.repeat(rating)}
                </span>
              </label>
            ))}
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === 0}
                onChange={() => updateFilters({ rating: 0 })}
                className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
              />
              <span className="ml-2 text-sm text-slate-700">All Ratings</span>
            </label>
          </div>
        </FilterSection>

        {/* Special Features Section */}
        <FilterSection
          title="Special Features"
          icon={<Award className="w-5 h-5" />}
          isExpanded={expandedSections.includes('features')}
          onToggle={() => toggleSection('features')}
          hasActiveFilters={specialFeatures.some(feature => filters[feature.key as keyof typeof filters] === true)}
        >
          <div className="flex flex-wrap gap-2">
            {specialFeatures.map(feature => {
              const Icon = feature.icon;
              const isActive = filters[feature.key as keyof typeof filters] === true;
              return (
                <button
                  key={feature.key}
                  onClick={() => updateFilters({ [feature.key]: !isActive })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full border-2 transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </motion.div>
  );
};

export default CourseFilters;
