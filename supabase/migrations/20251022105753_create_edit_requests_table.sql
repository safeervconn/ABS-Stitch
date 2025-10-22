/*
  # Create Edit Requests Table

  1. New Tables
    - `edit_requests`
      - `id` (uuid, primary key) - Unique identifier for the edit request
      - `order_id` (uuid, foreign key) - Reference to the order being edited
      - `customer_id` (uuid, foreign key) - Reference to the customer requesting the edit
      - `description` (text) - Description of the requested changes
      - `status` (text) - Status of the edit request (pending, approved, rejected, completed)
      - `designer_notes` (text, nullable) - Notes from the designer
      - `created_at` (timestamptz) - When the request was created
      - `updated_at` (timestamptz) - When the request was last updated
      - `resolved_at` (timestamptz, nullable) - When the request was resolved
      - `resolved_by` (uuid, nullable) - Employee who resolved the request

  2. Security
    - Enable RLS on `edit_requests` table
    - Add policy for customers to create edit requests for their own orders
    - Add policy for customers to view their own edit requests
    - Add policy for designers and admins to view all edit requests
    - Add policy for designers and admins to update edit requests
    
  3. Indexes
    - Add index on order_id for faster lookups
    - Add index on customer_id for customer dashboard queries
    - Add index on status for filtering pending requests
*/

-- Create edit_requests table
CREATE TABLE IF NOT EXISTS edit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  designer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES employees(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_edit_requests_order_id ON edit_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_edit_requests_customer_id ON edit_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_edit_requests_status ON edit_requests(status);

-- Enable RLS
ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;

-- Policy for customers to create edit requests for their own orders
CREATE POLICY "Customers can create edit requests for their orders"
  ON edit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Policy for customers to view their own edit requests
CREATE POLICY "Customers can view their own edit requests"
  ON edit_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Policy for designers and admins to view all edit requests
CREATE POLICY "Designers and admins can view all edit requests"
  ON edit_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('designer', 'admin')
      AND employees.status = 'active'
    )
  );

-- Policy for designers and admins to update edit requests
CREATE POLICY "Designers and admins can update edit requests"
  ON edit_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('designer', 'admin')
      AND employees.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('designer', 'admin')
      AND employees.status = 'active'
    )
  );

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_edit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_edit_requests_updated_at_trigger
  BEFORE UPDATE ON edit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_edit_requests_updated_at();