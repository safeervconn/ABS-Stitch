@@ .. @@
+/**
+ * Data Table Component
+ * 
+ * Reusable table component providing:
+ * - Sortable columns with visual indicators
+ * - Pagination with configurable page sizes
+ * - Loading states and empty data handling
+ * - Responsive design with horizontal scrolling
+ * - Optimized rendering with memoization
+ */
+
 import React from 'react';
 import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
 import { PaginatedResponse, PaginationParams } from '../types';

@@ .. @@
   loading = false,
 }: DataTableProps<T>) {
+  /**
+   * Handle column sorting with direction toggle
+   */
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

+  /**
+   * Handle page navigation
+   */
   const handlePageChange = (newPage: number) => {
     onParamsChange({ page: newPage });
   };

+  /**
+   * Handle page size changes
+   */
   const handleLimitChange = (newLimit: number) => {
     onParamsChange({ 
       limit: newLimit,
       page: 1, // Reset to first page when changing limit
     });
   };

+  /**
+   * Get appropriate sort icon based on current sort state
+   */
   const getSortIcon = (columnKey: string) => {
     if (currentParams.sortBy !== columnKey) {
       return <ArrowUpDown className="h-4 w-4" />;
     }
     return currentParams.sortOrder === 'asc' 
       ? <ArrowUp className="h-4 w-4" />
       : <ArrowDown className="h-4 w-4" />;
   };

+  /**
+   * Render cell value with fallback for null/undefined
+   */
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

-function DataTable<T extends Record<string, any>>({
+const DataTable = React.memo(<T extends Record<string, any>>({
   data,
   columns,
   onParamsChange,
   currentParams,
   loading = false,
-}: DataTableProps<T>) {
+}: DataTableProps<T>) => {