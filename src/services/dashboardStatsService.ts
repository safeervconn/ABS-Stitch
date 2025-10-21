import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalOrdersThisMonth: number;
  newCustomersThisMonth?: number;
  totalRevenueThisMonth?: number;
  inProgressOrders?: number;
  activestockdesigns?: number;
  newOrdersCount?: number;
  underReviewOrdersCount?: number;
  inProgressOrdersCount?: number;
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  try {
    const { data, error } = await supabase.rpc('calculate_dashboard_stats');

    if (error) throw error;

    return data || {
      totalOrdersThisMonth: 0,
      newCustomersThisMonth: 0,
      totalRevenueThisMonth: 0,
      inProgressOrders: 0,
      activestockdesigns: 0,
      newOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalOrdersThisMonth: 0,
      newCustomersThisMonth: 0,
      totalRevenueThisMonth: 0,
      inProgressOrders: 0,
      activestockdesigns: 0,
      newOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  }
}

export async function getSalesRepDashboardStats(salesRepId: string): Promise<DashboardStats> {
  try {
    const { data, error } = await supabase.rpc('calculate_sales_rep_stats', {
      rep_id: salesRepId
    });

    if (error) throw error;

    return data || {
      totalOrdersThisMonth: 0,
      newOrdersCount: 0,
      inProgressOrdersCount: 0,
      underReviewOrdersCount: 0,
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
  try {
    const { data, error } = await supabase.rpc('calculate_designer_stats', {
      designer_id: designerId
    });

    if (error) throw error;

    return data || {
      totalOrdersThisMonth: 0,
      inProgressOrdersCount: 0,
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
