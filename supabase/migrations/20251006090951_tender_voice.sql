/*
  # Employee Self-Signup RLS Policies

  1. New Policies
    - Allow unauthenticated users to create employee accounts with disabled status
    - Prevent employees from activating their own accounts
    - Ensure new signups default to disabled status

  2. Security
    - Maintain existing RLS policies for authenticated users
    - Add constraint to ensure self-signups are disabled by default
    - Prevent privilege escalation through self-signup
*/

-- Allow unauthenticated users to create employee accounts (self-signup)
CREATE POLICY "Allow employee self-signup"
  ON employees
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'disabled' AND 
    role IN ('sales_rep', 'designer')
  );

-- Prevent employees from changing their own status (only admins can activate accounts)
CREATE POLICY "Employees cannot change own status"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    status = (SELECT status FROM employees WHERE id = auth.uid())
  );