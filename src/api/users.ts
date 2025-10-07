/**
 * User Management API Functions
 * 
 * User profile operations including:
 * - Profile fetching with role detection
 * - Customer and employee profile creation
 * - Account status management
 * - Notification integration
 */

import { supabase } from './client';

// Type definitions
export interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer';
  status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  status: 'active' | 'disabled';
  assigned_sales_rep_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch user profile with role detection
 */
export const getUserProfile = async (userId: string): Promise<Employee | Customer | null> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // First try employees table
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (employee) {
    return { ...employee, role: employee.role as Employee['role'] };
  }
  
  // Then try customers table
  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (customer) {
    return { ...customer, role: 'customer' };
  }
  
  return null;
};

/**
 * Create customer profile with notification system integration
 */
export const createCustomerProfile = async (customerData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  company_name?: string;
}) => {
  if (!customerData.id || !customerData.email || !customerData.full_name) {
    throw new Error('ID, email, and full name are required');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();
  
  if (error) throw error;
  
  // Notify administrators about new customer registration
  try {
    const { getAllAdmins, createNotification } = await import('./admin');
    const admins = await getAllAdmins();
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'user',
        `New customer ${customerData.full_name} has signed up`
      );
    }
  } catch (notificationError) {
    console.error('Error creating customer signup notifications:', notificationError);
  }
  
  return data;
};

/**
 * Create employee profile with administrative privileges
 */
export const createEmployeeProfile = async (employeeData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer';
  status: string;
}) => {
  if (!employeeData.id || !employeeData.email || !employeeData.full_name || !employeeData.role) {
    throw new Error('ID, email, full name, and role are required');
  }

  const validRoles = ['admin', 'sales_rep', 'designer'];
  if (!validRoles.includes(employeeData.role)) {
    throw new Error('Invalid role specified');
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Create employee profile for self-registration
 */
export const createEmployeeProfileSelfSignup = async (employeeData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'sales_rep' | 'designer';
}) => {
  const allowedRoles = ['sales_rep', 'designer'];
  if (!allowedRoles.includes(employeeData.role)) {
    throw new Error('Self-signup is only allowed for sales representatives and designers');
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      ...employeeData,
      status: 'disabled'
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Notify administrators about new employee self-registration
  try {
    const { getAllAdmins, createNotification } = await import('./admin');
    const admins = await getAllAdmins();
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'user',
        `New employee ${employeeData.full_name} has signed up (${employeeData.role.replace('_', ' ')}) - pending approval`
      );
    }
  } catch (notificationError) {
    console.error('Error creating employee signup notifications:', notificationError);
  }
  
  return data;
};