/*
  # Fix Designer Access to Customer Data
  
  ## Issue
  Designers cannot view orders on their dashboard because they lack permission 
  to access customer data via JOIN operations.
  
  ## Changes
  1. Add RLS policy to allow designers to view customer information for orders assigned to them
  2. This enables the orders query with customer JOIN to work for designers
  
  ## Security
  - Designers can only see customer data for orders where they are the assigned designer
  - Customer PII remains protected for unrelated orders
*/

-- Allow designers to view customer data for their assigned orders
CREATE POLICY "customers_select_assigned_designer"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.customer_id = customers.id
        AND orders.assigned_designer_id = auth.uid()
    )
  );
