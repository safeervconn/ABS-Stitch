/*
  # Create Supabase Storage Buckets and Policies

  1. Storage Buckets
    - `order-attachments` - For order attachment files
    - `product-images` - For product catalog images
  
  2. Security Policies
    - Order Attachments:
      - Authenticated users can upload attachments to orders they have access to
      - Users can view attachments for orders they have access to
      - Only admins can delete attachments
    
    - Product Images:
      - Public read access for all users
      - Only admins can upload/delete product images

  3. Notes
    - Both buckets use path-based organization
    - Order attachments: orders/{order_number}/{filename}
    - Product images: product-images/{filename}
    - File size limits enforced at application level
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('order-attachments', 'order-attachments', false, 20971520, ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]),
  ('product-images', 'product-images', true, 10485760, ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view attachments for orders they have access to"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'order-attachments' AND (
      EXISTS (
        SELECT 1 FROM order_attachments oa
        JOIN orders o ON oa.order_id = o.id
        WHERE oa.storage_path = name
        AND (
          o.customer_id = auth.uid()
          OR o.assigned_sales_rep_id = auth.uid()
          OR o.assigned_designer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM employees e
            WHERE e.id = auth.uid() AND e.role = 'admin'
          )
        )
      )
    )
  );

CREATE POLICY "Users can upload attachments to orders they have access to"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'order-attachments' AND (
      EXISTS (
        SELECT 1 FROM orders o
        WHERE (
          name LIKE 'orders/' || o.order_number || '/%'
          AND (
            o.customer_id = auth.uid()
            OR o.assigned_sales_rep_id = auth.uid()
            OR o.assigned_designer_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM employees e
              WHERE e.id = auth.uid() AND e.role = 'admin'
            )
          )
        )
      )
    )
  );

CREATE POLICY "Only admins can delete attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'order-attachments' AND
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid() AND e.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Only admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid() AND e.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid() AND e.role = 'admin'
    )
  );