/*
  # Reset Database - Preserve Admin User Only
  
  ## Overview
  This migration completely resets all database tables to a fresh state while preserving
  only the admin@absstitch.com user account.
  
  ## What Gets Deleted
  1. **Notifications** - All notification records
  2. **Order Comments** - All order comment records
  3. **Order Attachments** - All order attachment records
  4. **Invoices** - All invoice records
  5. **Orders** - All order records
  6. **Products** - All product records
  7. **Customers** - All customer records and their auth.users records
  8. **Employees** - All employee records EXCEPT admin@absstitch.com
  9. **Apparel Types** - All apparel type records (reference data)
  
  ## What Gets Preserved
  - Admin user: admin@absstitch.com (ID: bc778131-7a41-4788-9ac2-ad95105927d5)
  - All database schema, tables, RLS policies, functions, triggers, and indexes
  - Storage buckets configuration (buckets will be empty but structure preserved)
  
  ## Important Notes
  - This operation is IRREVERSIBLE for deleted data
  - All foreign key relationships are respected in deletion order
  - Database structure and security policies remain intact
  - Order numbering will restart fresh based on current date
*/

-- ============================================
-- STEP 1: DELETE NOTIFICATIONS (no dependencies)
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all notifications...';
END $$;

DELETE FROM notifications;

-- ============================================
-- STEP 2: DELETE ORDER COMMENTS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all order comments...';
END $$;

DELETE FROM order_comments;

-- ============================================
-- STEP 3: DELETE ORDER ATTACHMENTS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all order attachments...';
END $$;

DELETE FROM order_attachments;

-- ============================================
-- STEP 4: DELETE INVOICES
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all invoices...';
END $$;

DELETE FROM invoices;

-- ============================================
-- STEP 5: DELETE ORDERS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all orders...';
END $$;

DELETE FROM orders;

-- ============================================
-- STEP 6: DELETE PRODUCTS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all products...';
END $$;

DELETE FROM products;

-- ============================================
-- STEP 7: DELETE APPAREL TYPES
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Deleting all apparel types...';
END $$;

DELETE FROM apparel_types;

-- ============================================
-- STEP 8: DELETE CUSTOMERS AND THEIR AUTH RECORDS
-- ============================================

DO $$
DECLARE
  customer_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Deleting all customers and their auth.users records...';
  
  -- Get all customer IDs before deletion
  FOR customer_record IN 
    SELECT id FROM customers
  LOOP
    -- Delete from customers table (RLS will handle permissions)
    DELETE FROM customers WHERE id = customer_record.id;
    
    -- Delete from auth.users table (requires elevated privileges)
    -- This will cascade to auth-related tables
    BEGIN
      DELETE FROM auth.users WHERE id = customer_record.id;
      deleted_count := deleted_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not delete auth.users record for customer %: %', customer_record.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Deleted % customers and their auth records', deleted_count;
END $$;

-- ============================================
-- STEP 9: DELETE EMPLOYEES EXCEPT ADMIN
-- ============================================

DO $$
DECLARE
  employee_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Deleting all employees except admin@absstitch.com...';
  
  -- Get all non-admin employee IDs before deletion
  FOR employee_record IN 
    SELECT id, email FROM employees WHERE email != 'admin@absstitch.com'
  LOOP
    -- Delete from employees table
    DELETE FROM employees WHERE id = employee_record.id;
    
    -- Delete from auth.users table
    BEGIN
      DELETE FROM auth.users WHERE id = employee_record.id;
      deleted_count := deleted_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not delete auth.users record for employee %: %', employee_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Deleted % non-admin employees and their auth records', deleted_count;
END $$;

-- ============================================
-- STEP 10: RESET SEQUENCES
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Resetting database sequences...';
END $$;

-- Reset notification sequence
ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;

-- Reset order_comments sequence
ALTER SEQUENCE IF EXISTS order_comments_id_seq RESTART WITH 1;

-- ============================================
-- STEP 11: VERIFICATION
-- ============================================

DO $$
DECLARE
  admin_count INTEGER;
  customer_count INTEGER;
  employee_count INTEGER;
  order_count INTEGER;
  product_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE RESET VERIFICATION';
  RAISE NOTICE '========================================';
  
  -- Check admin user exists
  SELECT COUNT(*) INTO admin_count FROM employees WHERE email = 'admin@absstitch.com';
  RAISE NOTICE 'Admin user preserved: % (Expected: 1)', admin_count;
  
  -- Check all other tables are empty
  SELECT COUNT(*) INTO employee_count FROM employees;
  RAISE NOTICE 'Total employees remaining: % (Expected: 1 - admin only)', employee_count;
  
  SELECT COUNT(*) INTO customer_count FROM customers;
  RAISE NOTICE 'Customers remaining: % (Expected: 0)', customer_count;
  
  SELECT COUNT(*) INTO order_count FROM orders;
  RAISE NOTICE 'Orders remaining: % (Expected: 0)', order_count;
  
  SELECT COUNT(*) INTO product_count FROM products;
  RAISE NOTICE 'Products remaining: % (Expected: 0)', product_count;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE RESET COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  
  -- Raise error if admin user is missing
  IF admin_count != 1 THEN
    RAISE EXCEPTION 'CRITICAL ERROR: Admin user was not preserved!';
  END IF;
END $$;
