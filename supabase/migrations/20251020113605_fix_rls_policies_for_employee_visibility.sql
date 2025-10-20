/*
  # Fix RLS Policies for Employee and Order Comment Visibility

  1. Issues Fixed
    - Sales reps cannot see designers (needed for assignment dropdown)
    - Sales reps and designers cannot see comments by admin
    - Designers cannot see their assigned orders properly

  2. Changes Made
    **Employees Table**
    - Add policy for employees to view other active employees (for assignment purposes)
    - This allows sales reps to see designers and vice versa
    
    **Order Comments Table**  
    - Update SELECT policy to include fetching employee info via joins
    - Allow viewing comments when user has access to the related order
    
    **Orders Table**
    - Ensure designers can properly query their assigned orders
    - No changes needed - current policy already correct

  3. Security Notes
    - Employees can only view other active employees (not disabled ones)
    - Comment visibility still restricted to users involved in the order
    - All policies maintain principle of least privilege
*/

-- Drop and recreate employees SELECT policies to add peer visibility
DROP POLICY IF EXISTS "employees_select_self" ON employees;
DROP POLICY IF EXISTS "employees_select_admin" ON employees;

-- Allow employees to view themselves
CREATE POLICY "employees_select_self"
  ON employees FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow admins to view all employees
CREATE POLICY "employees_select_admin"
  ON employees FOR SELECT
  TO authenticated
  USING (is_admin());

-- Allow active employees to view other active employees (for assignments)
CREATE POLICY "employees_select_active_peers"
  ON employees FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
  );

-- Update order_comments SELECT policy to properly handle employee joins
DROP POLICY IF EXISTS "order_comments_select" ON order_comments;

CREATE POLICY "order_comments_select"
  ON order_comments FOR SELECT
  TO authenticated
  USING (
    -- User can see comments if they have access to the order
    EXISTS (
      SELECT 1 
      FROM orders o
      WHERE o.id = order_comments.order_id
      AND (
        o.customer_id = auth.uid() 
        OR o.assigned_sales_rep_id = auth.uid() 
        OR o.assigned_designer_id = auth.uid()
        OR is_admin()
      )
    )
  );
