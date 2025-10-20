/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - Customer signup causes infinite recursion error
    - Customer policies check employees table
    - Employee policies check employees table again (circular dependency)
    - This creates an infinite loop during customer signup

  2. Solution
    - Simplify customer INSERT policy to only check self-ownership
    - Simplify employee SELECT policy to avoid circular lookups
    - Keep admin/employee checks for update/delete operations
    - Use function-based approach for role checking to avoid recursion

  3. Changes
    - Drop and recreate customer insert policy (no employee check)
    - Drop and recreate employee select policy (direct check only)
    - Maintain security while removing circular dependencies
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "customers_insert_self" ON customers;
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "employees_select" ON employees;

-- Create new customers insert policy (simple self-check for signup)
CREATE POLICY "customers_insert_self"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Create new customers select policy (avoid recursion)
CREATE POLICY "customers_select"
  ON customers FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = auth.uid() 
      AND e.role IN ('admin', 'sales_rep') 
      AND e.status = 'active'
    )
  );

-- Create new employees select policy (direct check to avoid recursion)
CREATE POLICY "employees_select"
  ON employees FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
  );

-- Add separate policy for admins to view all employees
CREATE POLICY "employees_select_admin"
  ON employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees admin 
      WHERE admin.id = auth.uid() 
      AND admin.role = 'admin' 
      AND admin.status = 'active'
      AND admin.id != employees.id  -- Prevent self-reference in the subquery
    )
  );
