import { supabase } from '../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface QueryListResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
  count?: number;
}

export class BaseRepository<T> {
  constructor(protected tableName: string) {}

  async findById(id: string): Promise<QueryResult<T>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as T | null, error };
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<QueryListResult<T>> {
    let query = supabase.from(this.tableName).select('*', { count: 'exact' });

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.orderDirection !== 'desc' });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    return { data: data as T[] | null, error, count: count || undefined };
  }

  async findWhere(
    field: string,
    value: any,
    options?: {
      limit?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<QueryListResult<T>> {
    let query = supabase.from(this.tableName).select('*').eq(field, value);

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.orderDirection !== 'desc' });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    return { data: data as T[] | null, error };
  }

  async create(data: Partial<T>): Promise<QueryResult<T>> {
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    return { data: created as T | null, error };
  }

  async update(id: string, data: Partial<T>): Promise<QueryResult<T>> {
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: updated as T | null, error };
  }

  async delete(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    return { error };
  }

  async count(where?: { field: string; value: any }): Promise<{ count: number; error: PostgrestError | null }> {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });

    if (where) {
      query = query.eq(where.field, where.value);
    }

    const { count, error } = await query;

    return { count: count || 0, error };
  }

  protected async executeQuery<R>(
    queryBuilder: () => Promise<{ data: R | null; error: PostgrestError | null }>
  ): Promise<QueryResult<R>> {
    try {
      const result = await queryBuilder();
      return result;
    } catch (error) {
      console.error(`Error in ${this.tableName}:`, error);
      return { data: null, error: error as PostgrestError };
    }
  }
}
