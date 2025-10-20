/*
  # Fix Employee RLS Policy to Allow Login

  1. Problem
    - The employees_select_active_peers policy was causing login failures
    - The EXISTS subquery created potential recursion issues
    - Users couldn't retrieve their own profiles after login

  2. Solution
    - Create a helper function to check if current user is an active employee
    - Update the employees_select_active_peers policy to use this function
    - This avoids recursive RLS checks

  3. Security
    - SECURITY DEFINER function bypasses RLS for the check
    - Still maintains security by only allowing active employees to see other active employees
    - Users can always see themselves via employees_select_self policy
*/

-- Create helper function to check if current user is an active employee
CREATE OR REPLACE FUNCTION is_active_employee()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees
    WHERE id = auth.uid()
    AND status = 'active'
  );
END;
$$;

-- Drop and recreate the employees_select_active_peers policy with the helper function
DROP POLICY IF EXISTS "employees_select_active_peers" ON employees;

CREATE POLICY "employees_select_active_peers"
  ON employees FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    AND is_active_employee()
  );
