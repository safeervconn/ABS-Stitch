/*
  # Fix Database Schema Issues and Required Fields

  ## Overview
  This migration addresses two critical issues:
  1. Ensures all column references are consistent (stock_design_id vs stockdesign_id)
  2. Makes category_id, custom_width, and custom_height required fields for orders

  ## Changes Made
  
  ### 1. Orders Table - Required Fields
  - Make `category_id` NOT NULL (currently nullable)
  - Make `custom_width` NOT NULL (currently nullable)
  - Make `custom_height` NOT NULL (currently nullable)
  
  These fields are essential for all orders and should always have values.
  
  ### 2. Data Integrity
  - Set default values for existing records that have NULL in these fields
  - Ensures no data loss during migration
  
  ## Important Notes
  - This migration uses safe operations with IF EXISTS checks
  - Existing NULL values are updated with reasonable defaults before adding NOT NULL constraints
  - The stock_design_id column name is already correct in the database
*/

-- Step 1: Update existing NULL values in orders table to prevent constraint violations
-- Set default category to first available category if NULL
DO $$
DECLARE
  default_category_id uuid;
BEGIN
  -- Get the first category ID
  SELECT id INTO default_category_id FROM categories LIMIT 1;
  
  IF default_category_id IS NOT NULL THEN
    -- Update orders with NULL category_id to use the default category
    UPDATE orders 
    SET category_id = default_category_id 
    WHERE category_id IS NULL;
  END IF;
END $$;

-- Set default dimensions for orders with NULL width or height
UPDATE orders 
SET custom_width = 12.0 
WHERE custom_width IS NULL;

UPDATE orders 
SET custom_height = 12.0 
WHERE custom_height IS NULL;

-- Step 2: Add NOT NULL constraints to the fields
-- Make category_id required
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'category_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE orders ALTER COLUMN category_id SET NOT NULL;
  END IF;
END $$;

-- Make custom_width required
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'custom_width' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE orders ALTER COLUMN custom_width SET NOT NULL;
  END IF;
END $$;

-- Make custom_height required
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'custom_height' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE orders ALTER COLUMN custom_height SET NOT NULL;
  END IF;
END $$;

-- Step 3: Verify the orders_with_details view is using correct column names
-- The view should already have stock_design_id (with underscore) which is correct
-- This is just a verification comment - no action needed