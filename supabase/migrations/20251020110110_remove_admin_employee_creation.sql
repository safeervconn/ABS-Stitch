/*
  # Remove Admin Employee Creation Policy

  ## Problem
  - Admins should not be able to directly create employees
  - Employees must sign up themselves using the employee signup URL
  - Admin can only activate/deactivate and modify existing employees

  ## Changes
  1. Remove the `employees_insert_admin` policy
  2. Keep employee self-signup policy (via employee signup page)
  
  ## Security
  - Employees can only be created through the signup flow
  - Admins retain ability to update and delete employees
  - Admins can activate/deactivate employee accounts
*/

-- Drop the admin insert policy for employees
DROP POLICY IF EXISTS "employees_insert_admin" ON employees;

-- Ensure employee signup policy exists (employees insert themselves during signup)
-- This policy allows authenticated users to insert their own employee record during signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employees' 
    AND policyname = 'employees_insert_self'
  ) THEN
    CREATE POLICY "employees_insert_self"
      ON employees FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;
