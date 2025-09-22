/*
  # Clean Database Schema Reset

  This migration drops all existing custom tables and rebuilds with a clean, simplified schema.

  ## New Tables:
  1. employees - Staff members (admin, sales_rep, designer)
  2. customers - Customer accounts
  3. categories - Product categories
  4. products - Product catalog
  5. orders - Order management
  6. order_comments - Communication on orders
  7. order_logs - Audit trail for order changes
  8. notifications - User notifications

  ## Security:
  - RLS enabled on all tables
  - Proper policies for role-based access
  - Indexes for performance
*/

-- Drop all existing custom tables (in correct order to respect foreign keys)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS admin_meta CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS order_comments CASCADE;
DROP TABLE IF EXISTS order_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS designers CASCADE;
DROP TABLE IF EXISTS sales_reps CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users_profile CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_admin_last_seen(text) CASCADE;
DROP FUNCTION IF EXISTS log_admin_activity(text, text, uuid, jsonb) CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. employees table (staff members)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep', 'designer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    assigned_sales_rep_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    price NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    product_id UUID REFERENCES products(id), -- nullable for custom orders
    custom_description TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'unassigned', 'assigned_to_sales', 'assigned_to_designer', 
        'in_progress', 'under_review', 'completed', 'archived'
    )),
    assigned_sales_rep_id UUID REFERENCES employees(id),
    assigned_designer_id UUID REFERENCES employees(id),
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. order_comments table
CREATE TABLE order_comments (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    author_id UUID NOT NULL, -- Can reference either employees.id or customers.id
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. order_logs table
CREATE TABLE order_logs (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES employees(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Can reference either employees.id or customers.id
    type TEXT NOT NULL CHECK (type IN ('order', 'user', 'product', 'system')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);

CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_assigned_sales_rep ON customers(assigned_sales_rep_id);
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_assigned_sales_rep ON orders(assigned_sales_rep_id);
CREATE INDEX idx_orders_assigned_designer ON orders(assigned_designer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_comments_order ON order_comments(order_id);
CREATE INDEX idx_order_comments_author ON order_comments(author_id);

CREATE INDEX idx_order_logs_order ON order_logs(order_id);
CREATE INDEX idx_order_logs_performed_by ON order_logs(performed_by);
CREATE INDEX idx_order_logs_created_at ON order_logs(created_at);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at triggers
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Employees can read own profile" ON employees
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Employees can update own profile" ON employees
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for customers
CREATE POLICY "Customers can read own profile" ON customers
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Customers can update own profile" ON customers
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Employees can read customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and sales reps can manage customers" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_rep')
        )
    );

-- RLS Policies for categories
CREATE POLICY "Everyone can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for products
CREATE POLICY "Everyone can read active products" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for orders
CREATE POLICY "Customers can read own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Employees can read relevant orders" ON orders
    FOR SELECT USING (
        assigned_sales_rep_id = auth.uid() OR
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Employees can update orders" ON orders
    FOR UPDATE USING (
        assigned_sales_rep_id = auth.uid() OR
        assigned_designer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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
                    SELECT 1 FROM employees 
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
                    SELECT 1 FROM employees 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
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
                    SELECT 1 FROM employees 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Employees can create order logs" ON order_logs
    FOR INSERT WITH CHECK (performed_by = auth.uid());

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

-- Insert sample products
INSERT INTO products (title, description, category_id, image_url, price, status) VALUES
    ('Custom Logo Embroidery', 'Professional logo embroidery for business apparel', 
     (SELECT id FROM categories WHERE name = 'Logos'), 
     'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', 
     75.00, 'active'),
    ('Sports Team Patch', 'Custom sports team patches and badges', 
     (SELECT id FROM categories WHERE name = 'Sports'), 
     'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=400', 
     45.00, 'active'),
    ('Monogram Design', 'Personalized monogram embroidery', 
     (SELECT id FROM categories WHERE name = 'Monograms'), 
     'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', 
     35.00, 'active');