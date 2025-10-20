/*
  # Fix Orders Table RLS Policies to Prevent Recursion

  1. Problem
    - Orders policies still use subqueries to employees table
    - This can cause recursion during customer signup flow
    - When customer creates order, policy checks employees table

  2. Solution
    - Use helper functions (is_admin, is_sales_rep) instead of subqueries
    - Remove all direct subquery lookups to employees table
    - Maintain same security logic but avoid recursion

  3. Changes
    - Drop existing orders policies
    - Recreate with helper functions
    - Keep customer/designer/sales_rep direct checks
*/

-- Drop all existing orders policies
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;

-- Orders SELECT policy: users can see their own orders or if they're assigned
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    assigned_sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid()
  );

CREATE POLICY "orders_select_admin"
  ON orders FOR SELECT
  TO authenticated
  USING (is_admin());

-- Orders INSERT policy: customers can create their own orders
CREATE POLICY "orders_insert_customer"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "orders_insert_admin"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "orders_insert_sales_rep"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (is_sales_rep());

-- Orders UPDATE policy: assigned staff or admins can update
CREATE POLICY "orders_update_assigned"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    assigned_sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid()
  )
  WITH CHECK (
    assigned_sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid()
  );

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Orders DELETE policy: only admins
CREATE POLICY "orders_delete_admin"
  ON orders FOR DELETE
  TO authenticated
  USING (is_admin());
