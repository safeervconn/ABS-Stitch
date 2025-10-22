/*
  # Add Edit Request Support to Orders Table

  1. Changes to Tables
    - `orders`
      - Add `edits` column (integer, default 0) - Tracks the number of edit requests submitted for this order
      
  2. Notes
    - This column increments each time a customer submits an edit request after order completion
    - Helps track how many times an order has been revised
*/

-- Add edits column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'edits'
  ) THEN
    ALTER TABLE orders ADD COLUMN edits integer NOT NULL DEFAULT 0;
  END IF;
END $$;
