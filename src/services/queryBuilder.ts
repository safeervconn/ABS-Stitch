import { supabase } from '../lib/supabase';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

export interface FilterParams {
  status?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type QueryParams = PaginationParams & SearchParams & FilterParams & SortParams;

export function applyPagination<T extends { from: Function; range: Function }>(
  query: T,
  params: PaginationParams
): T {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  return query.range(from, to) as T;
}

export function applySearch<T extends { or: Function; ilike: Function }>(
  query: T,
  search: string,
  fields: string[]
): T {
  const searchPattern = `%${search}%`;
  const conditions = fields.map(field => `${field}.ilike.${searchPattern}`).join(',');
  return query.or(conditions) as T;
}

export function applyStatusFilter<T extends { eq: Function; in: Function }>(
  query: T,
  status: string | string[]
): T {
  if (Array.isArray(status)) {
    return query.in('status', status) as T;
  }
  return query.eq('status', status) as T;
}

export function applyDateRangeFilter<T extends { gte: Function; lte: Function }>(
  query: T,
  dateFrom?: string,
  dateTo?: string,
  field: string = 'created_at'
): T {
  let result = query;
  if (dateFrom) {
    result = result.gte(field, dateFrom) as T;
  }
  if (dateTo) {
    result = result.lte(field, dateTo) as T;
  }
  return result as T;
}

export function applySorting<T extends { order: Function }>(
  query: T,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): T {
  return query.order(sortBy, { ascending: sortOrder === 'asc' }) as T;
}

export function getStartOfMonth(): Date {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
}

export async function getCountQuery(
  table: string,
  filters?: Record<string, any>
): Promise<number> {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { count } = await query;
  return count || 0;
}
