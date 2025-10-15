import { supabase } from '../lib/supabase';
import { getStartOfMonth, getCountQuery } from './queryBuilder';

export interface DashboardStats {
  totalOrdersThisMonth: number;
  newCustomersThisMonth?: number;
  totalRevenueThisMonth?: number;
  inProgressOrders?: number;
  activeProducts?: number;
  newOrdersCount?: number;
  underReviewOrdersCount?: number;
  inProgressOrdersCount?: number;
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const startOfMonth = getStartOfMonth();

  try {
    const [
      totalOrdersThisMonth,
      newCustomersThisMonth,
      revenueData,
      inProgressOrders,
      activeProducts,
      newOrdersCount,
      underReviewOrdersCount
    ] = await Promise.all([
      getCountQuery('orders', { created_at: { gte: startOfMonth.toISOString() } }),
      getCountQuery('customers', { created_at: { gte: startOfMonth.toISOString() } }),
      supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString()),
      getCountQuery('orders', { status: 'in_progress' }),
      getCountQuery('products', { status: 'active' }),
      getCountQuery('orders', { status: 'new' }),
      getCountQuery('orders', { status: 'under_review' })
    ]);

    const totalRevenueThisMonth = revenueData.data?.reduce((sum, order) => {
      return sum + (order.total_amount || 0);
    }, 0) || 0;

    return {
      totalOrdersThisMonth,
      newCustomersThisMonth,
      totalRevenueThisMonth,
      inProgressOrders,
      activeProducts,
      newOrdersCount,
      underReviewOrdersCount,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalOrdersThisMonth: 0,
      newCustomersThisMonth: 0,
      totalRevenueThisMonth: 0,
      inProgressOrders: 0,
      activeProducts: 0,
      newOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  }
}

export async function getSalesRepDashboardStats(salesRepId: string): Promise<DashboardStats> {
  const startOfMonth = getStartOfMonth();

  try {
    const { data: assignedCustomers, error: customersError } = await supabase
      .from('customers')
      .select('id')
      .eq('assigned_sales_rep_id', salesRepId);

    if (customersError) throw customersError;

    const customerIds = assignedCustomers?.map(c => c.id) || [];

    if (customerIds.length === 0) {
      return {
        totalOrdersThisMonth: 0,
        newOrdersCount: 0,
        inProgressOrdersCount: 0,
        underReviewOrdersCount: 0,
      };
    }

    const [
      totalOrdersResponse,
      newOrdersResponse,
      inProgressOrdersResponse,
      underReviewOrdersResponse
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('customer_id', customerIds)
        .gte('created_at', startOfMonth.toISOString()),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('customer_id', customerIds)
        .eq('status', 'new'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('customer_id', customerIds)
        .eq('status', 'in_progress'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('customer_id', customerIds)
        .eq('status', 'under_review')
    ]);

    return {
      totalOrdersThisMonth: totalOrdersResponse.count || 0,
      newOrdersCount: newOrdersResponse.count || 0,
      inProgressOrdersCount: inProgressOrdersResponse.count || 0,
      underReviewOrdersCount: underReviewOrdersResponse.count || 0,
    };
  } catch (error) {
    console.error('Error fetching sales rep stats:', error);
    return {
      totalOrdersThisMonth: 0,
      newOrdersCount: 0,
      inProgressOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  }
}

export async function getDesignerDashboardStats(designerId: string): Promise<DashboardStats> {
  const startOfMonth = getStartOfMonth();

  try {
    const [totalOrdersResponse, inProgressOrdersResponse] = await Promise.all([
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_designer_id', designerId)
        .gte('created_at', startOfMonth.toISOString()),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_designer_id', designerId)
        .eq('status', 'in_progress')
    ]);

    return {
      totalOrdersThisMonth: totalOrdersResponse.count || 0,
      inProgressOrdersCount: inProgressOrdersResponse.count || 0,
    };
  } catch (error) {
    console.error('Error fetching designer stats:', error);
    return {
      totalOrdersThisMonth: 0,
      inProgressOrdersCount: 0,
    };
  }
}

export type DashboardRole = 'admin' | 'sales_rep' | 'designer';

export async function getDashboardStats(
  role: DashboardRole,
  userId?: string
): Promise<DashboardStats> {
  switch (role) {
    case 'admin':
      return getAdminDashboardStats();
    case 'sales_rep':
      if (!userId) throw new Error('User ID required for sales rep stats');
      return getSalesRepDashboardStats(userId);
    case 'designer':
      if (!userId) throw new Error('User ID required for designer stats');
      return getDesignerDashboardStats(userId);
    default:
      throw new Error('Invalid role');
  }
}
