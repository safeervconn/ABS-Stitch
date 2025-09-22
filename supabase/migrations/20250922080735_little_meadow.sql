/*
  # Complete Schema Rebuild

  This migration drops all existing tables and recreates them with the new simplified schema.
  
  ## Changes Made:
  1. Dropped quantity and SKU from products
  2. Simplified user_profiles table structure
  3. Streamlined orders table with proper status enum
  4. Added order_logs and order_comments for better tracking
  5. Simplified notifications system
  6. Added proper indexes for performance
  
  ## New Tables:
  - users_profile: User management with role-based access
  - categories: Product categorization
  - products: Simplified product catalog
  - orders: Order management with proper workflow
  - order_logs: Audit trail for order changes
  - order_comments: Communication on orders
  - notifications: User notifications
  
  ## Security:
  - RLS enabled on all tables
  - Proper policies for role-based access
*/

-- Drop existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS admin_meta CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS designers CASCADE;
DROP TABLE IF EXISTS sales_reps CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_order_status_history() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. users_profile table
CREATE TABLE users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep', 'designer', 'customer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    assigned_sales_rep_id UUID REFERENCES users_profile(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. products table (simplified - no quantity, no SKU)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. orders table (streamlined)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users_profile(id),
    product_id UUID REFERENCES products(id),
    custom_description TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'unassigned', 'assigned_to_sales', 'assigned_to_designer', 
        'in_progress', 'under_review', 'completed', 'archived'
    )),
    assigned_sales_rep_id UUID REFERENCES users_profile(id),
    assigned_designer_id UUID REFERENCES users_profile(id),
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. order_logs table
CREATE TABLE order_logs (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES users_profile(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. order_comments table
CREATE TABLE order_comments (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users_profile(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order', 'user', 'product', 'system')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_profile_role ON users_profile(role);
CREATE INDEX idx_users_profile_status ON users_profile(status);
CREATE INDEX idx_users_profile_assigned_sales_rep ON users_profile(assigned_sales_rep_id);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_assigned_sales_rep ON orders(assigned_sales_rep_id);
CREATE INDEX idx_orders_assigned_designer ON orders(assigned_designer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_logs_order ON order_logs(order_id);
CREATE INDEX idx_order_logs_performed_by ON order_logs(performed_by);
CREATE INDEX idx_order_logs_created_at ON order_logs(created_at);

CREATE INDEX idx_order_comments_order ON order_comments(order_id);
CREATE INDEX idx_order_comments_author ON order_comments(author_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at triggers
CREATE TRIGGER update_users_profile_updated_at
    BEFORE UPDATE ON users_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can read own profile" ON users_profile
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users_profile
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON users_profile
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users_profile 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for categories
CREATE POLICY "Everyone can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users_profile 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for products
CREATE POLICY "Everyone can read active products" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users_profile 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for orders
CREATE POLICY "Customers can read own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Sales reps can read assigned orders" ON orders
    FOR SELECT USING (
        assigned_sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users_profile 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Designers can read assigned orders" ON orders
    FOR SELECT USING (
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users_profile 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Staff can update orders" ON orders
    FOR UPDATE USING (
        assigned_sales_rep_id = auth.uid() OR
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users_profile 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for order_logs
CREATE POLICY "Users can read logs for accessible orders" ON order_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_logs.order_id AND (
                orders.customer_id = auth.uid() OR
                orders.assigned_sales_rep_id = auth.uid() OR
                orders.assigned_designer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM users_profile 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Staff can create order logs" ON order_logs
    FOR INSERT WITH CHECK (performed_by = auth.uid());

-- RLS Policies for order_comments
CREATE POLICY "Users can read comments for accessible orders" ON order_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_comments.order_id AND (
                orders.customer_id = auth.uid() OR
                orders.assigned_sales_rep_id = auth.uid() OR
                orders.assigned_designer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM users_profile 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can create comments on accessible orders" ON order_comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_comments.order_id AND (
                orders.customer_id = auth.uid() OR
                orders.assigned_sales_rep_id = auth.uid() OR
                orders.assigned_designer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM users_profile 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Embroidery', 'Custom embroidery designs'),
    ('Logos', 'Company and brand logos'),
    ('Patches', 'Custom patches and badges'),
    ('Monograms', 'Personal monogramming'),
    ('Sports', 'Sports team designs'),
    ('Custom', 'Custom design requests');

-- Insert admin user if it doesn't exist
DO $$
BEGIN
    -- This will be handled by the application signup process
    -- Just ensuring the table structure is ready
END $$;