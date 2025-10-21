import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { PaginatedResponse, PaginationParams } from '../types';
import { generateCSV, downloadCSV, formatDateForFilename, CSVColumn } from '../../shared/utils/csvExport';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  onParamsChange: (params: Partial<PaginationParams>) => void;
  currentParams: PaginationParams;
  loading?: boolean;
  csvFilename?: string;
  csvColumns?: CSVColumn<T>[];
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onParamsChange,
  currentParams,
  loading = false,
  csvFilename = 'export',
  csvColumns,
}: DataTableProps<T>) {
  const handleSort = (columnKey: string) => {
    const newSortOrder = 
      currentParams.sortBy === columnKey && currentParams.sortOrder === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onParamsChange({
      sortBy: columnKey,
      sortOrder: newSortOrder,
      page: 1, // Reset to first page when sorting
    });
  };

  const handlePageChange = (newPage: number) => {
    onParamsChange({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    onParamsChange({ 
      limit: newLimit,
      page: 1, // Reset to first page when changing limit
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (currentParams.sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return currentParams.sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const renderCellValue = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key as keyof T];
    if (value === null || value === undefined) {
      return '-';
    }

    return String(value);
  };

  const handleDownloadCSV = () => {
    const columnsForCSV: CSVColumn<T>[] = csvColumns || columns
      .filter(col => col.key !== 'actions' && col.key !== 'image')
      .map(col => ({
        key: col.key,
        label: col.label,
        format: (item: T) => {
          const value = item[col.key as keyof T];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return String(value);
        }
      }));

    const csvContent = generateCSV(data.data, columnsForCSV);
    const filename = `${csvFilename}_${formatDateForFilename()}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      {/* Header with Download Button */}
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-xs sm:text-sm text-gray-600">
          {data.total > 0 && (
            <span>
              Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} results
            </span>
          )}
        </div>
        <button
          onClick={handleDownloadCSV}
          disabled={data.total === 0 || loading}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto justify-center"
          title="Download filtered data as CSV"
        >
          <Download className="h-4 w-4" />
          <span>Download CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>{column.label}</span>
                      {getSortIcon(String(column.key))}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner-small mr-3"></div>
                    <span className="text-xs sm:text-sm text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-xs sm:text-sm text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                    >
                      {renderCellValue(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-xs sm:text-sm text-gray-700">
                Showing <span className="font-medium">{(data.page - 1) * data.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(data.page * data.limit, data.total)}
                </span>{' '}
                of <span className="font-medium">{data.total}</span> results
              </p>
              <select
                value={data.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(data.totalPages - 4, data.page - 2)) + i;
                  if (pageNum > data.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === data.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;