/**
 * Reusable Filter Bar Component
 * 
 * This component provides a consistent interface for filtering data across
 * different admin sections (Users, Orders, Products). It includes:
 * - Search input with debouncing
 * - Multiple filter dropdowns
 * - Clear filters functionality
 * - Responsive design for mobile
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
  type?: 'select' | 'search' | 'date' | 'number';
  multiSelect?: boolean;
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
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  resultCount,
  loading = false,
}) => {
  const hasActiveFilters = searchValue || Object.values(filterValues).some(value => value);

  const renderFilter = (filter: FilterConfig) => {
    const value = filterValues[filter.key] || (filter.multiSelect ? [] : '');

    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.key} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={filter.placeholder || filter.label}
              value={value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>
        );

      case 'date':
        return (
          <input
            key={filter.key}
            type="date"
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
        );

      case 'number':
        return (
          <input
            key={filter.key}
            type="number"
            placeholder={filter.placeholder || filter.label}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
        );

      default:
        return (
          filter.multiSelect ? (
            <select
              key={filter.key}
              multiple
              value={Array.isArray(value) ? value : value ? [value] : []}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                onFilterChange(filter.key, selectedValues);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm min-h-[2.5rem]"
              size={Math.min(filter.options.length + 1, 4)}
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              key={filter.key}
              value={Array.isArray(value) ? value[0] || '' : value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Main Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        {filters.map(renderFilter)}

        {/* Clear Filters & Results Count */}
        <div className="flex items-center justify-between lg:col-span-2 xl:col-span-1">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
          
          {resultCount !== undefined && (
            <div className="flex items-center text-gray-600 text-sm">
              <Filter className="h-4 w-4 mr-1" />
              <span>
                {loading ? 'Loading...' : `${resultCount} results`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;