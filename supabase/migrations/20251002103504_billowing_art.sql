/*
  # Add foreign key relationship for order comments

  1. Foreign Key Constraint
    - Add foreign key constraint between order_comments.author_id and employees.id
    - This enables Supabase to understand the relationship for joins

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_comments_author_id_fkey'
    AND table_name = 'order_comments'
  ) THEN
    ALTER TABLE order_comments 
    ADD CONSTRAINT order_comments_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES employees(id);
  END IF;
END $$;