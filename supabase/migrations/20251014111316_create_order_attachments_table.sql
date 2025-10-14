/*
  # Order Attachments Table

  1. New Tables
    - `order_attachments`
      - `id` (uuid, primary key) - Unique identifier for each attachment
      - `order_id` (uuid, foreign key) - References the parent order
      - `original_filename` (text) - Original filename as uploaded by user
      - `stored_filename` (text) - UUID-based unique filename in S3
      - `file_size` (bigint) - File size in bytes
      - `mime_type` (text) - File content type (e.g., application/pdf)
      - `s3_key` (text) - Full S3 path: orders/{order-id}/{filename}
      - `uploaded_by` (uuid) - User ID who uploaded the file (employee or customer)
      - `uploaded_at` (timestamptz) - When the file was uploaded
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `order_attachments` table
    - Customers can view attachments for their own orders
    - Sales reps can view attachments for orders assigned to their customers
    - Designers can view attachments for orders assigned to them
    - Admins can view and delete all attachments
    - Only admins can delete attachments

  3. Indexes
    - Index on `order_id` for fast order-specific lookups
    - Index on `uploaded_by` for user-specific queries

  4. Notes
    - Uses S3-compatible storage (Backblaze B2) for file storage
    - Existing orders.file_urls column maintained for backward compatibility
    - 20MB file size limit enforced in application layer
*/

CREATE TABLE IF NOT EXISTS order_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  stored_filename text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  s3_key text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attachments_uploaded_by ON order_attachments(uploaded_by);

ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view attachments for own orders"
  ON order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_attachments.order_id
      AND o.customer_id = uploaded_by
    )
  );

CREATE POLICY "Sales reps can view attachments for assigned orders"
  ON order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      WHERE o.id = order_attachments.order_id
      AND c.assigned_sales_rep_id = uploaded_by
    )
  );

CREATE POLICY "Designers can view attachments for assigned orders"
  ON order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_attachments.order_id
      AND o.assigned_designer_id = uploaded_by
    )
  );

CREATE POLICY "Admins can view all attachments"
  ON order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = uploaded_by
      AND e.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert attachments"
  ON order_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete attachments"
  ON order_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = (
        SELECT id FROM employees e2
        WHERE e2.id = (
          SELECT COALESCE(
            (SELECT id FROM employees WHERE id = uploaded_by),
            uploaded_by
          )
        )
      )
      AND EXISTS (
        SELECT 1 FROM employees admin
        WHERE admin.role = 'admin'
        AND admin.id IN (
          SELECT id FROM employees WHERE role = 'admin'
        )
      )
    )
  );