/*
  # Enhanced Row Level Security Policies
  
  1. Helper Functions for RLS
    - `is_admin()` - Check if current user is an admin
    - `is_sales_rep()` - Check if current user is a sales rep
    - `is_designer()` - Check if current user is a designer
    - `is_customer()` - Check if current user is a customer
    - `get_user_role()` - Get current user's role
    
  2. Enhanced RLS Policies
    - More efficient policies using helper functions
    - Proper separation of concerns
    - Better performance through function-based checks
*/

-- ============================================
-- 1. HELPER FUNCTIONS FOR RLS
-- ============================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is a sales rep
CREATE OR REPLACE FUNCTION is_sales_rep()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid() AND role = 'sales_rep' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is a designer
CREATE OR REPLACE FUNCTION is_designer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid() AND role = 'designer' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is a customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers
    WHERE id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM employees
  WHERE id = auth.uid() AND status = 'active';
  
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM customers WHERE id = auth.uid() AND status = 'active') THEN
    RETURN 'customer';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can manage customer
CREATE OR REPLACE FUNCTION can_manage_customer(customer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    is_admin() OR
    (is_sales_rep() AND EXISTS (
      SELECT 1 FROM customers
      WHERE id = customer_id AND assigned_sales_rep_id = auth.uid()
    ))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can view order
CREATE OR REPLACE FUNCTION can_view_order(order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  order_record RECORD;
BEGIN
  SELECT customer_id, assigned_sales_rep_id, assigned_designer_id
  INTO order_record
  FROM orders
  WHERE id = order_id;
  
  RETURN (
    is_admin() OR
    order_record.customer_id = auth.uid() OR
    order_record.assigned_sales_rep_id = auth.uid() OR
    order_record.assigned_designer_id = auth.uid() OR
    (is_sales_rep() AND EXISTS (
      SELECT 1 FROM customers
      WHERE id = order_record.customer_id AND assigned_sales_rep_id = auth.uid()
    ))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 2. DROP EXISTING POLICIES
-- ============================================

-- Orders policies
DROP POLICY IF EXISTS "Employees can view all orders" ON orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Employees can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins and sales reps can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

-- Customers policies
DROP POLICY IF EXISTS "Employees can view all customers" ON customers;
DROP POLICY IF EXISTS "Customers can view own profile" ON customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins and sales reps can update customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;

-- Employees policies
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view own profile" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Order attachments policies
DROP POLICY IF EXISTS "Users can view order attachments" ON order_attachments;
DROP POLICY IF EXISTS "Users can insert order attachments" ON order_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON order_attachments;

-- ============================================
-- 3. CREATE ENHANCED RLS POLICIES
-- ============================================

-- Orders Policies
CREATE POLICY "Orders select policy"
  ON orders FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    customer_id = auth.uid() OR
    assigned_sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid() OR
    (is_sales_rep() AND customer_id IN (
      SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
    ))
  );

CREATE POLICY "Orders insert policy"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() OR is_sales_rep() OR is_customer()
  );

CREATE POLICY "Orders update policy"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    is_admin() OR
    assigned_sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid() OR
    (is_sales_rep() AND customer_id IN (
      SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
    ))
  )
  WITH CHECK (
    is_admin() OR
    assigned_sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid() OR
    (is_sales_rep() AND customer_id IN (
      SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
    ))
  );

CREATE POLICY "Orders delete policy"
  ON orders FOR DELETE
  TO authenticated
  USING (is_admin());

-- Customers Policies
CREATE POLICY "Customers select policy"
  ON customers FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    is_sales_rep() OR
    id = auth.uid()
  );

CREATE POLICY "Customers insert policy"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR is_sales_rep());

CREATE POLICY "Customers update policy"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    is_admin() OR
    (is_sales_rep() AND assigned_sales_rep_id = auth.uid()) OR
    id = auth.uid()
  )
  WITH CHECK (
    is_admin() OR
    (is_sales_rep() AND assigned_sales_rep_id = auth.uid()) OR
    id = auth.uid()
  );

CREATE POLICY "Customers delete policy"
  ON customers FOR DELETE
  TO authenticated
  USING (is_admin());

-- Employees Policies
CREATE POLICY "Employees select policy"
  ON employees FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    id = auth.uid()
  );

CREATE POLICY "Employees insert policy"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Employees update policy"
  ON employees FOR UPDATE
  TO authenticated
  USING (is_admin() OR id = auth.uid())
  WITH CHECK (is_admin() OR id = auth.uid());

CREATE POLICY "Employees delete policy"
  ON employees FOR DELETE
  TO authenticated
  USING (is_admin());

-- Products Policies
CREATE POLICY "Products select policy"
  ON products FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Products insert policy"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Products update policy"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Products delete policy"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- Apparel Types Policies
CREATE POLICY "Apparel types select policy"
  ON apparel_types FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Apparel types insert policy"
  ON apparel_types FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Apparel types update policy"
  ON apparel_types FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Apparel types delete policy"
  ON apparel_types FOR DELETE
  TO authenticated
  USING (is_admin());

-- Invoices Policies
CREATE POLICY "Invoices select policy"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    is_sales_rep() OR
    customer_id = auth.uid()
  );

CREATE POLICY "Invoices insert policy"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR is_sales_rep());

CREATE POLICY "Invoices update policy"
  ON invoices FOR UPDATE
  TO authenticated
  USING (is_admin() OR is_sales_rep())
  WITH CHECK (is_admin() OR is_sales_rep());

CREATE POLICY "Invoices delete policy"
  ON invoices FOR DELETE
  TO authenticated
  USING (is_admin());

-- Notifications Policies
CREATE POLICY "Notifications select policy"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Notifications insert policy"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Notifications update policy"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Notifications delete policy"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Order Attachments Policies
CREATE POLICY "Order attachments select policy"
  ON order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (
        is_admin() OR
        o.customer_id = auth.uid() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid() OR
        (is_sales_rep() AND o.customer_id IN (
          SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Order attachments insert policy"
  ON order_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (
        is_admin() OR
        o.customer_id = auth.uid() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid() OR
        (is_sales_rep() AND o.customer_id IN (
          SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Order attachments delete policy"
  ON order_attachments FOR DELETE
  TO authenticated
  USING (
    is_admin() OR
    uploaded_by = auth.uid()
  );

-- Order Comments Policies
CREATE POLICY "Order comments select policy"
  ON order_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (
        is_admin() OR
        o.customer_id = auth.uid() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid() OR
        (is_sales_rep() AND o.customer_id IN (
          SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Order comments insert policy"
  ON order_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (
        is_admin() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid() OR
        (is_sales_rep() AND o.customer_id IN (
          SELECT id FROM customers WHERE assigned_sales_rep_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Order comments delete policy"
  ON order_comments FOR DELETE
  TO authenticated
  USING (is_admin() OR author_id = auth.uid());

-- ============================================
-- 4. GRANT PERMISSIONS ON HELPER FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_sales_rep() TO authenticated;
GRANT EXECUTE ON FUNCTION is_designer() TO authenticated;
GRANT EXECUTE ON FUNCTION is_customer() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION can_manage_customer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_view_order(UUID) TO authenticated;
