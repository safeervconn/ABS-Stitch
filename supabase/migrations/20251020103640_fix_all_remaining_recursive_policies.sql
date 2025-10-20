/*
  # Fix All Remaining Recursive RLS Policies

  1. Problem
    - Multiple tables still use subqueries to employees table
    - These can all cause infinite recursion
    - Tables affected: products, apparel_types, invoices, order_attachments, order_comments

  2. Solution
    - Replace all employee subqueries with helper functions
    - Use is_admin() and is_sales_rep() functions
    - Maintain security while removing recursion risk

  3. Changes
    - Update products policies
    - Update apparel_types policies
    - Update invoices policies
    - Update order_attachments policies
    - Update order_comments policies
*/

-- ============================================
-- PRODUCTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

-- Everyone can view active products
CREATE POLICY "products_select_all"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- APPAREL TYPES POLICIES
-- ============================================
DROP POLICY IF EXISTS "apparel_types_select" ON apparel_types;
DROP POLICY IF EXISTS "apparel_types_insert" ON apparel_types;
DROP POLICY IF EXISTS "apparel_types_update" ON apparel_types;
DROP POLICY IF EXISTS "apparel_types_delete" ON apparel_types;

-- Everyone can view apparel types
CREATE POLICY "apparel_types_select_all"
  ON apparel_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "apparel_types_insert_admin"
  ON apparel_types FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "apparel_types_update_admin"
  ON apparel_types FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "apparel_types_delete_admin"
  ON apparel_types FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- INVOICES POLICIES
-- ============================================
DROP POLICY IF EXISTS "invoices_select" ON invoices;
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "invoices_delete" ON invoices;

-- Customers can see their own invoices
CREATE POLICY "invoices_select_customer"
  ON invoices FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "invoices_select_admin"
  ON invoices FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "invoices_select_sales_rep"
  ON invoices FOR SELECT
  TO authenticated
  USING (is_sales_rep());

CREATE POLICY "invoices_insert_admin"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "invoices_insert_sales_rep"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (is_sales_rep());

CREATE POLICY "invoices_update_admin"
  ON invoices FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "invoices_update_sales_rep"
  ON invoices FOR UPDATE
  TO authenticated
  USING (is_sales_rep())
  WITH CHECK (is_sales_rep());

CREATE POLICY "invoices_delete_admin"
  ON invoices FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- ORDER ATTACHMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "order_attachments_select" ON order_attachments;
DROP POLICY IF EXISTS "order_attachments_insert" ON order_attachments;
DROP POLICY IF EXISTS "order_attachments_update" ON order_attachments;
DROP POLICY IF EXISTS "order_attachments_delete" ON order_attachments;

-- Users can see attachments for orders they have access to
CREATE POLICY "order_attachments_select"
  ON order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_attachments.order_id
      AND (
        o.customer_id = auth.uid() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid()
      )
    )
    OR is_admin()
  );

-- Users can upload attachments to orders they have access to
CREATE POLICY "order_attachments_insert"
  ON order_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_attachments.order_id
      AND (
        o.customer_id = auth.uid() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid()
      )
    )
    OR is_admin()
  );

-- Only admins and uploaders can delete
CREATE POLICY "order_attachments_delete"
  ON order_attachments FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid() OR is_admin());

-- ============================================
-- ORDER COMMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "order_comments_select" ON order_comments;
DROP POLICY IF EXISTS "order_comments_insert" ON order_comments;
DROP POLICY IF EXISTS "order_comments_update" ON order_comments;
DROP POLICY IF EXISTS "order_comments_delete" ON order_comments;

-- Users can see comments for orders they have access to
CREATE POLICY "order_comments_select"
  ON order_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_comments.order_id
      AND (
        o.customer_id = auth.uid() OR
        o.assigned_sales_rep_id = auth.uid() OR
        o.assigned_designer_id = auth.uid()
      )
    )
    OR is_admin()
  );

-- Employees can add comments to orders
CREATE POLICY "order_comments_insert"
  ON order_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM orders o
        WHERE o.id = order_comments.order_id
        AND (
          o.assigned_sales_rep_id = auth.uid() OR
          o.assigned_designer_id = auth.uid()
        )
      )
      OR is_admin()
    )
  );

-- Only admins can delete comments
CREATE POLICY "order_comments_delete"
  ON order_comments FOR DELETE
  TO authenticated
  USING (is_admin());
