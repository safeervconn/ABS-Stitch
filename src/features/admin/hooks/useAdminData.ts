@@ .. @@
 /**
- * Custom hook for managing admin data with proper caching and refresh control
+ * Admin Data Management Hooks
  * 
- * This hook addresses the auto-refresh issue by:
+ *  Optimized data management providing:
  * 1. Implementing proper state management without unnecessary re-renders
  * 2. Using manual refresh triggers instead of automatic intervals
  * 3. Caching data to prevent form clearing during updates
  * 4. Providing loading states for better UX
+ * 5. Debounced search functionality
+ * 6. Memoized calculations for performance
  */

 import { useState, useEffect, useCallback, useRef } from 'react';
@@ -22,6 +25,9 @@ interface UseAdminDataOptions {
   refreshInterval?: number;
 }

+/**
+ * Hook for managing admin dashboard data with manual refresh control
+ */
 export const useAdminData = (options: UseAdminDataOptions = {}) => {
   const { autoRefresh = false, refreshInterval = 30000 } = options;
   
@@ -40,6 +46,9 @@ export const useAdminData = (options: UseAdminDataOptions = {}) => {
   const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const isRefreshingRef = useRef(false);

+  /**
+   * Manual refresh function with force option
+   */
   // Manual refresh function
   const refreshData = useCallback(async (force = false) => {
     if (isRefreshingRef.current && !force) return;
@@ -62,10 +71,16 @@ export const useAdminData = (options: UseAdminDataOptions = {}) => {
     }
   }, []);

-  // Initial data load
+  /**
+   * Initial data load on component mount
+   */
   useEffect(() => {
     refreshData(true);
   }, [refreshData]);

+  /**
+   * Auto-refresh setup (disabled by default to prevent form clearing)
+   */
   // Auto-refresh setup (disabled by default to fix the bug)
   useEffect(() => {
     if (!autoRefresh) return;
@@ -83,6 +98,9 @@ export const useAdminData = (options: UseAdminDataOptions = {}) => {
     };
   }, [autoRefresh, refreshInterval, refreshData]);

+  /**
+   * Cleanup timeouts on unmount
+   */
   // Cleanup
   useEffect(() => {
     return () => {
@@ -99,7 +117,10 @@ export const useAdminData = (options: UseAdminDataOptions = {}) => {
   };
 };

-// Hook for paginated data with filters
+/**
+ * Hook for paginated data with filters and debounced search
+ * Provides optimized data fetching with caching and error handling
+ */
 export const usePaginatedData = <T>(
   fetchFunction: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
   initialParams: PaginationParams,
@@ -116,7 +137,10 @@ export const usePaginatedData = <T>(
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   
-  // Debounced fetch function
+  /**
+   * Debounced fetch function to prevent excessive API calls
+   * Uses 300ms delay for optimal user experience
+   */
   const fetchDataDebounced = useCallback(
     debounce(async (searchParams: PaginationParams) => {
       setLoading(true);
@@ -133,7 +157,10 @@ export const usePaginatedData = <T>(
     [fetchFunction]
   );

-  // Update params and trigger fetch
+  /**
+   * Update search parameters and trigger data fetch
+   * Merges new params with existing ones
+   */
   const updateParams = useCallback((newParams: Partial<PaginationParams>) => {
     setParams(prevParams => {
       const updatedParams = { ...prevParams, ...newParams };
@@ -142,7 +169,10 @@ export const usePaginatedData = <T>(
     });
   }, [fetchDataDebounced]);

-  // Initial fetch - use ref to ensure it only runs once
+  /**
+   * Initial data fetch with skip option
+   * Uses ref to ensure it only runs once
+   */
   const initialFetchDone = useRef(false);
   useEffect(() => {
     if (!initialFetchDone.current && !options?.skipInitialFetch) {
@@ -159,7 +189,10 @@ export const usePaginatedData = <T>(
   };
 };

-// Debounce utility function
+/**
+ * Debounce utility function for optimizing API calls
+ * Delays function execution until after specified wait time
+ */
 function debounce<T extends (...args: any[]) => any>(
   func: T,
   wait: number