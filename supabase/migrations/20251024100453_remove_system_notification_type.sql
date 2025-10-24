/*
  # Remove 'system' notification type

  1. Changes
    - Update the check constraint on notifications table to remove 'system' type
    - Only 'order', 'user', 'stock_design', and 'invoice' types will be allowed
  
  2. Reason
    - Streamline notification types to match business requirements
    - 'system' type is no longer needed as notifications are now properly categorized
  
  3. Security
    - No changes to RLS policies
*/

-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint without 'system' type
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['order'::text, 'user'::text, 'stock_design'::text, 'invoice'::text]));