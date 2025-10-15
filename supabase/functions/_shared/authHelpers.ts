import { createClient } from 'npm:@supabase/supabase-js@2';

export async function authenticateRequest(req: Request): Promise<{
  supabaseClient: any;
  user: any;
  error?: string;
}> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return {
      supabaseClient,
      user: null,
      error: 'Unauthorized',
    };
  }

  return {
    supabaseClient,
    user,
  };
}

export async function requireAdmin(
  supabaseClient: any,
  userId: string
): Promise<{ isAdmin: boolean; error?: string }> {
  const { data: employee, error } = await supabaseClient
    .from('employees')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { isAdmin: false, error: 'Failed to verify user role' };
  }

  if (!employee || employee.role !== 'admin') {
    return { isAdmin: false, error: 'Admin access required' };
  }

  return { isAdmin: true };
}

export interface UserRole {
  role: 'admin' | 'sales_rep' | 'designer' | 'customer';
  userId: string;
}

export async function getUserRole(
  supabaseClient: any,
  userId: string
): Promise<UserRole | null> {
  const { data: employee } = await supabaseClient
    .from('employees')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  if (employee) {
    return {
      role: employee.role,
      userId: employee.id,
    };
  }

  const { data: customer } = await supabaseClient
    .from('customers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (customer) {
    return {
      role: 'customer',
      userId: customer.id,
    };
  }

  return null;
}
