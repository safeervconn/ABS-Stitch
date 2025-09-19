/*
  # Add dummy users for testing

  1. New Records
    - Creates test users for each role type
    - Includes user profiles with proper role assignments
    - Creates role-specific records (customers, sales_reps, designers)
    - Adds sample products for catalog testing

  2. Test Users Created
    - Admin: admin@absstitch.com (password: admin123)
    - Sales Rep: sales@absstitch.com (password: sales123)
    - Designer: designer@absstitch.com (password: design123)
    - Customer: customer@absstitch.com (password: customer123)

  3. Sample Data
    - Products for catalog display
    - Customer records with billing info
    - Sales rep and designer profiles

  Note: These are dummy users for testing purposes only
*/

-- Insert dummy user profiles (these will be created when users sign up)
-- The actual auth users need to be created through the signup process

-- First, let's add some sample products for the catalog
INSERT INTO products (title, description, category, price, original_price, image_url, tags, is_active, created_at) VALUES
('Classic Logo Embroidery', 'Professional logo embroidery perfect for corporate apparel', 'Corporate', 45.00, 55.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['logo', 'corporate', 'professional'], true, now()),
('Custom Text Design', 'Personalized text embroidery with various font options', 'Custom', 25.00, null, 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['text', 'custom', 'personalized'], true, now()),
('Floral Pattern', 'Beautiful floral embroidery design for elegant apparel', 'Decorative', 35.00, 42.00, 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['floral', 'decorative', 'elegant'], true, now()),
('Sports Team Logo', 'Custom sports team logo embroidery', 'Sports', 40.00, null, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'logo'], true, now()),
('Monogram Design', 'Classic monogram embroidery for personal items', 'Personal', 20.00, 25.00, 'https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'personal', 'classic'], true, now()),
('Abstract Art Pattern', 'Modern abstract design for contemporary apparel', 'Artistic', 50.00, null, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['abstract', 'modern', 'artistic'], true, now()),
('Vintage Badge Design', 'Retro-style badge embroidery with vintage appeal', 'Vintage', 38.00, 45.00, 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['vintage', 'retro', 'badge'], true, now()),
('Nature Scene', 'Scenic nature embroidery perfect for outdoor apparel', 'Nature', 42.00, null, 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['nature', 'scenic', 'outdoor'], true, now()),
('Geometric Pattern', 'Clean geometric design for modern styling', 'Modern', 30.00, 35.00, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['geometric', 'modern', 'clean'], true, now()),
('Holiday Theme', 'Festive holiday embroidery for seasonal apparel', 'Seasonal', 28.00, null, 'https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['holiday', 'festive', 'seasonal'], true, now());

-- Note: The actual user accounts need to be created through the signup process
-- because Supabase Auth handles password hashing and user creation.
-- 
-- To test the application:
-- 1. Go to /signup and create accounts with these emails:
--    - admin@absstitch.com (will automatically get admin role)
--    - sales@absstitch.com 
--    - designer@absstitch.com
--    - customer@absstitch.com
-- 
-- 2. The system will automatically create the appropriate profiles and role records
--
-- For now, we'll create placeholder UUIDs that can be updated when real users sign up

-- Create some sample user profiles (these will be replaced when real users sign up)
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
    sales_id uuid := gen_random_uuid();
    designer_id uuid := gen_random_uuid();
    customer_id uuid := gen_random_uuid();
BEGIN
    -- Insert sample user profiles
    INSERT INTO user_profiles (id, email, full_name, role, phone, is_active, created_at) VALUES
    (admin_id, 'admin@absstitch.com', 'Admin User', 'admin', '+1-555-0001', true, now()),
    (sales_id, 'sales@absstitch.com', 'Sales Representative', 'sales_rep', '+1-555-0002', true, now()),
    (designer_id, 'designer@absstitch.com', 'Jane Designer', 'designer', '+1-555-0003', true, now()),
    (customer_id, 'customer@absstitch.com', 'John Customer', 'customer', '+1-555-0004', true, now());

    -- Insert sales rep record
    INSERT INTO sales_reps (id, employee_id, department, commission_rate, total_sales, active_customers) VALUES
    (sales_id, 'SR001', 'Sales', 12.5, 15000.00, 25);

    -- Insert designer record
    INSERT INTO designers (id, employee_id, specialties, hourly_rate, total_completed, average_rating) VALUES
    (designer_id, 'DS001', ARRAY['Logo Design', 'Custom Embroidery', 'Corporate Branding'], 65.00, 150, 4.8);

    -- Insert customer record
    INSERT INTO customers (id, company_name, billing_address, assigned_sales_rep, total_orders, total_spent) VALUES
    (customer_id, 'Test Company LLC', 
     '{"street": "123 Test St", "city": "Test City", "state": "TS", "zip": "12345", "country": "USA"}'::jsonb,
     sales_id, 5, 450.00);

    -- Insert some sample orders
    INSERT INTO orders (order_number, customer_id, sales_rep_id, assigned_designer_id, order_type, status, total_amount, custom_instructions, due_date) VALUES
    ('ORD-' || extract(epoch from now())::bigint || '-001', customer_id, sales_id, designer_id, 'custom', 'in_progress', 125.00, 'Custom logo design for company t-shirts', now() + interval '5 days'),
    ('ORD-' || extract(epoch from now())::bigint || '-002', customer_id, sales_id, null, 'catalog', 'pending', 75.00, 'Floral pattern for polo shirts', now() + interval '3 days'),
    ('ORD-' || extract(epoch from now())::bigint || '-003', customer_id, sales_id, designer_id, 'custom', 'completed', 200.00, 'Corporate branding package', now() - interval '2 days');

END $$;

-- Add some notifications for testing
INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
SELECT 
    up.id,
    CASE 
        WHEN up.role = 'admin' THEN 'System Update'
        WHEN up.role = 'sales_rep' THEN 'New Lead Assigned'
        WHEN up.role = 'designer' THEN 'Project Ready for Review'
        WHEN up.role = 'customer' THEN 'Order Status Update'
    END,
    CASE 
        WHEN up.role = 'admin' THEN 'System maintenance completed successfully'
        WHEN up.role = 'sales_rep' THEN 'A new customer inquiry has been assigned to you'
        WHEN up.role = 'designer' THEN 'Order ORD-123 is ready for your review'
        WHEN up.role = 'customer' THEN 'Your order has been updated to in progress'
    END,
    'info',
    false,
    now()
FROM user_profiles up
WHERE up.email IN ('admin@absstitch.com', 'sales@absstitch.com', 'designer@absstitch.com', 'customer@absstitch.com');