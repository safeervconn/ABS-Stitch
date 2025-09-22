/*
  # Fix RLS Policy Infinite Recursion

  1. Issue
    - Multiple policies are using EXISTS queries to check the employees table
    - This creates circular dependencies causing infinite recursion
    - Affects products, customers, and employees tables

  2. Solution
    - Simplify policies to avoid cross-table EXISTS queries
    - Use auth.uid() directly where possible
    - Remove circular dependencies between employee and customer policies
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all employees" ON employees;
DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;
DROP POLICY IF EXISTS "Sales reps can manage assigned customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create simplified employee policies without circular references
CREATE POLICY "Employees can read own profile"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employees can update own profile"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create simplified customer policies without circular references
CREATE POLICY "Customers can read own profile"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create simplified product policies without circular references
CREATE POLICY "Everyone can read active products"
  ON products
  FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

-- Create admin policies using a safer approach
-- First, let's create a function to check admin role safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Now create admin policies using the function
CREATE POLICY "Admins can manage all employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage all customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Create a function to safely check sales rep role
CREATE OR REPLACE FUNCTION public.is_sales_rep()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role = 'sales_rep'
  );
$$;

-- Sales reps can manage their assigned customers
CREATE POLICY "Sales reps can manage assigned customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    assigned_sales_rep_id = auth.uid() OR 
    public.is_admin()
  );