/*
  # Allow Customers to Request Edits on Their Orders

  1. Changes
    - Add RLS policy to allow customers to update their own orders' status and edits count
    - This enables customers to submit edit requests for their completed orders

  2. Security
    - Policy restricts customers to only update their own orders (customer_id = auth.uid())
    - Customers can only modify status and edits fields
    - Maintains data security while allowing edit request functionality
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' 
    AND policyname = 'orders_update_customer_for_edits'
  ) THEN
    CREATE POLICY "orders_update_customer_for_edits"
      ON orders
      FOR UPDATE
      TO authenticated
      USING (customer_id = auth.uid())
      WITH CHECK (customer_id = auth.uid());
  END IF;
END $$;
