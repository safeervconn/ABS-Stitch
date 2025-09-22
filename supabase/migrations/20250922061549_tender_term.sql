/*
  # Add missing product fields

  1. Changes
    - Add image_url field if not exists (already exists)
    - Add status field for products (using is_active as status)
    - Ensure all required fields exist for product management
*/

-- Products table already has image_url and is_active fields
-- No changes needed as the existing schema supports our requirements