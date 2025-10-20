/*
  # Remove All Recursive RLS Policies

  1. Problem
    - Infinite recursion still occurring during customer signup
    - Any policy that queries employees table causes recursion
    - Customer signup flow should not need to check employees table

  2. Solution
    - Remove ALL employee table checks from customer policies
    - Use simple, direct checks only (auth.uid() comparisons)
    - Keep employee checks only where absolutely necessary
    - Simplify all policies to prevent any circular dependencies

  3. Changes
    - Drop all existing customer policies
    - Create simple policies without subqueries to employees
    - Drop problematic employee policies
    - Recreate with simple checks only
*/

-- Drop all existing customer policies
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert_self" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;

-- Drop all existing employee policies
DROP POLICY IF EXISTS "employees_select" ON employees;
DROP POLICY IF EXISTS "employees_select_admin" ON employees;
DROP POLICY IF EXISTS "employees_insert" ON employees;
DROP POLICY IF EXISTS "employees_insert_self_signup" ON employees;
DROP POLICY IF EXISTS "employees_update" ON employees;
DROP POLICY IF EXISTS "employees_delete" ON employees;

-- Simple customer policies (NO employee table checks)
CREATE POLICY "customers_select"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "customers_insert"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_update"
  ON customers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_delete"
  ON customers FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- Simple employee policies (NO recursive checks)
CREATE POLICY "employees_select"
  ON employees FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "employees_insert"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() AND status = 'disabled' AND role IN ('sales_rep', 'designer'));

CREATE POLICY "employees_update"
  ON employees FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "employees_delete"
  ON employees FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- Note: Admin functionality will need to be handled via service role or edge functions
-- This removes recursion risk entirely by eliminating cross-table policy checks
