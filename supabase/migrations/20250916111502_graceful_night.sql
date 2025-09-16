/*
  # Complete Database Schema for ABS STITCH Application

  1. New Tables
    - `user_profiles` - User profile information with role-based access
    - `customers` - Customer-specific information and metrics
    - `sales_reps` - Sales representative information and performance
    - `designers` - Designer information and specialties
    - `products` - Product catalog with pricing and metadata
    - `orders` - Order management with status tracking
    - `order_items` - Individual items within orders
    - `order_comments` - Communication thread for orders

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure user data access patterns

  3. Functions and Triggers
    - Automatic timestamp updates
    - User profile creation triggers
*/

-- Enable necessary extensions
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
  notification_preferences jsonb DEFAULT '{"email": true, "push": true}'::jsonb,
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
  commission_rate decimal(5,2) DEFAULT 10.00,
  total_sales decimal(12,2) DEFAULT 0.00,
  active_customers integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Designers Table
CREATE TABLE IF NOT EXISTS designers (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  specialties text[] DEFAULT ARRAY[]::text[],
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
  total_amount decimal(10,2) NOT NULL DEFAULT 0.00,
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

-- Order Comments Table
CREATE TABLE IF NOT EXISTS order_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES user_profiles(id),
  comment_text text NOT NULL,
  is_internal boolean DEFAULT false,
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
ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
create policy if not exists"Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

create policy if not exists"Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

create policy if not exists"Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for customers
create policy if not exists"Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

create policy if not exists"Sales reps can read assigned customers"
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

-- RLS Policies for sales_reps
create policy if not exists"Sales reps can read own data"
  ON sales_reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

create policy if not exists"Admins can read all sales reps"
  ON sales_reps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for designers
create policy if not exists"Designers can read own data"
  ON designers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

create policy if not exists"Admins and sales reps can read all designers"
  ON designers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
    )
  );

-- RLS Policies for products
create policy if not exists"Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

create policy if not exists"Admins and designers can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'designer')
    )
  );

-- RLS Policies for orders
create policy if not exists"Customers can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

create policy if not exists"Customers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

create policy if not exists"Sales reps and admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    sales_rep_id = auth.uid() OR
    assigned_designer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
    )
  );

-- RLS Policies for order_items
create policy if not exists"Users can read order items for accessible orders"
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

-- RLS Policies for order_comments
create policy if not exists"Users can read comments for accessible orders"
  ON order_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_comments.order_id
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

create policy if not exists"Users can create comments for accessible orders"
  ON order_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_comments.order_id
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

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile after auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample products
INSERT INTO products (title, description, category, price, original_price, image_url, tags, is_active) VALUES
('Abstract Waves', 'Beautiful abstract wave design perfect for modern applications', 'Digital Art', 25.00, 35.00, 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['abstract', 'waves', 'blue'], true),
('Geometric Patterns', 'Clean geometric patterns ideal for apparel and branding', 'T-Shirt Design', 30.00, NULL, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['geometric', 'pattern', 'modern'], true),
('Nature Inspired', 'Organic nature-inspired design for eco-friendly brands', 'Logo Design', 35.00, NULL, 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['nature', 'organic', 'green'], true),
('Minimalist Icons', 'Clean minimalist icon set for professional applications', 'Icon Set', 20.00, NULL, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['minimalist', 'icons', 'clean'], true),
('Vintage Typography', 'Retro vintage typography perfect for nostalgic designs', 'T-Shirt Design', 28.00, NULL, 'https://images.pexels.com/photos/1070542/pexels-photo-1070542.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['vintage', 'typography', 'retro'], true),
('Modern Landscapes', 'Contemporary landscape art for interior decoration', 'Wall Art', 40.00, NULL, 'https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['landscape', 'modern', 'art'], true)
ON CONFLICT DO NOTHING;