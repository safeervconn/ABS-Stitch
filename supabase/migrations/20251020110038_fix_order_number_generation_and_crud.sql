/*
  # Fix Order Number Generation and CRUD Operations

  ## Problem
  - Orders table is missing automatic order number generation
  - The `generate_order_number()` function is referenced but doesn't exist
  - Order and product creation fails due to missing functions

  ## Changes
  1. Create `generate_order_number()` function that:
     - Generates unique order numbers in format ORD-YYYYMMDD-XXXX
     - XXXX is a sequential number that resets daily
  
  2. Add trigger to auto-generate order numbers on insert
  
  3. Create supporting database objects for CRUD operations
  
  ## Security
  - Functions are SECURITY DEFINER to allow order number generation
  - RLS policies remain in place for access control
*/

-- Drop existing function if it exists (with different name)
DROP FUNCTION IF EXISTS auto_generate_order_number() CASCADE;

-- Create sequence for daily order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today_str TEXT;
  seq_num INTEGER;
  order_num TEXT;
  max_existing INTEGER;
BEGIN
  -- Get today's date in YYYYMMDD format
  today_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- Check if there are any orders today and get the max number
  SELECT COALESCE(MAX(
    CASE 
      WHEN order_number LIKE 'ORD-' || today_str || '-%' 
      THEN CAST(SUBSTRING(order_number FROM LENGTH('ORD-' || today_str || '-') + 1) AS INTEGER)
      ELSE 0
    END
  ), 0) INTO max_existing
  FROM orders;
  
  -- Increment from the max existing number
  seq_num := max_existing + 1;
  
  -- Format: ORD-YYYYMMDD-XXXX (padded to 4 digits)
  order_num := 'ORD-' || today_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically set order_number before insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;

-- Create trigger to auto-generate order numbers
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION set_order_number() TO authenticated;

-- Add helper functions for checking roles (if they don't exist)
CREATE OR REPLACE FUNCTION is_designer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees
    WHERE id = auth.uid()
    AND role = 'designer'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM customers
    WHERE id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is an employee
  SELECT role INTO user_role
  FROM employees
  WHERE id = auth.uid() AND status = 'active';
  
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Check if user is a customer
  IF EXISTS (SELECT 1 FROM customers WHERE id = auth.uid() AND status = 'active') THEN
    RETURN 'customer';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_designer() TO authenticated;
GRANT EXECUTE ON FUNCTION is_customer() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
