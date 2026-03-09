'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

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
  availableIndustries?: string[];
  availableCourseTypes?: string[];
  availableLevels?: string[];
}

function SectionHeader({
  title,
  expanded,
  onToggle,
  count,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 text-left"
    >
      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {title}
        {count ? (
          <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-medium">{count}</span>
        ) : null}
      </span>
      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  );
}

function CheckRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <label
      onClick={onClick}
      className="flex items-center gap-2 py-1 cursor-pointer group"
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>{label}</span>
    </label>
  );
}

export function NewFilters({
  filters,
  onFilterChange,
  onClearFilters,
  className = '',
  availableIndustries = [],
  availableCourseTypes = [],
  availableLevels = ['Beginner', 'Intermediate', 'Advanced'],
}: NewFiltersProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['domain', 'level', 'mode'])
  );

  const toggle = useCallback((section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  }, []);

  const toggleArray = useCallback(
    (key: keyof Filters, value: string) => {
      const current = filters[key] as string[];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      onFilterChange(key, next);
    },
    [filters, onFilterChange]
  );

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.domain !== 'All') n++;
    n += filters.industries.length + filters.levels.length + filters.types.length + filters.modes.length + filters.features.length;
    return n;
  }, [filters]);

  const isOpen = (s: string) => openSections.has(s);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-800 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onClearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="px-4 divide-y divide-gray-100">
        {/* Domain */}
        <div className="py-3">
          <SectionHeader title="Domain" expanded={isOpen('domain')} onToggle={() => toggle('domain')} count={filters.domain !== 'All' ? 1 : 0} />
          {isOpen('domain') && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {(['All', 'IT', 'Non-IT'] as const).map((d) => (
                <Pill key={d} label={d} active={filters.domain === d} onClick={() => onFilterChange('domain', d)} />
              ))}
            </div>
          )}
        </div>

        {/* Career Level */}
        <div className="py-3">
          <SectionHeader title="Career Level" expanded={isOpen('level')} onToggle={() => toggle('level')} count={filters.levels.length || undefined} />
          {isOpen('level') && (
            <div className="mt-1 space-y-0.5">
              {availableLevels.map((lvl) => (
                <CheckRow key={lvl} label={lvl} checked={filters.levels.includes(lvl)} onClick={() => toggleArray('levels', lvl)} />
              ))}
            </div>
          )}
        </div>

        {/* Delivery Mode */}
        <div className="py-3">
          <SectionHeader title="Delivery Mode" expanded={isOpen('mode')} onToggle={() => toggle('mode')} count={filters.modes.length || undefined} />
          {isOpen('mode') && (
            <div className="mt-1 space-y-0.5">
              {(['Live Online', 'Offline', 'Hybrid'] as const).map((m) => (
                <CheckRow key={m} label={m} checked={filters.modes.includes(m)} onClick={() => toggleArray('modes', m)} />
              ))}
            </div>
          )}
        </div>

        {/* Industry Focus */}
        {availableIndustries.length > 0 && (
          <div className="py-3">
            <SectionHeader title="Industry" expanded={isOpen('industry')} onToggle={() => toggle('industry')} count={filters.industries.length || undefined} />
            {isOpen('industry') && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {availableIndustries.map((ind) => (
                  <Pill key={ind} label={ind} active={filters.industries.includes(ind)} onClick={() => toggleArray('industries', ind)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course Type */}
        {availableCourseTypes.length > 0 && (
          <div className="py-3">
            <SectionHeader title="Course Type" expanded={isOpen('type')} onToggle={() => toggle('type')} count={filters.types.length || undefined} />
            {isOpen('type') && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {availableCourseTypes.map((t) => (
                  <Pill key={t} label={t} active={filters.types.includes(t)} onClick={() => toggleArray('types', t)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sort */}
        <div className="py-3">
          <SectionHeader title="Sort By" expanded={isOpen('sort')} onToggle={() => toggle('sort')} />
          {isOpen('sort') && (
            <div className="mt-1 space-y-0.5">
              {[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest First' },
                { value: 'rating', label: 'Highest Rated' },
              ].map((opt) => (
                <CheckRow
                  key={opt.value}
                  label={opt.label}
                  checked={filters.sort === opt.value}
                  onClick={() => onFilterChange('sort', opt.value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
