/*
  # Allow Sales Reps to View Designers

  1. Security Changes
    - Add RLS policy to allow sales representatives to read designer employee records
    - This enables the "Assign to Designer" dropdown in the Sales Rep Dashboard to work properly
    - Sales reps can only view employees with 'designer' role, not other sales reps or admins

  2. Policy Details
    - Policy name: "Sales reps can read designers"
    - Applies to: SELECT operations on employees table
    - Condition: Current user is a sales_rep AND target employee is a designer
    - This maintains security while enabling necessary functionality
*/

-- Add policy to allow sales reps to view designers
CREATE POLICY "Sales reps can read designers"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if current user is a sales rep and target employee is a designer
    (EXISTS (
      SELECT 1 FROM employees current_emp 
      WHERE current_emp.id = auth.uid() 
      AND current_emp.role = 'sales_rep'
      AND current_emp.status = 'active'
    ) AND role = 'designer' AND status = 'active')
  );