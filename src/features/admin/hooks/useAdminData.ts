/**
 * Admin Data Management Hooks
 * 
 * Custom React hooks for admin data operations:
 * - Paginated data fetching with caching
 * - Real-time data updates
 * - Loading and error state management
 * - Optimized re-fetching strategies
 * - Memory leak prevention
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PaginatedResponse, PaginationParams } from '../../../types';

interface UseAdminDataOptions {
  skipInitialFetch?: boolean;
  refetchInterval?: number;
}

/**
 * Hook for managing paginated data with advanced features
 */
export function usePaginatedData<T>(
  fetchFunction: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  initialParams: PaginationParams,
  options: UseAdminDataOptions = {}
) {
  const [data, setData] = useState<PaginatedResponse<T>>({
    data: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0
  });
  const [params, setParams] = useState<PaginationParams>(initialParams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch data with abort controller for cleanup
   */
  const fetchData = useCallback(async (fetchParams: PaginationParams) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction(fetchParams);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && isMountedRef.current) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction]);

  /**
   * Update parameters and trigger refetch
   */
  const updateParams = useCallback((newParams: Partial<PaginationParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    fetchData(updatedParams);
  }, [params, fetchData]);

  /**
   * Refetch data with current parameters
   */
  const refetch = useCallback(() => {
    fetchData(params);
  }, [fetchData, params]);

  /**
   * Reset to initial parameters and refetch
   */
  const reset = useCallback(() => {
    setParams(initialParams);
    fetchData(initialParams);
  }, [initialParams, fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (!options.skipInitialFetch) {
      fetchData(params);
    }
  }, []); // Only run on mount

  // Set up interval refetching if specified
  useEffect(() => {
    if (options.refetchInterval && options.refetchInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          fetchData(params);
        }
      }, options.refetchInterval);

      return () => clearInterval(interval);
    }
  }, [options.refetchInterval, loading, params, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    params,
    loading,
    error,
    updateParams,
    refetch,
    reset
  };
}

/**
 * Hook for managing simple admin data without pagination
 */
export function useAdminData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);

  /**
   * Fetch data with error handling
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction]);

  /**
   * Refetch data manually
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for managing form state with validation
 */
export function useFormState<T extends Record<string, any>>(
  initialState: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  /**
   * Update form field value
   */
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Mark field as touched
   */
  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  /**
   * Validate single field
   */
  const validateField = useCallback((field: keyof T) => {
    if (!validationRules || !validationRules[field]) return null;
    
    const rule = validationRules[field];
    const error = rule!(formData[field]);
    
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
    return error;
  }, [formData, validationRules]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(() => {
    if (!validationRules) return true;
    
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T];
      if (rule) {
        const error = rule(formData[field as keyof T]);
        if (error) {
          newErrors[field as keyof T] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  /**
   * Set form data from external source
   */
  const setFormDataFromSource = useCallback((data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  return {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validateField,
    validateForm,
    resetForm,
    setFormDataFromSource,
    isValid: Object.keys(errors).length === 0
  };
}