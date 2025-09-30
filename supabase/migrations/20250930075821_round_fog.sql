/*
  # Update Orders Schema and Status Constraints

  1. Schema Changes
    - Set default value for `total_amount` to 0 instead of NULL
    - Update order status constraint to only allow: 'unassigned', 'in_progress', 'under_review', 'completed', 'cancelled'
  
  2. Data Migration
    - Update existing orders with NULL total_amount to 0
    - Update existing orders with old statuses to new equivalent statuses
  
  3. Security
    - No changes to existing RLS policies
*/

-- Update total_amount default value
DO $$
BEGIN
  -- First update existing NULL values to 0
  UPDATE orders SET total_amount = 0 WHERE total_amount IS NULL;
  
  -- Then alter the column to set default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ALTER COLUMN total_amount SET DEFAULT 0;
  END IF;
END $$;

-- Update existing order statuses to new simplified statuses
UPDATE orders 
SET status = CASE 
  WHEN status IN ('pending', 'assigned_to_sales', 'assigned_to_designer') THEN 'unassigned'
  WHEN status = 'in_progress' THEN 'in_progress'
  WHEN status = 'under_review' THEN 'under_review'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'archived' THEN 'cancelled'
  ELSE 'unassigned'
END
WHERE status NOT IN ('unassigned', 'in_progress', 'under_review', 'completed', 'cancelled');

-- Drop existing status constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_status_check' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_status_check;
  END IF;
END $$;

-- Add new status constraint
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['unassigned'::text, 'in_progress'::text, 'under_review'::text, 'completed'::text, 'cancelled'::text]));