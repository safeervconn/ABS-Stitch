import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboardStatsService';

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
        const data = await getDashboardStats(role, userId);
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
      const data = await getDashboardStats(role, userId);
      setStats(data);
    } catch (err) {
      console.error('Error refetching dashboard stats:', err);
    }
  };

  return { stats, loading, error, refetch };
};
