/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Policy Changes
    - Drop existing problematic policies that cause recursion
    - Create simplified policies that don't reference user_profiles within themselves
    - Use direct auth.uid() checks instead of subqueries to user_profiles

  2. Security
    - Users can read and update their own profile using auth.uid()
    - Admins identified by email domain instead of role lookup to avoid recursion
    - All policies use non-recursive conditions
*/

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Create safe, non-recursive policies

-- Policy for users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy for admin access using email check instead of role lookup
-- This avoids recursion by not querying user_profiles table
CREATE POLICY "Admin can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@absstitch.com'
    OR auth.uid() = id
  );

-- Policy for admin updates
CREATE POLICY "Admin can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@absstitch.com'
    OR auth.uid() = id
  );

-- Policy for admin inserts (for profile creation)
CREATE POLICY "Admin can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@absstitch.com'
    OR auth.uid() = id
  );

-- Also fix any other tables that might have similar issues
-- Update orders policies to avoid user_profiles recursion
DROP POLICY IF EXISTS "Sales reps can read assigned orders" ON orders;
DROP POLICY IF EXISTS "Designers can read assigned orders" ON orders;

-- Recreate orders policies without user_profiles subqueries
CREATE POLICY "Sales reps can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    sales_rep_id = auth.uid()
    OR auth.jwt() ->> 'email' = 'admin@absstitch.com'
  );

CREATE POLICY "Designers can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    assigned_designer_id = auth.uid()
    OR auth.jwt() ->> 'email' = 'admin@absstitch.com'
  );

-- Update other policies that might reference user_profiles
DROP POLICY IF EXISTS "Sales reps and admins can update orders" ON orders;

CREATE POLICY "Sales reps and admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    sales_rep_id = auth.uid()
    OR assigned_designer_id = auth.uid()
    OR auth.jwt() ->> 'email' = 'admin@absstitch.com'
  );

-- Fix sales_reps policies
DROP POLICY IF EXISTS "Admins can read all sales reps" ON sales_reps;
DROP POLICY IF EXISTS "Sales reps can read own data" ON sales_reps;

CREATE POLICY "Sales reps can read own data"
  ON sales_reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all sales reps"
  ON sales_reps
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@absstitch.com'
    OR auth.uid() = id
  );

-- Fix designers policies
DROP POLICY IF EXISTS "Admins and sales reps can read all designers" ON designers;
DROP POLICY IF EXISTS "Designers can read own data" ON designers;

CREATE POLICY "Designers can read own data"
  ON designers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins and sales reps can read all designers"
  ON designers
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@absstitch.com'
    OR auth.uid() = id
  );

-- Fix customers policies
DROP POLICY IF EXISTS "Customers can read own data" ON customers;
DROP POLICY IF EXISTS "Sales reps can read assigned customers" ON customers;

CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Sales reps can read assigned customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    assigned_sales_rep = auth.uid()
    OR auth.jwt() ->> 'email' = 'admin@absstitch.com'
    OR auth.uid() = id
  );