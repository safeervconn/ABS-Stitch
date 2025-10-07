/**
 * Optimized Data Fetching Hooks
 * 
 * Performance-optimized hooks for data fetching with caching,
 * error handling, and loading states management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/performance';

interface UseOptimizedDataOptions<T> {
  initialData?: T;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  refetchOnWindowFocus?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseOptimizedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Optimized data fetching hook with caching and error handling
 * @param fetchFunction - Function that returns a Promise with data
 * @param dependencies - Dependencies that trigger refetch
 * @param options - Configuration options
 * @returns Data, loading state, error, and utility functions
 */
export function useOptimizedData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseOptimizedDataOptions<T> = {}
): UseOptimizedDataReturn<T> {
  const {
    initialData = null,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus = false,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Check if cached data is still valid
   */
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null;
    
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }
    
    return null;
  }, [cacheKey, cacheDuration]);

  /**
   * Cache data with timestamp
   */
  const setCachedData = useCallback((newData: T): void => {
    if (cacheKey) {
      dataCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
      });
    }
  }, [cacheKey]);

  /**
   * Clear cache for this key
   */
  const clearCache = useCallback((): void => {
    if (cacheKey) {
      dataCache.delete(cacheKey);
    }
  }, [cacheKey]);

  /**
   * Fetch data with retry logic
   */
  const fetchData = useCallback(async (): Promise<void> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const result = await fetchFunction();
      
      if (!abortControllerRef.current.signal.aborted) {
        setData(result);
        setCachedData(result);
        retryCountRef.current = 0;
      }
    } catch (err: any) {
      if (!abortControllerRef.current.signal.aborted) {
        console.error('Data fetch error:', err);
        
        // Retry logic
        if (retryCountRef.current < retryAttempts) {
          retryCountRef.current++;
          setTimeout(() => {
            fetchData();
          }, retryDelay * retryCountRef.current);
        } else {
          setError(err.message || 'Failed to fetch data');
          retryCountRef.current = 0;
        }
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFunction, getCachedData, setCachedData, retryAttempts, retryDelay]);

  /**
   * Debounced refetch function
   */
  const debouncedFetch = useCallback(
    debounce(fetchData, 300),
    [fetchData]
  );

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();
  }, dependencies);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cachedData = getCachedData();
      if (!cachedData) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, getCachedData, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearCache,
  };
}

/**
 * Hook for optimized search with debouncing
 * @param searchFunction - Function that performs search
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Search utilities
 */
export function useOptimizedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
      } catch (err: any) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [searchFunction, debounceMs]
  );

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  return {
    query,
    results,
    loading,
    error,
    search: handleSearch,
    clearResults: () => setResults([]),
  };
}