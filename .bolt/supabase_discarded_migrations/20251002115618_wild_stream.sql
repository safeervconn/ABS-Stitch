/*
  # Add Designer Access to Customer Data

  1. Security Policy
    - Add RLS policy allowing designers to read customer data for their assigned orders
    - This enables designers to see order details including customer information

  2. Purpose
    - Fixes the issue where designers cannot see order lists due to RLS restrictions
    - Maintains security by only allowing access to customers linked to designer's orders
*/

-- Add policy for designers to read customers for their assigned orders
CREATE POLICY "Designers can read customers for their assigned orders"
ON public.customers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.customer_id = customers.id
    AND orders.assigned_designer_id = auth.uid()
  )
);