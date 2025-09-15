/**
 * Authentication Helper Functions
 * 
 * Purpose: Centralized authentication logic and temporary user management
 * Features:
 * - Temporary user authentication for demo purposes
 * - Role-based login validation
 * - Session management
 * - Dashboard routing based on user roles
 * 
 * Note: This is a temporary implementation for demonstration.
 * In production, this would integrate with Supabase authentication.
 */

// Temporary user database for demo purposes
const TEMP_USERS = [
  {
    id: 'admin-001',
    email: 'admin@artistrydigital.com',
    password: 'demo123',
    full_name: 'System Administrator',
    role: 'admin',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'sales-001',
    email: 'sales@artistrydigital.com',
    password: 'demo123',
    full_name: 'John Sales',
    role: 'sales_rep',
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'designer-001',
    email: 'designer@artistrydigital.com',
    password: 'demo123',
    full_name: 'Jane Designer',
    role: 'designer',
    avatar_url: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'customer-001',
    email: 'customer@example.com',
    password: 'demo123',
    full_name: 'Sarah Johnson',
    role: 'customer',
    avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

export interface TempUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sales_rep' | 'designer' | 'customer';
  avatar_url?: string;
}

/**
 * Temporary login function for demo purposes
 * Validates credentials against temporary user database
 * 
 * @param email - User email address
 * @param password - User password
 * @returns Promise resolving to user data or null if invalid
 */
export const tempLogin = async (email: string, password: string): Promise<TempUser | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = TEMP_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Store user session in localStorage (temporary solution)
    const userSession = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url
    };
    
    localStorage.setItem('temp_user_session', JSON.stringify(userSession));
    return userSession;
  }
  
  return null;
};

/**
 * Get current temporary user session
 * Retrieves user data from localStorage
 * 
 * @returns Current user session or null if not logged in
 */
export const getTempCurrentUser = (): TempUser | null => {
  try {
    const session = localStorage.getItem('temp_user_session');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error getting temp user session:', error);
    return null;
  }
};

/**
 * Sign out temporary user
 * Clears user session from localStorage
 */
export const tempSignOut = (): void => {
  localStorage.removeItem('temp_user_session');
};

/**
 * Get dashboard route based on user role
 * Returns appropriate dashboard path for each role
 * 
 * @param role - User role
 * @returns Dashboard route path
 */
export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'sales_rep':
      return '/sales/dashboard';
    case 'designer':
      return '/designer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/';
  }
};

/**
 * Check if user has required role for accessing a route
 * Used for route protection
 * 
 * @param userRole - Current user's role
 * @param requiredRole - Required role for the route
 * @returns Boolean indicating if user has access
 */
export const hasRoleAccess = (userRole: string, requiredRole: string): boolean => {
  // Admin has access to all routes
  if (userRole === 'admin') return true;
  
  // Otherwise, exact role match required
  return userRole === requiredRole;
};

/**
 * Validate user session and redirect if necessary
 * Used in dashboard components to ensure proper authentication
 * 
 * @param requiredRole - Required role for the current page
 * @returns Current user or redirects to login
 */
export const validateUserSession = (requiredRole?: string): TempUser | null => {
  const user = getTempCurrentUser();
  
  if (!user) {
    // No user session, redirect to login
    window.location.href = '/login';
    return null;
  }
  
  if (requiredRole && !hasRoleAccess(user.role, requiredRole)) {
    // User doesn't have required role, redirect to their dashboard
    window.location.href = getDashboardRoute(user.role);
    return null;
  }
  
  return user;
};