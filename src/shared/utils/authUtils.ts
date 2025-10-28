import { supabase } from '../../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'customer' | 'designer' | 'sales_rep' | 'admin';
  full_name?: string;
  phone?: string;
  created_at: string;
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return getUserProfile(user.id);
};

export const isAdmin = (profile: UserProfile | null): boolean => {
  return profile?.role === 'admin';
};

export const isDesigner = (profile: UserProfile | null): boolean => {
  return profile?.role === 'designer';
};

export const isSalesRep = (profile: UserProfile | null): boolean => {
  return profile?.role === 'sales_rep';
};

export const isCustomer = (profile: UserProfile | null): boolean => {
  return profile?.role === 'customer';
};

export const hasRole = (profile: UserProfile | null, roles: string[]): boolean => {
  return profile ? roles.includes(profile.role) : false;
};

export const requireAuth = async (): Promise<UserProfile> => {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    throw new Error('Authentication required');
  }
  return profile;
};

export const requireRole = async (allowedRoles: string[]): Promise<UserProfile> => {
  const profile = await requireAuth();
  if (!hasRole(profile, allowedRoles)) {
    throw new Error('Insufficient permissions');
  }
  return profile;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
