/*
  # Complete User Management System for Digital Artwork Services

  1. New Tables
    - `user_profiles` - Extended user information with roles
    - `customers` - Customer-specific information
    - `sales_reps` - Sales representative information
    - `designers` - Designer/worker information
    - `products` - Catalog products
    - `orders` - Customer orders
    - `order_items` - Individual items in orders
    - `order_comments` - Comments on orders
    - `work_submissions` - Designer work submissions
    - `invoices` - Order invoices
    - `notifications` - System notifications
    - `chat_messages` - Communication between users

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Secure user data isolation

  3. Features
    - Complete role-based access control
    - Order management workflow
    - Communication system
    - Invoice management
    - Notification system
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'sales_rep', 'designer', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'assigned', 'in_progress', 'review', 'completed', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('catalog', 'custom');
CREATE TYPE notification_type AS ENUM ('order_update', 'new_assignment', 'message', 'system');

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
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
  total_spent decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Sales Representatives Table
CREATE TABLE IF NOT EXISTS sales_reps (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  department text,
  commission_rate decimal(5,2) DEFAULT 0,
  total_sales decimal(10,2) DEFAULT 0,
  active_customers integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Designers Table
CREATE TABLE IF NOT EXISTS designers (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  specialties text[],
  hourly_rate decimal(8,2),
  total_completed integer DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(8,2) NOT NULL,
  original_price decimal(8,2),
  image_url text,
  tags text[],
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id),
  sales_rep_id uuid REFERENCES sales_reps(id),
  assigned_designer_id uuid REFERENCES designers(id),
  order_type order_type NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  custom_instructions text,
  design_requirements jsonb,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(8,2) NOT NULL,
  custom_specifications jsonb,
  created_at timestamptz DEFAULT now()
);

-- Order Comments Table
CREATE TABLE IF NOT EXISTS order_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  comment text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments text[],
  created_at timestamptz DEFAULT now()
);

-- Work Submissions Table
CREATE TABLE IF NOT EXISTS work_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  designer_id uuid NOT NULL REFERENCES designers(id),
  file_urls text[] NOT NULL,
  description text,
  is_final boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES sales_reps(id),
  review_notes text
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  invoice_url text,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  sender_id uuid NOT NULL REFERENCES user_profiles(id),
  recipient_id uuid NOT NULL REFERENCES user_profiles(id),
  message text NOT NULL,
  attachments text[],
  is_read boolean DEFAULT false,
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
ALTER TABLE work_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sales reps can see their assigned customers
CREATE POLICY "Sales reps can see assigned customers"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN customers c ON c.assigned_sales_rep = up.id
      WHERE up.id = auth.uid() AND up.role = 'sales_rep' AND user_profiles.id = c.id
    )
  );

-- Products Policies
CREATE POLICY "Everyone can read active products"
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
    customer_id IN (
      SELECT id FROM customers WHERE id = auth.uid()
    )
  );

CREATE POLICY "Sales reps can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    sales_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
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
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM customers WHERE id = auth.uid()
    )
  );

-- Order Comments Policies
CREATE POLICY "Order participants can read comments"
  ON order_comments
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_id = auth.uid() 
         OR sales_rep_id = auth.uid() 
         OR assigned_designer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Order participants can add comments"
  ON order_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_id = auth.uid() 
         OR sales_rep_id = auth.uid() 
         OR assigned_designer_id = auth.uid()
    )
  );

-- Work Submissions Policies
CREATE POLICY "Designers can manage own submissions"
  ON work_submissions
  FOR ALL
  TO authenticated
  USING (designer_id = auth.uid());

CREATE POLICY "Sales reps can read submissions for their orders"
  ON work_submissions
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE sales_rep_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
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

-- Chat Messages Policies
CREATE POLICY "Users can read messages they sent or received"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Functions for automatic order numbering
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_sequence')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Function for automatic invoice numbering
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_sequence')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO user_profiles (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@artistrydigital.com', 'System Administrator', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'sales@artistrydigital.com', 'John Sales', 'sales_rep'),
  ('00000000-0000-0000-0000-000000000003', 'designer@artistrydigital.com', 'Jane Designer', 'designer');

INSERT INTO sales_reps (id, employee_id, department) VALUES
  ('00000000-0000-0000-0000-000000000002', 'SR001', 'Sales');

INSERT INTO designers (id, employee_id, specialties) VALUES
  ('00000000-0000-0000-0000-000000000003', 'DS001', ARRAY['T-Shirt Design', 'Logo Design']);

-- Insert sample products
INSERT INTO products (title, description, category, price, image_url, tags) VALUES
  ('Abstract Waves', 'Beautiful abstract wave design', 'Digital Art', 25.00, 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg', ARRAY['abstract', 'waves']),
  ('Geometric Patterns', 'Clean geometric patterns', 'T-Shirt Design', 30.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg', ARRAY['geometric', 'modern']),
  ('Nature Inspired', 'Organic nature design', 'Logo Design', 35.00, 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg', ARRAY['nature', 'organic']);