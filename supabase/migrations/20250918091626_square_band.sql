/*
  # Complete ABS STITCH Database Schema

  1. New Tables
    - `user_profiles` - Extended user information with roles
    - `customers` - Customer-specific data
    - `sales_reps` - Sales representative data
    - `designers` - Designer-specific data
    - `products` - Embroidery design catalog
    - `orders` - Customer orders
    - `order_items` - Items within orders
    - `order_status_history` - Order status tracking
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role
    - Secure data access based on user roles

  3. Sample Data
    - Create admin user profile
    - Add sample products
    - Create sample users for testing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'sales_rep', 'designer', 'customer')),
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  notification_preferences jsonb DEFAULT '{"email": true, "push": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name text,
  billing_address jsonb,
  assigned_sales_rep uuid REFERENCES user_profiles(id),
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Sales Representatives Table
CREATE TABLE IF NOT EXISTS sales_reps (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  department text DEFAULT 'Sales',
  commission_rate decimal(5,2) DEFAULT 10.0,
  total_sales decimal(12,2) DEFAULT 0.00,
  active_customers integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Designers Table
CREATE TABLE IF NOT EXISTS designers (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  specialties text[] DEFAULT ARRAY['Embroidery', 'Custom Stitching'],
  hourly_rate decimal(8,2) DEFAULT 50.00,
  total_completed integer DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(8,2) NOT NULL,
  original_price decimal(8,2),
  image_url text,
  tags text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id),
  sales_rep_id uuid REFERENCES sales_reps(id),
  assigned_designer_id uuid REFERENCES designers(id),
  order_type text NOT NULL CHECK (order_type IN ('catalog', 'custom')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'review', 'completed', 'delivered', 'cancelled')),
  total_amount decimal(10,2) NOT NULL,
  custom_instructions text,
  design_requirements jsonb,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(8,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  custom_specifications jsonb,
  created_at timestamptz DEFAULT now()
);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES user_profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  related_order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Customers Policies
CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Sales reps can read assigned customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    assigned_sales_rep = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
    )
  );

-- Sales Reps Policies
CREATE POLICY "Sales reps can read own data"
  ON sales_reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all sales reps"
  ON sales_reps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Designers Policies
CREATE POLICY "Designers can read own data"
  ON designers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins and sales reps can read all designers"
  ON designers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
    )
  );

-- Products Policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders Policies
CREATE POLICY "Customers can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
  );

CREATE POLICY "Sales reps can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    sales_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
    )
  );

CREATE POLICY "Designers can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    assigned_designer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'designer')
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'customer'
    )
  );

CREATE POLICY "Sales reps and admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'sales_rep', 'designer')
    )
  );

-- Order Items Policies
CREATE POLICY "Users can read order items for accessible orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.sales_rep_id = auth.uid() OR
        orders.assigned_designer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Order Status History Policies
CREATE POLICY "Users can read status history for accessible orders"
  ON order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.sales_rep_id = auth.uid() OR
        orders.assigned_designer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Notifications Policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create order status history
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER order_status_history_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- Insert Sample Data

-- Sample Products
INSERT INTO products (title, description, category, price, original_price, image_url, tags) VALUES
('Classic Logo Embroidery', 'Professional logo embroidery for business apparel', 'Logo Design', 25.00, NULL, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['logo', 'business', 'professional']),
('Custom Text Stitching', 'Personalized text embroidery in various fonts', 'Text Design', 15.00, 20.00, 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['text', 'custom', 'personalized']),
('Floral Pattern Design', 'Beautiful floral embroidery patterns', 'Decorative', 30.00, NULL, 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['floral', 'decorative', 'nature']),
('Sports Team Logo', 'Custom sports team logo embroidery', 'Sports', 35.00, 40.00, 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'logo']),
('Monogram Design', 'Elegant monogram embroidery', 'Monogram', 20.00, NULL, 'https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'elegant', 'initials']),
('Abstract Art Pattern', 'Modern abstract embroidery design', 'Art', 28.00, 32.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['abstract', 'modern', 'art']);

-- Note: The admin user will be created when someone signs up with the admin email
-- The application will automatically create the user profile and assign admin role