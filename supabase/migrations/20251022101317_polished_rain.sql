/*
  # Fix storage RLS policy for stock design images

  1. Storage Policies
    - Add policy to allow admin users to insert images into stock-design-images bucket
    - Add policy to allow public read access to stock-design-images bucket
    - Add policy to allow admin users to update images in stock-design-images bucket
    - Add policy to allow admin users to delete images from stock-design-images bucket

  This resolves the "new row violates row-level security policy" error when uploading stock design images.
*/

-- Create policy to allow admin users to upload (INSERT) stock design images
CREATE POLICY "Allow admin to upload stock design images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'stock-design-images' 
  AND EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Create policy to allow public read access to stock design images
CREATE POLICY "Allow public read access to stock design images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'stock-design-images');

-- Create policy to allow admin users to update stock design images
CREATE POLICY "Allow admin to update stock design images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'stock-design-images' 
  AND EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  bucket_id = 'stock-design-images' 
  AND EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Create policy to allow admin users to delete stock design images
CREATE POLICY "Allow admin to delete stock design images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'stock-design-images' 
  AND EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Ensure the stock-design-images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('stock-design-images', 'stock-design-images', true)
ON CONFLICT (id) DO NOTHING;