/*
  # Complete Database Setup for Multi-Role Embroidery Application

  1. Database Structure
    - User profiles with role-based access
    - Customers, sales reps, and designers tables
    - Products and orders management
    - Comments system for order communication

  2. User Roles
    - admin: Full system access
    - sales_rep: Customer and order management
    - designer: Project assignment and completion
    - customer: Order placement and tracking

  3. Sample Data
    - Demo users for each role
    - Sample products and orders
    - Test data for dashboard functionality

  4. Security
    - Row Level Security (RLS) enabled
    - Simple policies for development
    - Role-based access control
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_comments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS designers CASCADE;
DROP TABLE IF EXISTS sales_reps CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep', 'designer', 'customer')),
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{"push": true, "email": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    billing_address JSONB,
    assigned_sales_rep UUID REFERENCES user_profiles(id),
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sales_reps table
CREATE TABLE sales_reps (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    department TEXT DEFAULT 'Sales',
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    total_sales NUMERIC(12,2) DEFAULT 0.00,
    active_customers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create designers table
CREATE TABLE designers (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    hourly_rate NUMERIC(8,2) DEFAULT 50.00,
    total_completed INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(8,2) NOT NULL,
    original_price NUMERIC(8,2),
    image_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    sales_rep_id UUID REFERENCES sales_reps(id),
    assigned_designer_id UUID REFERENCES designers(id),
    order_type TEXT NOT NULL CHECK (order_type IN ('catalog', 'custom')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'review', 'completed', 'delivered', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    custom_instructions TEXT,
    design_requirements JSONB,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(8,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    custom_specifications JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_comments table
CREATE TABLE order_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES user_profiles(id),
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at_column();

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for customers
CREATE POLICY "Customers can read own data" ON customers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sales reps can read assigned customers" ON customers
    FOR SELECT USING (
        assigned_sales_rep = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- RLS Policies for sales_reps
CREATE POLICY "Sales reps can read own data" ON sales_reps
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all sales reps" ON sales_reps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for designers
CREATE POLICY "Designers can read own data" ON designers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins and sales reps can read all designers" ON designers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- RLS Policies for products
CREATE POLICY "Anyone can read active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and designers can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'designer')
        )
    );

-- RLS Policies for orders
CREATE POLICY "Customers can read own orders" ON orders
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        sales_rep_id = auth.uid() OR 
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Sales reps and admins can update orders" ON orders
    FOR UPDATE USING (
        sales_rep_id = auth.uid() OR 
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- RLS Policies for order_items
CREATE POLICY "Users can read order items for accessible orders" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id AND (
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
CREATE POLICY "Users can read comments for accessible orders" ON order_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_comments.order_id AND (
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

CREATE POLICY "Users can create comments for accessible orders" ON order_comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_comments.order_id AND (
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

-- Insert sample data
-- Note: In a real setup, you would create these users through Supabase Auth
-- For development, we'll insert directly into user_profiles

-- Sample user profiles (these IDs would normally come from auth.users)
INSERT INTO user_profiles (id, email, full_name, role, phone, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@absstitch.com', 'Admin User', 'admin', '+1-555-0001', true),
    ('22222222-2222-2222-2222-222222222222', 'sales@absstitch.com', 'John Sales', 'sales_rep', '+1-555-0002', true),
    ('33333333-3333-3333-3333-333333333333', 'designer@absstitch.com', 'Jane Designer', 'designer', '+1-555-0003', true),
    ('44444444-4444-4444-4444-444444444444', 'customer@example.com', 'Sarah Johnson', 'customer', '+1-555-0004', true),
    ('55555555-5555-5555-5555-555555555555', 'mike@techcompany.com', 'Mike Chen', 'customer', '+1-555-0005', true);

-- Sample customers
INSERT INTO customers (id, company_name, assigned_sales_rep, total_orders, total_spent) VALUES
    ('44444444-4444-4444-4444-444444444444', 'Fashion Startup', '22222222-2222-2222-2222-222222222222', 3, 245.00),
    ('55555555-5555-5555-5555-555555555555', 'Tech Company', '22222222-2222-2222-2222-222222222222', 2, 180.00);

-- Sample sales rep
INSERT INTO sales_reps (id, employee_id, commission_rate, total_sales, active_customers) VALUES
    ('22222222-2222-2222-2222-222222222222', 'SR001', 12.00, 8450.00, 2);

-- Sample designer
INSERT INTO designers (id, employee_id, specialties, hourly_rate, total_completed, average_rating) VALUES
    ('33333333-3333-3333-3333-333333333333', 'DS001', ARRAY['Embroidery', 'Logo Design', 'Custom Stitching'], 65.00, 15, 4.8);

-- Sample products
INSERT INTO products (title, description, category, price, original_price, image_url, tags, created_by) VALUES
    ('Classic Logo Embroidery', 'Professional logo embroidery for business apparel', 'Logo Design', 45.00, 55.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['logo', 'business', 'professional'], '33333333-3333-3333-3333-333333333333'),
    ('Custom Text Stitching', 'Personalized text embroidery for any garment', 'Text Design', 25.00, NULL, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['text', 'custom', 'personalized'], '33333333-3333-3333-3333-333333333333'),
    ('Floral Pattern Design', 'Beautiful floral embroidery pattern', 'Decorative', 35.00, 40.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['floral', 'decorative', 'pattern'], '33333333-3333-3333-3333-333333333333'),
    ('Sports Team Logo', 'Custom sports team logo embroidery', 'Sports', 50.00, NULL, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'logo'], '33333333-3333-3333-3333-333333333333'),
    ('Monogram Design', 'Elegant monogram embroidery', 'Monogram', 30.00, 35.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'elegant', 'personal'], '33333333-3333-3333-3333-333333333333'),
    ('Corporate Branding', 'Professional corporate logo stitching', 'Corporate', 60.00, NULL, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['corporate', 'branding', 'professional'], '33333333-3333-3333-3333-333333333333');

-- Sample orders
INSERT INTO orders (order_number, customer_id, sales_rep_id, assigned_designer_id, order_type, status, total_amount, custom_instructions, due_date) VALUES
    ('ORD-20250101', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'custom', 'in_progress', 85.00, 'Need modern logo design for fitness brand. Bold and energetic with blue and orange colors.', now() + interval '5 days'),
    ('ORD-20250102', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', NULL, 'custom', 'pending', 150.00, 'Corporate logo design for tech startup. Clean, professional, minimalist style preferred.', now() + interval '7 days'),
    ('ORD-20250103', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'catalog', 'completed', 45.00, NULL, now() - interval '2 days'),
    ('ORD-20250104', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'custom', 'review', 120.00, 'Marketing materials for local restaurant. Warm, inviting colors.', now() + interval '3 days');

-- Sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
    ((SELECT id FROM orders WHERE order_number = 'ORD-20250103'), (SELECT id FROM products WHERE title = 'Classic Logo Embroidery'), 1, 45.00, 45.00);

-- Sample order comments
INSERT INTO order_comments (order_id, author_id, comment_text, is_internal) VALUES
    ((SELECT id FROM orders WHERE order_number = 'ORD-20250101'), '44444444-4444-4444-4444-444444444444', 'Looking forward to seeing the initial concepts!', false),
    ((SELECT id FROM orders WHERE order_number = 'ORD-20250101'), '33333333-3333-3333-3333-333333333333', 'I have some great ideas for this fitness brand logo. Will have initial sketches ready by tomorrow.', false),
    ((SELECT id FROM orders WHERE order_number = 'ORD-20250104'), '33333333-3333-3333-3333-333333333333', 'Initial designs are ready for review.', false),
    ((SELECT id FROM orders WHERE order_number = 'ORD-20250104'), '55555555-5555-5555-5555-555555555555', 'The designs look great! Just need to adjust the color scheme slightly.', false);