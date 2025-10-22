/*
  # Add order_id to edit_comments table

  1. Changes to edit_comments table
    - Add `order_id` column (uuid, foreign key to orders)
    - Make `edit_request_id` nullable since we'll use comments directly
    - Add index on order_id for performance
    
  2. Security
    - Update RLS policies to allow access based on order ownership
    
  3. Notes
    - This simplifies the edit request flow by allowing comments to be directly
      linked to orders without requiring a separate edit_requests record
*/

-- Add order_id column to edit_comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'edit_comments' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE edit_comments ADD COLUMN order_id uuid REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make edit_request_id nullable
ALTER TABLE edit_comments ALTER COLUMN edit_request_id DROP NOT NULL;

-- Add index on order_id for better query performance
CREATE INDEX IF NOT EXISTS idx_edit_comments_order_id ON edit_comments(order_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view edit comments for their edit requests" ON edit_comments;
DROP POLICY IF EXISTS "Users can create edit comments" ON edit_comments;

-- Policy for customers to view edit comments on their own orders
CREATE POLICY "Customers can view edit comments on their orders"
  ON edit_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = edit_comments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Policy for employees (admin, sales rep, designer) to view all edit comments
CREATE POLICY "Employees can view all edit comments"
  ON edit_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.status = 'active'
    )
  );

-- Policy for customers to create edit comments on their completed orders
CREATE POLICY "Customers can create edit comments on their completed orders"
  ON edit_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = edit_comments.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- Policy for employees to create edit comments on any order
CREATE POLICY "Employees can create edit comments on any order"
  ON edit_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.status = 'active'
    )
  );

-- Policy for customers to update their own comments
CREATE POLICY "Customers can update their own edit comments"
  ON edit_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy for employees to update any comments
CREATE POLICY "Employees can update any edit comments"
  ON edit_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.status = 'active'
    )
  );