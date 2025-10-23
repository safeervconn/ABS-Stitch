/*
  # Add 'invoice' notification type

  1. Changes
    - Update the check constraint on notifications table to include 'invoice' type
    - This allows notifications about invoices to be properly categorized
  
  2. Security
    - No changes to RLS policies
*/

-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with 'invoice' type
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['order'::text, 'user'::text, 'stock_design'::text, 'system'::text, 'invoice'::text]));
