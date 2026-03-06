'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Filter, ChevronDown,
  Clock, Users, BookOpen, Award,
  Star, TrendingUp, Sparkles, CreditCard
} from 'lucide-react';

interface Filters {
  domain: 'IT' | 'Non-IT' | 'All';
  industries: string[];
  levels: string[];
  types: string[];
  modes: ('Live Online' | 'Offline' | 'Hybrid')[];
  features: string[];
  priceRange: [number, number];
  sort: 'popular' | 'newest' | 'price' | 'rating';
}

interface NewFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: any) => void;
  onClearFilters: () => void;
  className?: string;
  // Dynamic Options
  availableIndustries?: string[];
  availableCourseTypes?: string[];
  availableLevels?: string[];
}

const specialFeatures = [
  { id: 'popular', label: 'Most Popular', icon: Star },
  { id: 'new', label: 'New', icon: Sparkles },
  { id: 'placement', label: 'Placement', icon: Users },
  { id: 'emi', label: 'EMI', icon: CreditCard }
];

// Toggle Switch Component
const ToggleSwitch = ({
  active,
  onClick,
  children,
  size = 'default',
  color = 'blue'
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  color?: 'blue' | 'green' | 'gray';
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    default: 'w-11 h-11 text-sm',
    large: 'w-14 h-14 text-base'
  };

  const colorClasses = {
    blue: active ? 'bg-blue-500 text-white ring-2 ring-blue-500/50 shadow-blue-500/50' : 'bg-gray-100 text-gray-600',
    green: active ? 'bg-green-500 text-white ring-2 ring-green-500/50 shadow-green-500/50' : 'bg-gray-100 text-gray-600',
    gray: active ? 'bg-gray-500 text-white ring-2 ring-gray-500/50 shadow-gray-500/50' : 'bg-gray-100 text-gray-600'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        rounded-full flex items-center justify-center font-medium
        backdrop-blur-md transition-all duration-200
        hover:scale-105 active:scale-95
        shadow-lg hover:shadow-xl
        border border-white/20
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// Filter Section Component
const FilterSection = ({
  title,
  icon,
  children,
  defaultExpanded = true
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-b-lg border border-t-0 border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function NewFilters({
  filters,
  onFilterChange,
  onClearFilters,
  className = '',
  availableIndustries = [],
  availableCourseTypes = [],
  availableLevels = ['Beginner', 'Intermediate', 'Advanced']
}: NewFiltersProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFilterChange = useCallback(async (key: keyof Filters, value: any) => {
    setIsUpdating(true);
    onFilterChange(key, value);
    setTimeout(() => setIsUpdating(false), 100);
  }, [onFilterChange]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.domain !== 'All' ||
      filters.industries.length > 0 ||
      filters.levels.length > 0 ||
      filters.types.length > 0 ||
      filters.modes.length > 0 ||
      filters.features.length > 0
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.domain !== 'All') count++;
    count += filters.industries.length;
    count += filters.levels.length;
    count += filters.types.length;
    count += filters.modes.length;
    count += filters.features.length;
    return count;
  }, [filters]);

  return (
    <div className={`bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 relative ${className} ${isUpdating ? 'pointer-events-none opacity-75' : ''}`}>
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Domain Toggles */}
        <FilterSection title="🏷️ DOMAIN" icon={<BookOpen className="w-4 h-4" />}>
          <div className="flex gap-3 justify-center">
            <ToggleSwitch
              active={filters.domain === 'IT'}
              onClick={() => handleFilterChange('domain', 'IT')}
              color="blue"
              size="large"
            >
              IT
            </ToggleSwitch>
            <ToggleSwitch
              active={filters.domain === 'Non-IT'}
              onClick={() => handleFilterChange('domain', 'Non-IT')}
              color="green"
              size="large"
            >
              Non-IT
            </ToggleSwitch>
            <ToggleSwitch
              active={filters.domain === 'All'}
              onClick={() => handleFilterChange('domain', 'All')}
              color="gray"
              size="large"
            >
              All
            </ToggleSwitch>
          </div>
        </FilterSection>

        {/* Industry Focus Grid */}
        <FilterSection title="🏭 INDUSTRY FOCUS" icon={<Users className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-2">
            {availableIndustries.map(industry => (
              <ToggleSwitch
                key={industry}
                active={filters.industries.includes(industry)}
                onClick={() => {
                  const newIndustries = filters.industries.includes(industry)
                    ? filters.industries.filter(i => i !== industry)
                    : [...filters.industries, industry];
                  handleFilterChange('industries', newIndustries);
                }}
                size="small"
              >
                {industry}
              </ToggleSwitch>
            ))}
          </div>
        </FilterSection>

        {/* Career Level */}
        <FilterSection title="🎯 CAREER LEVEL" icon={<Award className="w-4 h-4" />}>
          <div className="flex flex-col gap-3">
            {availableLevels.map(level => (
              <ToggleSwitch
                key={level}
                active={filters.levels.includes(level)}
                onClick={() => {
                  const newLevels = filters.levels.includes(level)
                    ? filters.levels.filter(l => l !== level)
                    : [...filters.levels, level];
                  handleFilterChange('levels', newLevels);
                }}
                size="default"
              >
                {level}
              </ToggleSwitch>
            ))}
          </div>
        </FilterSection>

        {/* Course Type Grid */}
        <FilterSection title="🔧 COURSE TYPE" icon={<BookOpen className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-2">
            {availableCourseTypes.map(type => (
              <ToggleSwitch
                key={type}
                active={filters.types.includes(type)}
                onClick={() => {
                  const newTypes = filters.types.includes(type)
                    ? filters.types.filter(t => t !== type)
                    : [...filters.types, type];
                  handleFilterChange('types', newTypes);
                }}
                size="small"
              >
                {type}
              </ToggleSwitch>
            ))}
          </div>
        </FilterSection>

        {/* Delivery Mode */}
        <FilterSection title="📡 DELIVERY MODE" icon={<Clock className="w-4 h-4" />}>
          <div className="flex gap-3 justify-center">
            {(['Live Online', 'Offline', 'Hybrid'] as const).map(mode => (
              <ToggleSwitch
                key={mode}
                active={filters.modes.includes(mode)}
                onClick={() => {
                  const newModes = filters.modes.includes(mode)
                    ? filters.modes.filter(m => m !== mode)
                    : [...filters.modes, mode];
                  handleFilterChange('modes', newModes);
                }}
                size="default"
              >
                {mode}
              </ToggleSwitch>
            ))}
          </div>
        </FilterSection>

        {/* Special Features */}
        <FilterSection title="⭐ SPECIAL FEATURES" icon={<Star className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-3">
            {specialFeatures.map(feature => {
              const Icon = feature.icon;
              return (
                <ToggleSwitch
                  key={feature.id}
                  active={filters.features.includes(feature.id)}
                  onClick={() => {
                    const newFeatures = filters.features.includes(feature.id)
                      ? filters.features.filter(f => f !== feature.id)
                      : [...filters.features, feature.id];
                    handleFilterChange('features', newFeatures);
                  }}
                  size="default"
                >
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    <span className="text-xs">{feature.label}</span>
                  </div>
                </ToggleSwitch>
              );
            })}
          </div>
        </FilterSection>

        {/* Sort Dropdown */}
        <FilterSection title="🔄 SORT" icon={<TrendingUp className="w-4 h-4" />}>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </FilterSection>
      </div>

      {/* Apply Button */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-b-2xl border-t border-gray-200/50">
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
