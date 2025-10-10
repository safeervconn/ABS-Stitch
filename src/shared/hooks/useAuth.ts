import { useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile } from '../../lib/supabase';

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer' | 'customer';
  status: 'active' | 'disabled';
}

interface UseAuthOptions {
  requiredRole?: AuthUser['role'] | AuthUser['role'][];
  redirectTo?: string;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          window.location.href = options.redirectTo || '/login';
          return;
        }

        const profile = await getUserProfile(currentUser.id);

        if (!profile) {
          setError('User profile not found');
          window.location.href = options.redirectTo || '/login';
          return;
        }

        if (options.requiredRole) {
          const requiredRoles = Array.isArray(options.requiredRole)
            ? options.requiredRole
            : [options.requiredRole];

          const userRole = (profile as any).role || 'customer';

          if (!requiredRoles.includes(userRole)) {
            console.error('Access denied: User role is', userRole, 'but required', requiredRoles);
            window.location.href = options.redirectTo || '/login';
            return;
          }
        }

        setUser(profile as AuthUser);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        window.location.href = options.redirectTo || '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [options.redirectTo, options.requiredRole]);

  return { user, loading, error };
};
