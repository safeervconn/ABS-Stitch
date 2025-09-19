/*
  # Populate Sample Data

  This migration populates the database with sample data for development and testing.

  1. New Data
    - 1 admin user with profile
    - 2 sales representatives with profiles and sales_reps records
    - 2 designers with profiles and designers records
    - 2 customers with profiles and customers records
    - 6 products in various categories
    - 2 orders linking customers, sales reps, and designers
    - 4 order items for the orders, each linking to different products

  2. Data Structure
    - All users have realistic but clearly dummy data
    - Foreign key relationships are properly maintained
    - UUIDs are generated for all ID fields
    - All required fields are populated with appropriate values

  3. Authentication
    - Users are created in auth.users with encrypted passwords
    - All passwords are set to 'password123' for testing
    - Email confirmation is disabled for sample users
*/

-- Insert users into auth.users first (these would normally be created by Supabase Auth)
-- Note: In a real application, users would be created through the auth system
-- This is for development/testing purposes only

-- Generate UUIDs for our sample users
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
    sales_rep_1_id uuid := gen_random_uuid();
    sales_rep_2_id uuid := gen_random_uuid();
    designer_1_id uuid := gen_random_uuid();
    designer_2_id uuid := gen_random_uuid();
    customer_1_id uuid := gen_random_uuid();
    customer_2_id uuid := gen_random_uuid();
    
    product_1_id uuid := gen_random_uuid();
    product_2_id uuid := gen_random_uuid();
    product_3_id uuid := gen_random_uuid();
    product_4_id uuid := gen_random_uuid();
    product_5_id uuid := gen_random_uuid();
    product_6_id uuid := gen_random_uuid();
    
    order_1_id uuid := gen_random_uuid();
    order_2_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users (simulating Supabase Auth user creation)
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES 
    (admin_id, 'admin@absstitch.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
    (sales_rep_1_id, 'sarah.johnson@absstitch.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
    (sales_rep_2_id, 'mike.chen@absstitch.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
    (designer_1_id, 'emily.rodriguez@absstitch.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
    (designer_2_id, 'david.park@absstitch.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
    (customer_1_id, 'lisa.thompson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
    (customer_2_id, 'james.wilson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated');

    -- Insert user profiles
    INSERT INTO user_profiles (
        id, 
        email, 
        full_name, 
        role, 
        phone, 
        is_active, 
        notification_preferences,
        created_at,
        updated_at
    ) VALUES 
    (admin_id, 'admin@absstitch.com', 'System Administrator', 'admin', '+1-555-0001', true, '{"email": true, "push": true}', now(), now()),
    (sales_rep_1_id, 'sarah.johnson@absstitch.com', 'Sarah Johnson', 'sales_rep', '+1-555-0101', true, '{"email": true, "push": true}', now(), now()),
    (sales_rep_2_id, 'mike.chen@absstitch.com', 'Mike Chen', 'sales_rep', '+1-555-0102', true, '{"email": true, "push": true}', now(), now()),
    (designer_1_id, 'emily.rodriguez@absstitch.com', 'Emily Rodriguez', 'designer', '+1-555-0201', true, '{"email": true, "push": true}', now(), now()),
    (designer_2_id, 'david.park@absstitch.com', 'David Park', 'designer', '+1-555-0202', true, '{"email": true, "push": true}', now(), now()),
    (customer_1_id, 'lisa.thompson@example.com', 'Lisa Thompson', 'customer', '+1-555-0301', true, '{"email": true, "push": false}', now(), now()),
    (customer_2_id, 'james.wilson@example.com', 'James Wilson', 'customer', '+1-555-0302', true, '{"email": true, "push": false}', now(), now());

    -- Insert sales representatives
    INSERT INTO sales_reps (
        id, 
        employee_id, 
        department, 
        commission_rate, 
        total_sales, 
        active_customers,
        created_at
    ) VALUES 
    (sales_rep_1_id, 'SR001', 'Sales', 12.5, 15750.00, 8, now()),
    (sales_rep_2_id, 'SR002', 'Sales', 10.0, 12300.00, 6, now());

    -- Insert designers
    INSERT INTO designers (
        id, 
        employee_id, 
        specialties, 
        hourly_rate, 
        total_completed, 
        average_rating,
        created_at
    ) VALUES 
    (designer_1_id, 'DS001', ARRAY['Embroidery', 'Logo Design', 'Custom Stitching'], 55.00, 23, 4.8, now()),
    (designer_2_id, 'DS002', ARRAY['Embroidery', 'Patches', 'Monogramming'], 50.00, 18, 4.9, now());

    -- Insert customers
    INSERT INTO customers (
        id, 
        company_name, 
        billing_address, 
        assigned_sales_rep, 
        total_orders, 
        total_spent,
        created_at
    ) VALUES 
    (customer_1_id, 'Thompson Enterprises', '{"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', sales_rep_1_id, 3, 450.00, now()),
    (customer_2_id, 'Wilson Restaurant Group', '{"street": "456 Commerce St", "city": "Los Angeles", "state": "CA", "zip": "90210", "country": "USA"}', sales_rep_2_id, 2, 320.00, now());

    -- Insert products
    INSERT INTO products (
        id,
        title,
        description,
        category,
        price,
        original_price,
        image_url,
        tags,
        is_active,
        created_by,
        created_at,
        updated_at
    ) VALUES 
    (product_1_id, 'Classic Logo Embroidery', 'Professional logo embroidery for business apparel. High-quality stitching with vibrant colors.', 'Logo Design', 45.00, 55.00, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['logo', 'business', 'professional'], true, admin_id, now(), now()),
    (product_2_id, 'Custom Text Monogram', 'Personalized text embroidery for shirts, jackets, and accessories. Choose your font and colors.', 'Monogramming', 25.00, null, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'text', 'personalized'], true, admin_id, now(), now()),
    (product_3_id, 'Sports Team Patch', 'Custom sports team patches with team colors and mascot. Perfect for uniforms and fan gear.', 'Patches', 35.00, 40.00, 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'patch'], true, admin_id, now(), now()),
    (product_4_id, 'Floral Design Embroidery', 'Beautiful floral patterns perfect for decorative clothing and home textiles.', 'Decorative', 30.00, null, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['floral', 'decorative', 'elegant'], true, admin_id, now(), now()),
    (product_5_id, 'Corporate Badge Design', 'Professional employee badges and name tags with company branding.', 'Corporate', 20.00, 25.00, 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['corporate', 'badge', 'employee'], true, admin_id, now(), now()),
    (product_6_id, 'Custom Artwork Embroidery', 'Turn your artwork into beautiful embroidery. Upload your design and we will stitch it perfectly.', 'Custom Design', 65.00, null, 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['custom', 'artwork', 'unique'], true, admin_id, now(), now());

    -- Insert orders
    INSERT INTO orders (
        id,
        order_number,
        customer_id,
        sales_rep_id,
        assigned_designer_id,
        order_type,
        status,
        total_amount,
        custom_instructions,
        design_requirements,
        due_date,
        created_at,
        updated_at
    ) VALUES 
    (order_1_id, 'ORD-2025-001', customer_1_id, sales_rep_1_id, designer_1_id, 'catalog', 'in_progress', 150.00, 'Please use company colors: navy blue and gold. Logo should be centered on chest area.', '{"designSize": "medium", "apparelType": "polo shirt", "colors": ["navy blue", "gold"]}', now() + interval '5 days', now() - interval '2 days', now()),
    (order_2_id, 'ORD-2025-002', customer_2_id, sales_rep_2_id, designer_2_id, 'custom', 'review', 220.00, 'Restaurant logo for chef uniforms. Need 12 pieces total. Logo should include restaurant name and chef hat icon.', '{"designSize": "large", "apparelType": "chef uniform", "quantity": 12}', now() + interval '7 days', now() - interval '1 day', now());

    -- Insert order items
    INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        unit_price,
        total_price,
        custom_specifications,
        created_at
    ) VALUES 
    -- Order 1 items
    (order_1_id, product_1_id, 2, 45.00, 90.00, '{"color": "navy blue", "placement": "left chest"}', now()),
    (order_1_id, product_2_id, 3, 25.00, 75.00, '{"text": "Thompson Enterprises", "font": "Arial Bold"}', now()),
    
    -- Order 2 items  
    (order_2_id, product_3_id, 1, 35.00, 35.00, '{"design": "chef hat with restaurant name"}', now()),
    (order_2_id, product_6_id, 1, 65.00, 65.00, '{"artwork": "custom restaurant logo", "size": "4x4 inches"}', now());

    -- Update customer totals based on orders
    UPDATE customers SET 
        total_orders = 1,
        total_spent = 165.00
    WHERE id = customer_1_id;

    UPDATE customers SET 
        total_orders = 1, 
        total_spent = 100.00
    WHERE id = customer_2_id;

    -- Update sales rep totals
    UPDATE sales_reps SET 
        total_sales = total_sales + 165.00,
        active_customers = active_customers + 1
    WHERE id = sales_rep_1_id;

    UPDATE sales_reps SET 
        total_sales = total_sales + 100.00,
        active_customers = active_customers + 1
    WHERE id = sales_rep_2_id;

    -- Update designer totals
    UPDATE designers SET 
        total_completed = total_completed + 1
    WHERE id IN (designer_1_id, designer_2_id);

END $$;

-- Insert some notifications for users
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    is_read,
    related_order_id,
    created_at
)
SELECT 
    up.id,
    'Welcome to ABS STITCH!',
    'Thank you for joining our embroidery platform. Explore our catalog and place your first order.',
    'info',
    false,
    null,
    now()
FROM user_profiles up
WHERE up.role = 'customer';

-- Insert order status history for existing orders
INSERT INTO order_status_history (
    order_id,
    status,
    changed_by,
    notes,
    created_at
)
SELECT 
    o.id,
    'pending',
    o.sales_rep_id,
    'Order created and assigned to sales representative',
    o.created_at
FROM orders o;

INSERT INTO order_status_history (
    order_id,
    status,
    changed_by,
    notes,
    created_at
)
SELECT 
    o.id,
    'assigned',
    o.sales_rep_id,
    'Order assigned to designer: ' || d.user_profiles.full_name,
    o.created_at + interval '1 hour'
FROM orders o
JOIN designers d ON d.id = o.assigned_designer_id
JOIN user_profiles ON user_profiles.id = d.id;

INSERT INTO order_status_history (
    order_id,
    status,
    changed_by,
    notes,
    created_at
)
SELECT 
    o.id,
    o.status,
    o.assigned_designer_id,
    CASE 
        WHEN o.status = 'in_progress' THEN 'Designer started working on the project'
        WHEN o.status = 'review' THEN 'Design completed and sent for review'
        ELSE 'Status updated'
    END,
    o.updated_at
FROM orders o
WHERE o.status IN ('in_progress', 'review');