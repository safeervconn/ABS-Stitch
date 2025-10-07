/**
 * Data Table Component
 * 
 * Comprehensive data table with advanced features:
 * - Sortable columns with visual indicators
 * - Pagination with customizable page sizes
 * - Loading states and empty state handling
 * - Responsive design with horizontal scrolling
 * - Custom cell rendering support
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Performance optimized with React.memo
 */

import React, { useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { PaginatedResponse, PaginationParams } from '../types';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  onParamsChange: (params: Partial<PaginationParams>) => void;
  currentParams: PaginationParams;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Generic data table component with full feature set
 */
function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onParamsChange,
  currentParams,
  loading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {

  /**
   * Handle column sorting with toggle functionality
   */
  const handleSort = useCallback((columnKey: string) => {
    const isCurrentSort = currentParams.sortBy === columnKey;
    const newSortOrder = isCurrentSort && currentParams.sortOrder === 'asc' ? 'desc' : 'asc';
    
    onParamsChange({
      sortBy: columnKey,
      sortOrder: newSortOrder,
      page: 1 // Reset to first page when sorting
    });
  }, [currentParams.sortBy, currentParams.sortOrder, onParamsChange]);

  /**
   * Handle page navigation
   */
  const handlePageChange = useCallback((newPage: number) => {
    onParamsChange({ page: newPage });
  }, [onParamsChange]);

  /**
   * Handle page size changes
   */
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    onParamsChange({ 
      limit: newPageSize,
      page: 1 // Reset to first page when changing page size
    });
  }, [onParamsChange]);

  /**
   * Generate pagination info and controls
   */
  const paginationInfo = useMemo(() => {
    const { page, limit, total, totalPages } = data;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);
    
    return {
      startItem,
      endItem,
      total,
      totalPages,
      currentPage: page,
      hasPrevious: page > 1,
      hasNext: page < totalPages
    };
  }, [data]);

  /**
   * Render sort indicator for column headers
   */
  const renderSortIndicator = useCallback((columnKey: string) => {
    if (currentParams.sortBy !== columnKey) {
      return <ChevronUp className="h-4 w-4 text-gray-300" />;
    }
    
    return currentParams.sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  }, [currentParams.sortBy, currentParams.sortOrder]);

  /**
   * Render table cell content
   */
  const renderCellContent = useCallback((item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key] || '-';
  }, []);

  /**
   * Generate page numbers for pagination
   */
  const pageNumbers = useMemo(() => {
    const { currentPage, totalPages } = paginationInfo;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [paginationInfo]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full">
          
          {/* Table header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                  } ${column.className || ''}`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  role={column.sortable ? 'button' : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={column.sortable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  } : undefined}
                  aria-sort={
                    column.sortable && currentParams.sortBy === column.key
                      ? currentParams.sortOrder === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIndicator(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              /* Loading state */
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.data.length === 0 ? (
              /* Empty state */
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              /* Data rows */
              data.data.map((item, index) => (
                <tr 
                  key={item.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {!loading && data.data.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            
            {/* Results info */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Showing {paginationInfo.startItem} to {paginationInfo.endItem} of{' '}
                {paginationInfo.total} results
              </p>
              
              {/* Page size selector */}
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-700">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={currentParams.limit}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
              
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                disabled={!paginationInfo.hasPrevious}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {pageNumbers.map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          pageNum === paginationInfo.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={pageNum === paginationInfo.currentPage ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                disabled={!paginationInfo.hasNext}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export with proper typing
export default React.memo(DataTable) as typeof DataTable;