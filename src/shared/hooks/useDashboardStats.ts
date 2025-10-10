import { useState, useEffect } from 'react';
import {
  getAdminStats,
  getSalesRepDashboardStats,
  getDesignerDashboardStats
} from '../../admin/api/supabaseHelpers';

interface DashboardStats {
  totalOrdersThisMonth: number;
  newCustomersThisMonth?: number;
  totalRevenueThisMonth?: number;
  inProgressOrders?: number;
  activeProducts?: number;
  newOrdersCount?: number;
  underReviewOrdersCount?: number;
  inProgressOrdersCount?: number;
}

type DashboardRole = 'admin' | 'sales_rep' | 'designer';

export const useDashboardStats = (role: DashboardRole, userId?: string) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        let data: DashboardStats;

        switch (role) {
          case 'admin':
            data = await getAdminStats();
            break;
          case 'sales_rep':
            if (!userId) throw new Error('User ID required for sales rep stats');
            data = await getSalesRepDashboardStats(userId);
            break;
          case 'designer':
            if (!userId) throw new Error('User ID required for designer stats');
            data = await getDesignerDashboardStats(userId);
            break;
          default:
            throw new Error('Invalid role');
        }

        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role, userId]);

  const refetch = async () => {
    try {
      let data: DashboardStats;

      switch (role) {
        case 'admin':
          data = await getAdminStats();
          break;
        case 'sales_rep':
          if (!userId) throw new Error('User ID required for sales rep stats');
          data = await getSalesRepDashboardStats(userId);
          break;
        case 'designer':
          if (!userId) throw new Error('User ID required for designer stats');
          data = await getDesignerDashboardStats(userId);
          break;
        default:
          throw new Error('Invalid role');
      }

      setStats(data);
    } catch (err) {
      console.error('Error refetching dashboard stats:', err);
    }
  };

  return { stats, loading, error, refetch };
};
