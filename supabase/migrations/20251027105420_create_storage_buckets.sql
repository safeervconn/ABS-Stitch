/*
  # Create Storage Buckets for File Uploads

  1. Storage Buckets
    - `order-attachments` - For customer order files and images
    - `stock-design-files` - For downloadable stock design ZIP files
    - `stock-design-images` - For stock design preview images
  
  2. Security
    - Enable RLS on all buckets
    - Add policies for authenticated users to upload to order-attachments
    - Add policies for admin users to manage stock design files
    - Add public read access for stock design images
  
  3. Notes
    - Order attachments are private and require authentication
    - Stock design files are private and require admin access
    - Stock design images are publicly readable
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('order-attachments', 'order-attachments', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/zip', 'application/x-zip-compressed'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/zip', 'application/x-zip-compressed'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('stock-design-files', 'stock-design-files', false, 104857600, ARRAY['application/zip', 'application/x-zip-compressed'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['application/zip', 'application/x-zip-compressed'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('stock-design-images', 'stock-design-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Storage policies for order-attachments bucket
DROP POLICY IF EXISTS "Authenticated users can upload order attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload order attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-attachments');

DROP POLICY IF EXISTS "Users can view order attachments" ON storage.objects;
CREATE POLICY "Users can view order attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-attachments');

DROP POLICY IF EXISTS "Users can delete own order attachments" ON storage.objects;
CREATE POLICY "Users can delete own order attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-attachments');

-- Storage policies for stock-design-files bucket
DROP POLICY IF EXISTS "Admin can upload stock design files" ON storage.objects;
CREATE POLICY "Admin can upload stock design files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'stock-design-files' 
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = auth.uid() 
      AND employees.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can view stock design files" ON storage.objects;
CREATE POLICY "Admin can view stock design files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'stock-design-files'
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = auth.uid() 
      AND employees.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete stock design files" ON storage.objects;
CREATE POLICY "Admin can delete stock design files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'stock-design-files'
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = auth.uid() 
      AND employees.role = 'admin'
    )
  );

-- Storage policies for stock-design-images bucket (public read)
DROP POLICY IF EXISTS "Anyone can view stock design images" ON storage.objects;
CREATE POLICY "Anyone can view stock design images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'stock-design-images');

DROP POLICY IF EXISTS "Admin can upload stock design images" ON storage.objects;
CREATE POLICY "Admin can upload stock design images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'stock-design-images'
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = auth.uid() 
      AND employees.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can delete stock design images" ON storage.objects;
CREATE POLICY "Admin can delete stock design images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'stock-design-images'
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = auth.uid() 
      AND employees.role = 'admin'
    )
  );