/*
  # Fix customer signup RLS policy

  1. Security Changes
    - Add INSERT policy for customers table to allow new user registration
    - Allow authenticated users to create their own customer profile during signup
    - Policy ensures users can only create a profile with their own auth.uid()

  2. Policy Details
    - Policy name: "Users can create own customer profile"
    - Operation: INSERT
    - Role: authenticated
    - Check: id = auth.uid()
*/

-- Add INSERT policy for customer registration
CREATE POLICY "Users can create own customer profile"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());