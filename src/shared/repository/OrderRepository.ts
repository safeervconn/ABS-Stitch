import { BaseRepository } from './BaseRepository';
import { supabase } from '../../lib/supabase';

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super('orders');
  }

  async findByCustomerId(customerId: string) {
    return this.findWhere('customer_id', customerId, {
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async findByStatus(status: string) {
    return this.findWhere('status', status, {
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async findByOrderNumber(orderNumber: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle();

    return { data, error };
  }

  async updateStatus(id: string, status: string) {
    return this.update(id, { status } as Partial<Order>);
  }

  async getRecentOrders(limit: number = 10) {
    return this.findAll({
      limit,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async getOrdersByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async countByStatus(status: string) {
    return this.count({ field: 'status', value: status });
  }
}

export const orderRepository = new OrderRepository();
