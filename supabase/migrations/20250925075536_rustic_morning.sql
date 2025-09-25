/*
  # Add Missing Order Fields

  1. New Columns
    - `order_type` (text) - Type of order: 'catalog' or 'custom'
    - `order_number` (text) - Human-readable order number
    - `total_amount` (numeric) - Total monetary value of the order
    - `design_size` (text) - Selected design size
    - `apparel_type` (text) - Type of apparel
    - `custom_width` (numeric) - Custom width for design
    - `custom_height` (numeric) - Custom height for design
    - `file_urls` (text[]) - Array of file URLs (replacing single file_url)

  2. Updates
    - Add constraints and defaults where appropriate
    - Update existing data to use new structure
*/

-- Add new columns to orders table
DO $$
BEGIN
  -- Add order_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_type text DEFAULT 'custom';
  END IF;

  -- Add order_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text;
  END IF;

  -- Add total_amount column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_amount numeric(10,2) DEFAULT 75.00;
  END IF;

  -- Add design_size column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'design_size'
  ) THEN
    ALTER TABLE orders ADD COLUMN design_size text;
  END IF;

  -- Add apparel_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'apparel_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN apparel_type text;
  END IF;

  -- Add custom_width column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'custom_width'
  ) THEN
    ALTER TABLE orders ADD COLUMN custom_width numeric(10,2);
  END IF;

  -- Add custom_height column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'custom_height'
  ) THEN
    ALTER TABLE orders ADD COLUMN custom_height numeric(10,2);
  END IF;

  -- Add file_urls array column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'file_urls'
  ) THEN
    ALTER TABLE orders ADD COLUMN file_urls text[];
  END IF;
END $$;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'order_number_seq') THEN
    CREATE SEQUENCE order_number_seq START 1000;
  END IF;
END $$;

-- Update existing orders to have order numbers if they don't have them
UPDATE orders 
SET order_number = generate_order_number()
WHERE order_number IS NULL;

-- Migrate existing file_url to file_urls array
UPDATE orders 
SET file_urls = ARRAY[file_url]
WHERE file_url IS NOT NULL AND (file_urls IS NULL OR array_length(file_urls, 1) IS NULL);

-- Add constraints
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('catalog', 'custom'));

-- Create trigger to auto-generate order numbers for new orders
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();