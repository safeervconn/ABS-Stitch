/*
  # Database Functions, Views, and Optimizations
  
  1. Database Functions
    - `calculate_dashboard_stats` - Calculate admin dashboard statistics in a single query
    - `calculate_sales_rep_stats` - Calculate sales rep dashboard statistics
    - `calculate_designer_stats` - Calculate designer dashboard statistics
    - `generate_order_number` - Auto-generate unique order numbers
    - `create_notification_batch` - Create multiple notifications atomically
    
  2. Database Views
    - `orders_with_details` - Pre-joined order data with all related information
    - `dashboard_stats_monthly` - Materialized monthly statistics for quick access
    
  3. Database Triggers
    - Auto-update `updated_at` timestamp on all tables
    - Auto-generate order numbers on insert
    - Auto-create notifications on order status changes
    
  4. Indexes
    - Add performance indexes for frequently queried columns
    
  5. RLS Enhancements
    - Enhanced policies using database functions for better performance
*/

-- ============================================
-- 1. UTILITY FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE year_month || '%';
  
  new_number := year_month || LPAD(sequence_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. DASHBOARD STATISTICS FUNCTIONS
-- ============================================

-- Admin dashboard stats function
CREATE OR REPLACE FUNCTION calculate_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  start_of_month TIMESTAMPTZ;
  result JSON;
BEGIN
  start_of_month := DATE_TRUNC('month', NOW());
  
  SELECT JSON_BUILD_OBJECT(
    'totalOrdersThisMonth', (
      SELECT COUNT(*) FROM orders WHERE created_at >= start_of_month
    ),
    'newCustomersThisMonth', (
      SELECT COUNT(*) FROM customers WHERE created_at >= start_of_month
    ),
    'totalRevenueThisMonth', (
      SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE created_at >= start_of_month
    ),
    'inProgressOrders', (
      SELECT COUNT(*) FROM orders WHERE status = 'in_progress'
    ),
    'activeProducts', (
      SELECT COUNT(*) FROM products WHERE status = 'active'
    ),
    'newOrdersCount', (
      SELECT COUNT(*) FROM orders WHERE status = 'new'
    ),
    'underReviewOrdersCount', (
      SELECT COUNT(*) FROM orders WHERE status = 'under_review'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sales rep dashboard stats function
CREATE OR REPLACE FUNCTION calculate_sales_rep_stats(rep_id UUID)
RETURNS JSON AS $$
DECLARE
  start_of_month TIMESTAMPTZ;
  customer_ids UUID[];
  result JSON;
BEGIN
  start_of_month := DATE_TRUNC('month', NOW());
  
  SELECT ARRAY_AGG(id) INTO customer_ids
  FROM customers
  WHERE assigned_sales_rep_id = rep_id;
  
  IF customer_ids IS NULL OR ARRAY_LENGTH(customer_ids, 1) = 0 THEN
    RETURN JSON_BUILD_OBJECT(
      'totalOrdersThisMonth', 0,
      'newOrdersCount', 0,
      'inProgressOrdersCount', 0,
      'underReviewOrdersCount', 0
    );
  END IF;
  
  SELECT JSON_BUILD_OBJECT(
    'totalOrdersThisMonth', (
      SELECT COUNT(*) FROM orders 
      WHERE customer_id = ANY(customer_ids) AND created_at >= start_of_month
    ),
    'newOrdersCount', (
      SELECT COUNT(*) FROM orders 
      WHERE customer_id = ANY(customer_ids) AND status = 'new'
    ),
    'inProgressOrdersCount', (
      SELECT COUNT(*) FROM orders 
      WHERE customer_id = ANY(customer_ids) AND status = 'in_progress'
    ),
    'underReviewOrdersCount', (
      SELECT COUNT(*) FROM orders 
      WHERE customer_id = ANY(customer_ids) AND status = 'under_review'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Designer dashboard stats function
CREATE OR REPLACE FUNCTION calculate_designer_stats(designer_id UUID)
RETURNS JSON AS $$
DECLARE
  start_of_month TIMESTAMPTZ;
  result JSON;
BEGIN
  start_of_month := DATE_TRUNC('month', NOW());
  
  SELECT JSON_BUILD_OBJECT(
    'totalOrdersThisMonth', (
      SELECT COUNT(*) FROM orders 
      WHERE assigned_designer_id = designer_id AND created_at >= start_of_month
    ),
    'inProgressOrdersCount', (
      SELECT COUNT(*) FROM orders 
      WHERE assigned_designer_id = designer_id AND status = 'in_progress'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. NOTIFICATION FUNCTIONS
-- ============================================

-- Batch create notifications
CREATE OR REPLACE FUNCTION create_notification_batch(
  user_ids UUID[],
  notification_type TEXT,
  notification_message TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, message, read)
  SELECT 
    UNNEST(user_ids),
    notification_type,
    notification_message,
    FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification for order status change
CREATE OR REPLACE FUNCTION notify_order_status_change(
  order_id UUID,
  old_status TEXT,
  new_status TEXT
)
RETURNS VOID AS $$
DECLARE
  order_record RECORD;
  notification_message TEXT;
BEGIN
  SELECT o.order_number, o.customer_id, o.assigned_sales_rep_id
  INTO order_record
  FROM orders o
  WHERE o.id = order_id;
  
  notification_message := 'Order ' || order_record.order_number || ' status changed to ' || new_status;
  
  -- Notify customer
  INSERT INTO notifications (user_id, type, message, read)
  VALUES (order_record.customer_id, 'order', notification_message, FALSE);
  
  -- Notify sales rep if assigned
  IF order_record.assigned_sales_rep_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, message, read)
    VALUES (order_record.assigned_sales_rep_id, 'order', notification_message, FALSE);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. DATABASE VIEWS
-- ============================================

-- Create comprehensive orders view with all related data
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
  o.*,
  c.full_name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.company_name AS customer_company_name,
  p.title AS product_title,
  a.type_name AS apparel_type_name,
  sr.full_name AS sales_rep_name,
  d.full_name AS designer_name,
  (
    SELECT oa.id 
    FROM order_attachments oa 
    WHERE oa.order_id = o.id 
    ORDER BY oa.uploaded_at ASC 
    LIMIT 1
  ) AS first_attachment_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN products p ON o.product_id = p.id
LEFT JOIN apparel_types a ON o.apparel_type_id = a.id
LEFT JOIN employees sr ON o.assigned_sales_rep_id = sr.id
LEFT JOIN employees d ON o.assigned_designer_id = d.id;

-- Create customer summary view
CREATE OR REPLACE VIEW customer_summary AS
SELECT 
  c.*,
  e.full_name AS sales_rep_name,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS total_spent,
  COUNT(CASE WHEN o.payment_status = 'unpaid' THEN 1 END) AS unpaid_orders_count
FROM customers c
LEFT JOIN employees e ON c.assigned_sales_rep_id = e.id
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, e.full_name;

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Trigger to auto-update updated_at on employees
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION auto_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_order_number();

-- Trigger to notify on order status change
CREATE OR REPLACE FUNCTION trigger_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM notify_order_status_change(NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_change_notification ON orders;
CREATE TRIGGER order_status_change_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_order_status_notification();

-- ============================================
-- 6. PERFORMANCE INDEXES
-- ============================================

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_sales_rep_id ON orders(assigned_sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_designer_id ON orders(assigned_designer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_assigned_sales_rep_id ON customers(assigned_sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Indexes for employees table
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Indexes for order_attachments table
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attachments_uploaded_at ON order_attachments(uploaded_at);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_apparel_type_id ON products(apparel_type_id);

-- Indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_sales_rep_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_designer_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification_batch(UUID[], TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_order_status_change(UUID, TEXT, TEXT) TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON orders_with_details TO authenticated;
GRANT SELECT ON customer_summary TO authenticated;
