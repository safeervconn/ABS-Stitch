/*
  # Refactor categories to apparel_types and update orders table

  1. Schema Changes
    - Rename `categories` table to `apparel_types`
    - Rename `name` column to `type_name` in `apparel_types`
    - Add `apparel_type_id` column to `orders` table
    - Migrate existing `orders.apparel_type` text values to `orders.apparel_type_id` UUID references
    - Remove `orders.apparel_type` text column
    - Remove `orders.design_size` column entirely
    - Update `products.category_id` to reference `apparel_types`

  2. Security
    - Update RLS policies for `apparel_types` table
    - Maintain existing security model

  3. Data Migration
    - Preserve existing data during table rename
    - Map existing apparel_type text values to apparel_types references
*/

-- Step 1: Rename categories table to apparel_types
ALTER TABLE public.categories RENAME TO apparel_types;

-- Step 2: Rename name column to type_name
ALTER TABLE public.apparel_types RENAME COLUMN name TO type_name;

-- Step 3: Update products table foreign key constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_apparel_type_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.apparel_types(id);

-- Step 4: Add apparel_type_id column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'apparel_type_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN apparel_type_id UUID;
  END IF;
END $$;

-- Step 5: Migrate existing orders.apparel_type text values to apparel_type_id
UPDATE public.orders o
SET apparel_type_id = at.id
FROM public.apparel_types at
WHERE o.apparel_type = at.type_name;

-- Step 6: Add foreign key constraint for orders.apparel_type_id
ALTER TABLE public.orders ADD CONSTRAINT orders_apparel_type_id_fkey 
  FOREIGN KEY (apparel_type_id) REFERENCES public.apparel_types(id);

-- Step 7: Remove old apparel_type text column from orders
ALTER TABLE public.orders DROP COLUMN IF EXISTS apparel_type;

-- Step 8: Remove design_size column from orders
ALTER TABLE public.orders DROP COLUMN IF EXISTS design_size;

-- Step 9: Update RLS policies for apparel_types (renamed from categories)
DROP POLICY IF EXISTS "Admins can manage categories" ON public.apparel_types;
DROP POLICY IF EXISTS "Everyone can read categories" ON public.apparel_types;

CREATE POLICY "Admins can manage apparel types"
  ON public.apparel_types
  FOR ALL
  TO public
  USING (EXISTS ( SELECT 1 FROM employees e WHERE ((e.id = auth.uid()) AND (e.role = 'admin'::text))));

CREATE POLICY "Everyone can read apparel types"
  ON public.apparel_types
  FOR SELECT
  TO public
  USING (true);

-- Step 10: Update indexes if they exist
DROP INDEX IF EXISTS categories_name_key;
DROP INDEX IF EXISTS categories_pkey;

-- Recreate indexes with new names
CREATE UNIQUE INDEX IF NOT EXISTS apparel_types_type_name_key ON public.apparel_types USING btree (type_name);
CREATE UNIQUE INDEX IF NOT EXISTS apparel_types_pkey ON public.apparel_types USING btree (id);

-- Step 11: Add some default apparel types if table is empty
INSERT INTO public.apparel_types (type_name, description) 
VALUES 
  ('T-shirt', 'Standard t-shirt apparel'),
  ('Jacket', 'Jacket and outerwear'),
  ('Cap', 'Caps and hats'),
  ('Polo', 'Polo shirts'),
  ('Hoodie', 'Hooded sweatshirts'),
  ('Other', 'Other apparel types')
ON CONFLICT (type_name) DO NOTHING;