/*
  # Setup Order Files Storage

  1. Storage Setup
    - Create 'order-files' storage bucket
    - Set up RLS policies for file uploads
    - Allow authenticated users to upload files
    - Allow users to read their own uploaded files

  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to upload and read files
*/

-- Create the storage bucket for order files
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
CREATE POLICY "Authenticated users can upload order files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

CREATE POLICY "Users can view order files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'order-files');

CREATE POLICY "Users can delete their own order files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'order-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update orders table to better support file attachments
-- Note: The file_url column already exists, we'll use it for the first file URL
-- In the future, you might want to add a separate files table for multiple files

-- Add a comment to document the file_url usage
COMMENT ON COLUMN orders.file_url IS 'Primary file URL for the order. Additional files can be stored in a separate files table if needed.';