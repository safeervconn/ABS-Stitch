/*
  # Add Order Name Field to Orders Table

  1. Changes
    - Add `order_name` column to `orders` table
      - Type: TEXT
      - Constraint: NOT NULL
      - Max length: 32 characters
      - Default for existing records: 'No Order Name'
    
  2. Data Migration
    - Update all existing orders to have default value 'No Order Name'
    - New orders will require order_name to be provided
  
  3. Notes
    - Order names do not need to be unique
    - Field will be searchable and displayed across all order views
    - Editable by admin and sales_rep roles only
*/

-- Add order_name column to orders table with temporary default
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_name TEXT;

-- Update existing orders with default value
UPDATE orders 
SET order_name = 'No Order Name' 
WHERE order_name IS NULL;

-- Make the column NOT NULL after populating existing records
ALTER TABLE orders 
ALTER COLUMN order_name SET NOT NULL;

-- Add check constraint for maximum length (32 characters)
ALTER TABLE orders 
ADD CONSTRAINT order_name_length_check 
CHECK (length(order_name) <= 32);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_orders_order_name ON orders(order_name);