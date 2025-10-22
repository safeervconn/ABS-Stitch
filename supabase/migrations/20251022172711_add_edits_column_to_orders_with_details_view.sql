/*
  # Add edits column to orders_with_details view

  1. Changes
    - Drop and recreate the orders_with_details view to include the edits column
    - This ensures the edit count is available when fetching order data

  2. Notes
    - The view joins orders with customers, stock_designs, categories, employees (sales reps and designers)
    - Now includes the edits column from the orders table
*/

-- Drop the existing view
DROP VIEW IF EXISTS orders_with_details;

-- Recreate the view with the edits column
CREATE VIEW orders_with_details AS
SELECT 
  o.id,
  o.customer_id,
  o.stock_design_id,
  o.custom_description,
  o.status,
  o.assigned_sales_rep_id,
  o.assigned_designer_id,
  o.created_at,
  o.updated_at,
  o.order_type,
  o.order_number,
  o.order_name,
  o.total_amount,
  o.custom_width,
  o.custom_height,
  o.payment_status,
  o.category_id,
  o.edits,
  c.full_name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.company_name AS customer_company_name,
  sd.title AS stock_design_title,
  cat.category_name,
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
LEFT JOIN stock_designs sd ON o.stock_design_id = sd.id
LEFT JOIN categories cat ON o.category_id = cat.id
LEFT JOIN employees sr ON o.assigned_sales_rep_id = sr.id
LEFT JOIN employees d ON o.assigned_designer_id = d.id;
