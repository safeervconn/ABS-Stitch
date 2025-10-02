/*
  # Add Sales Rep Access to Designers

  1. New Functions
    - `is_sales_rep()` - Function to check if current user is a sales representative
      - Returns boolean indicating if the authenticated user has 'sales_rep' role
      - Used for RLS policies to control access based on role

  2. Security
    - Add RLS policy on `employees` table for sales reps to view designers
    - Policy: "Sales reps can read designer profiles"
      - Allows sales reps to SELECT employees with 'designer' role
      - Enables sales reps to see designer list in order assignment forms
      - Maintains security by restricting access to only designer profiles

  3. Purpose
    - Enables sales representatives to assign orders to designers
    - Provides necessary access for order management workflows
    - Follows same security pattern as existing `is_admin()` function
*/

-- Create function to check if current user is a sales representative
CREATE OR REPLACE FUNCTION is_sales_rep()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM employees 
    WHERE id = auth.uid() 
    AND role = 'sales_rep'
    AND status = 'active'
  );
$$;

-- Add RLS policy for sales reps to read designer profiles
CREATE POLICY "Sales reps can read designer profiles"
  ON employees
  FOR SELECT
  TO authenticated
  USING (is_sales_rep() AND role = 'designer');