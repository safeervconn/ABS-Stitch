/**
 * Custom hook for managing admin data with proper caching and refresh control
 * 
 * This hook addresses the auto-refresh issue by:
 * 1. Implementing proper state management without unnecessary re-renders
 * 2. Using manual refresh triggers instead of automatic intervals
 * 3. Caching data to prevent form clearing during updates
 * 4. Providing loading states for better UX
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getAdminStats, 
  getRecentOrders, 
} from '../api/supabaseHelpers';
import { AdminStats, AdminOrder, PaginatedResponse, PaginationParams } from '../types';

interface UseAdminDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAdminData = (options: UseAdminDataOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  // State management
  const [stats, setStats] = useState<AdminStats>({
    totalOrdersThisMonth: 0,
    newCustomersThisMonth: 0,
    totalRevenueThisMonth: 0,
    inProgressOrders: 0,
    activeProducts: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent unnecessary re-renders
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Manual refresh function
  const refreshData = useCallback(async (force = false) => {
    if (isRefreshingRef.current && !force) return;
    
    isRefreshingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const [statsData, ordersData] = await Promise.all([
        getAdminStats(),
        getRecentOrders(10),
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      isRefreshingRef.current = false;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

  // Auto-refresh setup (disabled by default to fix the bug)
  useEffect(() => {
    if (!autoRefresh) return;

    const setupAutoRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshData();
        setupAutoRefresh();
      }, refreshInterval);
    };

    setupAutoRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    stats,
    recentOrders,
    loading,
    error,
    refreshData,
  };
};

// Hook for paginated data with filters
export const usePaginatedData = <T>(
  fetchFunction: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  initialParams: PaginationParams
) => {
  const [data, setData] = useState<PaginatedResponse<T>>({
    data: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  });
  
  const [params, setParams] = useState<PaginationParams>(initialParams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounced fetch function
  const fetchDataDebounced = useCallback(
    debounce(async (searchParams: PaginationParams) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchFunction(searchParams);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error fetching paginated data:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [fetchFunction]
  );

  // Update params and trigger fetch
  const updateParams = useCallback((newParams: Partial<PaginationParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    fetchDataDebounced(updatedParams);
  }, [params, fetchDataDebounced]);

  // Initial fetch
  useEffect(() => {
    fetchDataDebounced(params);
  }, []);

  return {
    data,
    params,
    loading,
    error,
    updateParams,
    refetch: () => fetchDataDebounced(params),
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}