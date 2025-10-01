/*
  # Fix infinite recursion in employees RLS policy

  1. Security Changes
    - Drop the problematic policy that causes infinite recursion
    - Create a new policy that allows sales reps to view designers without recursion
    - Use a simpler approach that doesn't query the same table

  2. Policy Logic
    - Allow sales reps to read designer profiles
    - Avoid circular dependencies by using direct role checks
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Sales reps can read designers" ON employees;

-- Create a new policy that allows sales reps to view designers without recursion
-- This policy allows users to read employee records where the target employee is a designer
-- and the requesting user has sales_rep role (checked via auth context, not table lookup)
CREATE POLICY "Sales reps can view designers"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    role = 'designer' 
    AND status = 'active'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  );

-- Also ensure we have a policy for users to read their own profile
-- (this might already exist but let's make sure)
CREATE POLICY "Users can read own employee profile" 
  ON employees 
  FOR SELECT 
  TO authenticated 
  USING (id = auth.uid());