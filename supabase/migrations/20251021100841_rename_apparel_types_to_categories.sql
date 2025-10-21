/*
  # Rename apparel_types table to categories

  1. Changes
    - Rename table `apparel_types` to `categories`
    - Rename column `type_name` to `category_name` in categories table
    - Rename column `apparel_type_id` to `category_id` in orders table
    - Rename column `apparel_type_id` to `category_id` in products table
    - Rename column `apparel_type_name` to `category_name` in orders_with_details view
    - Update all foreign key constraints accordingly
  
  2. Security
    - All existing RLS policies on apparel_types will be automatically transferred to categories table
    - Foreign key relationships maintained with orders and products tables
*/

-- Drop the orders_with_details view temporarily
DROP VIEW IF EXISTS orders_with_details;

-- Rename the apparel_types table to categories
ALTER TABLE IF EXISTS apparel_types RENAME TO categories;

-- Rename the type_name column to category_name in categories table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'type_name'
  ) THEN
    ALTER TABLE categories RENAME COLUMN type_name TO category_name;
  END IF;
END $$;

-- Rename apparel_type_id to category_id in orders table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'apparel_type_id'
  ) THEN
    ALTER TABLE orders RENAME COLUMN apparel_type_id TO category_id;
  END IF;
END $$;

-- Rename apparel_type_id to category_id in products table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'apparel_type_id'
  ) THEN
    ALTER TABLE products RENAME COLUMN apparel_type_id TO category_id;
  END IF;
END $$;

-- Recreate the orders_with_details view with updated column names
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
  o.*,
  c.full_name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.company_name AS customer_company_name,
  p.title AS product_title,
  cat.category_name AS category_name,
  sr.full_name AS sales_rep_name,
  d.full_name AS designer_name,
  (
    SELECT oa.id 
    FROM order_attachments oa 
    WHERE oa.order_id = o.id 
    ORDER BY oa.created_at ASC 
    LIMIT 1
  ) AS first_attachment_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN products p ON o.product_id = p.id
LEFT JOIN categories cat ON o.category_id = cat.id
LEFT JOIN employees sr ON o.assigned_sales_rep_id = sr.id
LEFT JOIN employees d ON o.assigned_designer_id = d.id;
