/*
  # Fix user profiles INSERT policy for signup

  1. Security Changes
    - Drop existing INSERT policy that may be too restrictive
    - Add new INSERT policy that allows authenticated users to create profiles
    - Ensure the policy works during the signup flow when auth context is being established

  2. Notes
    - The policy allows INSERT for authenticated users during signup
    - Still maintains security by requiring authentication
    - The WITH CHECK ensures only the user's own profile can be created
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON user_profiles;

-- Create a new INSERT policy that works during signup
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);