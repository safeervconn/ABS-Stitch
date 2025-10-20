/*
  # Update orders_with_details view to include order_name

  1. Changes
    - Drop existing orders_with_details view
    - Recreate view with order_name field included
  
  2. Notes
    - This ensures order_name is available in all queries using the view
    - No data is lost, only the view definition is updated
    - Removed invoice_url field as it doesn't exist in orders table
*/

-- Drop existing view
DROP VIEW IF EXISTS orders_with_details;

-- Recreate view with order_name field
CREATE VIEW orders_with_details AS
SELECT 
  o.id,
  o.order_number,
  o.order_name,
  o.order_type,
  o.customer_id,
  o.product_id,
  o.custom_description,
  o.apparel_type_id,
  o.custom_width,
  o.custom_height,
  o.total_amount,
  o.payment_status,
  o.status,
  o.assigned_sales_rep_id,
  o.assigned_designer_id,
  o.created_at,
  o.updated_at,
  c.full_name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  c.company_name as customer_company_name,
  p.title as product_title,
  at.type_name as apparel_type_name,
  sr.full_name as sales_rep_name,
  d.full_name as designer_name,
  oa.id as first_attachment_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN products p ON o.product_id = p.id
LEFT JOIN apparel_types at ON o.apparel_type_id = at.id
LEFT JOIN employees sr ON o.assigned_sales_rep_id = sr.id
LEFT JOIN employees d ON o.assigned_designer_id = d.id
LEFT JOIN LATERAL (
  SELECT id
  FROM order_attachments
  WHERE order_id = o.id
  ORDER BY created_at ASC
  LIMIT 1
) oa ON true;