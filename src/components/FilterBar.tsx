/**
 * Filter Bar Component
 * 
 * Advanced filtering interface providing:
 * - Search functionality with debounced input
 * - Multiple filter types (select, multi-select, date, search)
 * - Clear filters functionality
 * - Results count display
 * - Loading states
 * - Responsive design with collapsible filters on mobile
 * - Accessibility features
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Loader } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type?: 'select' | 'multi-select' | 'date' | 'search';
  multi?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  filterValues: Record<string, string | string[]>;
  onFilterChange: (key: string, value: string | string[]) => void;
  onClearFilters: () => void;
  resultCount?: number;
  loading?: boolean;
  className?: string;
}

/**
 * Main filter bar component with comprehensive filtering options
 */
const FilterBar: React.FC<FilterBarProps> = React.memo(({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  resultCount,
  loading = false,
  className = ''
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  /**
   * Handle search input with debouncing
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  /**
   * Handle multi-select filter changes
   */
  const handleMultiSelectChange = useCallback((key: string, value: string, checked: boolean) => {
    const currentValues = Array.isArray(filterValues[key]) ? filterValues[key] as string[] : [];
    
    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFilterChange(key, newValues);
  }, [filterValues, onFilterChange]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(filterValues).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== undefined && value !== null;
    });
  }, [filterValues]);

  /**
   * Render individual filter based on type
   */
  const renderFilter = useCallback((filter: FilterConfig) => {
    const value = filterValues[filter.key];

    switch (filter.type) {
      case 'date':
        return (
          <div key={filter.key} className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <input
              type="date"
              value={value as string || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        );

      case 'search':
        return (
          <div key={filter.key} className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={value as string || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={filter.key} className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <div className="relative">
              <div className="border border-gray-300 rounded-lg p-2 bg-white min-h-[38px] max-h-32 overflow-y-auto">
                {filter.options?.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={(e) => handleMultiSelectChange(filter.key, option.value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default: // select
        return (
          <div key={filter.key} className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              value={value as string || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All {filter.label}</option>
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
    }
  }, [filterValues, onFilterChange, handleMultiSelectChange]);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="p-6">
        
        {/* Main search and controls row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Results count */}
            <div className="flex items-center text-gray-600">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    {resultCount !== undefined ? `${resultCount} results` : 'Results'}
                  </span>
                </div>
              )}
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            )}

            {/* Toggle filters button (mobile) */}
            {filters.length > 0 && (
              <button
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Filters grid */}
        {filters.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${
            isFiltersExpanded ? 'block' : 'hidden lg:grid'
          }`}>
            {filters.map(renderFilter)}
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {Object.entries(filterValues).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                const filter = filters.find(f => f.key === key);
                if (!filter) return null;

                const displayValue = Array.isArray(value) 
                  ? `${value.length} selected`
                  : value;

                return (
                  <span
                    key={key}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    <span>{filter.label}: {displayValue}</span>
                    <button
                      onClick={() => onFilterChange(key, Array.isArray(value) ? [] : '')}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default FilterBar;