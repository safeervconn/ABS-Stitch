/*
  # Fix Customer Signup Policy

  ## Problem
  Customer signup fails with "Account created but profile setup failed" error.
  The RLS policy for customers_insert_self is too restrictive.

  ## Solution
  Update the customers_insert_self policy to allow new users to create their profile
  with all necessary fields during signup.
*/

-- Drop the old policy
DROP POLICY IF EXISTS "customers_insert_self" ON customers;

-- Create improved policy that allows authenticated users to insert their own profile
CREATE POLICY "customers_insert_self"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND status = 'active'
  );
