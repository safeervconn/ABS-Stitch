/*
  # Add company_name to customers table

  1. Schema Changes
    - Add `company_name` column to `customers` table
    - Column is optional (nullable) to support existing records

  2. Notes
    - This migration adds support for company names in customer profiles
    - Existing customers will have NULL company_name until updated
*/

-- Add company_name column to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN company_name text;
  END IF;
END $$;