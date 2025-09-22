/*
  # Admin Module Database Setup

  1. New Tables
    - `categories` - Product categories
    - `order_items` - Order line items (if not exists)
    - `admin_meta` - Admin last seen timestamps for badges
    - `activity_log` - Activity tracking
    - `notifications` - User notifications

  2. Schema Updates
    - Add missing fields to existing tables
    - Enable RLS on new tables
    - Add appropriate policies

  3. Functions
    - Helper functions for admin operations
*/

-- Categories table for products
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Everyone can read active categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin metadata for last seen timestamps
CREATE TABLE IF NOT EXISTS admin_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  last_seen_users timestamptz DEFAULT now(),
  last_seen_orders timestamptz DEFAULT now(),
  last_seen_products timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_id)
);

ALTER TABLE admin_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage own meta"
  ON admin_meta
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid());

-- Activity log for tracking admin actions
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES user_profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read activity log"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Add missing fields to products table if they don't exist
DO $$
BEGIN
  -- Add category_id to products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;

  -- Add stock field to products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock integer DEFAULT 0;
  END IF;

  -- Add sku field to products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text UNIQUE;
  END IF;

  -- Add status field to user_profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'disabled'));
  END IF;

  -- Add assigned_role to orders
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'assigned_role'
  ) THEN
    ALTER TABLE orders ADD COLUMN assigned_role text CHECK (assigned_role IN ('sales_rep', 'designer'));
  END IF;
END $$;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Embroidery', 'Custom embroidery designs'),
  ('Logos', 'Company and brand logos'),
  ('Patches', 'Custom patches and badges'),
  ('Monograms', 'Personal monogramming')
ON CONFLICT (name) DO NOTHING;

-- Function to update admin last seen timestamp
CREATE OR REPLACE FUNCTION update_admin_last_seen(
  tab_name text
) RETURNS void AS $$
BEGIN
  INSERT INTO admin_meta (admin_id, last_seen_users, last_seen_orders, last_seen_products)
  VALUES (
    auth.uid(),
    CASE WHEN tab_name = 'users' THEN now() ELSE now() - interval '1 year' END,
    CASE WHEN tab_name = 'orders' THEN now() ELSE now() - interval '1 year' END,
    CASE WHEN tab_name = 'products' THEN now() ELSE now() - interval '1 year' END
  )
  ON CONFLICT (admin_id) DO UPDATE SET
    last_seen_users = CASE WHEN tab_name = 'users' THEN now() ELSE admin_meta.last_seen_users END,
    last_seen_orders = CASE WHEN tab_name = 'orders' THEN now() ELSE admin_meta.last_seen_orders END,
    last_seen_products = CASE WHEN tab_name = 'products' THEN now() ELSE admin_meta.last_seen_products END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  action_name text,
  resource_type_name text,
  resource_id_param uuid DEFAULT NULL,
  details_param jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO activity_log (admin_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), action_name, resource_type_name, resource_id_param, details_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_meta_updated_at'
  ) THEN
    CREATE TRIGGER update_admin_meta_updated_at
      BEFORE UPDATE ON admin_meta
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;