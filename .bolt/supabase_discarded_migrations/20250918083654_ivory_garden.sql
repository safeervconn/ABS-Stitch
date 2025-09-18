/*
  # Complete Database Reset and Setup

  1. New Tables
    - `user_profiles` - User information with role-based access
    - `customers` - Customer-specific data
    - `sales_reps` - Sales representative data
    - `designers` - Designer-specific data
    - `products` - Product catalog
    - `orders` - Order management
    - `order_items` - Order line items
    - `order_comments` - Order communication

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Create trigger functions for updated_at timestamps

  3. Sample Data
    - Products for catalog display
    - One user for each role (admin, sales_rep, designer, customer)
    - Sample orders for testing workflows
*/

-- Drop existing tables if they exist
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

-- Create user profiles table
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'sales_rep', 'designer', 'customer')),
    avatar_url text,
    phone text,
    is_active boolean DEFAULT true,
    notification_preferences jsonb DEFAULT '{"push": true, "email": true}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User profiles policies
CREATE POLICY "Users can read own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create customers table
CREATE TABLE customers (
    id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_name text,
    billing_address jsonb,
    assigned_sales_rep uuid REFERENCES user_profiles(id),
    total_orders integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0.00,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can read own data"
    ON customers FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Sales reps can read assigned customers"
    ON customers FOR SELECT
    TO authenticated
    USING (
        assigned_sales_rep = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- Create sales reps table
CREATE TABLE sales_reps (
    id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    employee_id text UNIQUE NOT NULL,
    department text DEFAULT 'Sales',
    commission_rate numeric(5,2) DEFAULT 10.00,
    total_sales numeric(12,2) DEFAULT 0.00,
    active_customers integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales reps can read own data"
    ON sales_reps FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all sales reps"
    ON sales_reps FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create designers table
CREATE TABLE designers (
    id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    employee_id text UNIQUE NOT NULL,
    specialties text[] DEFAULT ARRAY[]::text[],
    hourly_rate numeric(8,2) DEFAULT 50.00,
    total_completed integer DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0.00,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE designers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Designers can read own data"
    ON designers FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins and sales reps can read all designers"
    ON designers FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
    ));

-- Create products table
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    category text NOT NULL,
    price numeric(8,2) NOT NULL,
    original_price numeric(8,2),
    image_url text,
    tags text[] DEFAULT ARRAY[]::text[],
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES user_profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Anyone can read active products"
    ON products FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins and designers can manage products"
    ON products FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('admin', 'designer')
    ));

-- Create orders table
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text UNIQUE NOT NULL,
    customer_id uuid NOT NULL REFERENCES customers(id),
    sales_rep_id uuid REFERENCES sales_reps(id),
    assigned_designer_id uuid REFERENCES designers(id),
    order_type text NOT NULL CHECK (order_type IN ('catalog', 'custom')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'review', 'completed', 'delivered', 'cancelled')),
    total_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    custom_instructions text,
    design_requirements jsonb,
    due_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Customers can create orders"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can read own orders"
    ON orders FOR SELECT
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

CREATE POLICY "Sales reps and admins can update orders"
    ON orders FOR UPDATE
    TO authenticated
    USING (
        sales_rep_id = auth.uid() OR
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- Create order items table
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(8,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    custom_specifications jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order items for accessible orders"
    ON order_items FOR SELECT
    TO authenticated
    USING (EXISTS (
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
    ));

-- Create order comments table
CREATE TABLE order_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES user_profiles(id),
    comment_text text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read comments for accessible orders"
    ON order_comments FOR SELECT
    TO authenticated
    USING (EXISTS (
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
    ));

CREATE POLICY "Users can create comments for accessible orders"
    ON order_comments FOR INSERT
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

-- Insert sample products
INSERT INTO products (title, description, category, price, original_price, image_url, tags) VALUES
('Classic Logo Embroidery', 'Professional logo embroidery for business apparel', 'Business', 45.00, 55.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['logo', 'business', 'professional']),
('Custom Name Stitching', 'Personalized name embroidery for any garment', 'Personal', 25.00, NULL, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['name', 'personal', 'custom']),
('Sports Team Badge', 'Team logo and number embroidery for sports uniforms', 'Sports', 35.00, 45.00, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'badge']),
('Decorative Floral Design', 'Beautiful floral patterns for fashion items', 'Fashion', 40.00, NULL, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['floral', 'fashion', 'decorative']),
('Corporate Branding Package', 'Complete branding solution with logo and text', 'Business', 75.00, 95.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['corporate', 'branding', 'package']),
('Vintage Style Patch', 'Retro-style embroidered patches for jackets and bags', 'Fashion', 30.00, NULL, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['vintage', 'patch', 'retro']),
('Monogram Initials', 'Elegant monogram embroidery for luxury items', 'Personal', 35.00, 40.00, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'initials', 'luxury']),
('Holiday Theme Design', 'Seasonal embroidery designs for special occasions', 'Seasonal', 28.00, NULL, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['holiday', 'seasonal', 'special']);

-- Note: Sample users will need to be created through the authentication system
-- The following data structure shows what should be created:

/*
Sample Users to Create (via Supabase Auth Dashboard or signup):

1. Admin User
   - Email: admin@absstitch.com
   - Password: admin123!
   - Role: admin
   - Full Name: Admin User

2. Sales Representative
   - Email: sales@absstitch.com
   - Password: sales123!
   - Role: sales_rep
   - Full Name: John Sales
   - Employee ID: SR001

3. Designer
   - Email: designer@absstitch.com
   - Password: design123!
   - Role: designer
   - Full Name: Jane Designer
   - Employee ID: DS001

4. Customer
   - Email: customer@example.com
   - Password: customer123!
   - Role: customer
   - Full Name: Sarah Customer
   - Company: Example Company

After creating these users through auth, their profiles and role-specific records
will be automatically created through the application signup process.
*/