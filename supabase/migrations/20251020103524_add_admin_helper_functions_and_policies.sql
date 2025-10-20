/*
  # Add Admin Helper Functions and Updated RLS Policies

  1. Problem
    - Simple RLS policies don't allow admins to view all employees/customers
    - Circular dependencies cause infinite recursion
    - Admin operations need elevated privileges

  2. Solution
    - Create helper function to check if user is admin (returns boolean)
    - Use this function in RLS policies to avoid circular lookups
    - Add policies that use the helper function for admin access

  3. Changes
    - Create is_admin() helper function
    - Update customer policies to use helper for admin access
    - Update employee policies to use helper for admin access
    - Keep simple policies for self-access
*/

-- Create helper function to check if user is an active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is an active sales rep
CREATE OR REPLACE FUNCTION is_sales_rep()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees
    WHERE id = auth.uid()
    AND role = 'sales_rep'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing customer policies
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;

-- Drop all existing employee policies
DROP POLICY IF EXISTS "employees_select" ON employees;
DROP POLICY IF EXISTS "employees_select_admin" ON employees;
DROP POLICY IF EXISTS "employees_insert" ON employees;
DROP POLICY IF EXISTS "employees_update" ON employees;
DROP POLICY IF EXISTS "employees_delete" ON employees;

-- Customer policies
CREATE POLICY "customers_select_self"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "customers_select_admin"
  ON customers FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "customers_select_sales_rep"
  ON customers FOR SELECT
  TO authenticated
  USING (is_sales_rep());

CREATE POLICY "customers_insert_self"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_update_self"
  ON customers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_update_admin"
  ON customers FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "customers_delete_admin"
  ON customers FOR DELETE
  TO authenticated
  USING (is_admin());

-- Employee policies
CREATE POLICY "employees_select_self"
  ON employees FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "employees_select_admin"
  ON employees FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "employees_insert_admin"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "employees_update_self"
  ON employees FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "employees_update_admin"
  ON employees FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "employees_delete_admin"
  ON employees FOR DELETE
  TO authenticated
  USING (is_admin());
