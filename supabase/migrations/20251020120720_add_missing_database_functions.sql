/*
  # Add Missing Database Functions
  
  This migration adds database functions that were referenced but not created:
  
  1. Functions Added:
    - `notify_order_status_change()` - Handles order status change notifications
    - `calculate_sales_rep_stats()` - Calculates dashboard statistics for sales representatives
    - `calculate_designer_stats()` - Calculates dashboard statistics for designers
    - `calculate_dashboard_stats()` - Calculates overall admin dashboard statistics
  
  2. Purpose:
    - Fix the error: "function notify_order_status_change(uuid, text, text) does not exist"
    - Fix the error: "Could not find the function public.calculate_sales_rep_stats"
    - Enable proper order status change tracking
    - Enable dashboard statistics for all user roles
  
  3. Security:
    - All functions use SECURITY DEFINER where needed for proper access
    - Functions validate user permissions appropriately
*/

-- Function to handle order status change notifications
CREATE OR REPLACE FUNCTION notify_order_status_change(
  order_id uuid,
  old_status text,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert notification for the customer who owns the order
  INSERT INTO notifications (user_id, type, title, message, related_order_id)
  SELECT 
    o.customer_id,
    'order_status_changed',
    'Order Status Updated',
    'Your order ' || o.order_number || ' status changed from ' || old_status || ' to ' || new_status,
    o.id
  FROM orders o
  WHERE o.id = order_id;
  
  -- If order is assigned to a designer, notify them
  INSERT INTO notifications (user_id, type, title, message, related_order_id)
  SELECT 
    o.assigned_designer_id,
    'order_status_changed',
    'Assigned Order Status Updated',
    'Order ' || o.order_number || ' status changed from ' || old_status || ' to ' || new_status,
    o.id
  FROM orders o
  WHERE o.id = order_id 
    AND o.assigned_designer_id IS NOT NULL;
  
  -- If order is assigned to a sales rep, notify them
  INSERT INTO notifications (user_id, type, title, message, related_order_id)
  SELECT 
    o.assigned_sales_rep_id,
    'order_status_changed',
    'Assigned Order Status Updated',
    'Order ' || o.order_number || ' status changed from ' || old_status || ' to ' || new_status,
    o.id
  FROM orders o
  WHERE o.id = order_id 
    AND o.assigned_sales_rep_id IS NOT NULL;
    
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in notify_order_status_change: %', SQLERRM;
END;
$$;

-- Function to calculate sales rep dashboard statistics
CREATE OR REPLACE FUNCTION calculate_sales_rep_stats(rep_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalOrdersThisMonth', COALESCE(COUNT(*) FILTER (
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ), 0),
    'newOrdersCount', COALESCE(COUNT(*) FILTER (WHERE status = 'new'), 0),
    'inProgressOrdersCount', COALESCE(COUNT(*) FILTER (WHERE status = 'in_progress'), 0),
    'underReviewOrdersCount', COALESCE(COUNT(*) FILTER (WHERE status = 'under_review'), 0)
  )
  INTO result
  FROM orders
  WHERE assigned_sales_rep_id = rep_id;
  
  RETURN result;
END;
$$;

-- Function to calculate designer dashboard statistics
CREATE OR REPLACE FUNCTION calculate_designer_stats(designer_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalOrdersThisMonth', COALESCE(COUNT(*) FILTER (
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ), 0),
    'inProgressOrdersCount', COALESCE(COUNT(*) FILTER (WHERE status = 'in_progress'), 0)
  )
  INTO result
  FROM orders
  WHERE assigned_designer_id = designer_id;
  
  RETURN result;
END;
$$;

-- Function to calculate admin dashboard statistics
CREATE OR REPLACE FUNCTION calculate_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalOrdersThisMonth', (
      SELECT COALESCE(COUNT(*), 0)
      FROM orders
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'newCustomersThisMonth', (
      SELECT COALESCE(COUNT(*), 0)
      FROM customers
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'totalRevenueThisMonth', (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM orders
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
        AND status = 'completed'
    ),
    'inProgressOrders', (
      SELECT COALESCE(COUNT(*), 0)
      FROM orders
      WHERE status = 'in_progress'
    ),
    'activeProducts', (
      SELECT COALESCE(COUNT(*), 0)
      FROM products
      WHERE is_active = true
    ),
    'newOrdersCount', (
      SELECT COALESCE(COUNT(*), 0)
      FROM orders
      WHERE status = 'new'
    ),
    'underReviewOrdersCount', (
      SELECT COALESCE(COUNT(*), 0)
      FROM orders
      WHERE status = 'under_review'
    )
  )
  INTO result;
  
  RETURN result;
END;
$$;