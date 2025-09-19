/*
  # Add dummy data for testing

  1. New Data
    - Sample user profiles for different roles
    - Sample products in various categories
    - Sample orders with different statuses
    - Sample order items
  
  2. Security
    - Data is inserted with proper relationships
    - Follows existing constraints and foreign keys
*/

-- Insert sample user profiles (these will be linked to auth.users)
INSERT INTO user_profiles (id, email, full_name, role, phone, is_active) VALUES
  ('4ad87249-27bb-4b29-bf24-615789c24433', 'admin@absstitch.com', 'Admin User', 'admin', '+1-555-0100', true),
  ('550e8400-e29b-41d4-a716-446655440001', 'john.sales@absstitch.com', 'John Sales', 'sales_rep', '+1-555-0101', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'jane.designer@absstitch.com', 'Jane Designer', 'designer', '+1-555-0102', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'customer1@example.com', 'Customer One', 'customer', '+1-555-0103', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'customer2@example.com', 'Customer Two', 'customer', '+1-555-0104', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sales rep data
INSERT INTO sales_reps (id, employee_id, department, commission_rate, total_sales, active_customers) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'SR001', 'Sales', 10.0, 15000.00, 5)
ON CONFLICT (id) DO NOTHING;

-- Insert designer data
INSERT INTO designers (id, employee_id, specialties, hourly_rate, total_completed, average_rating) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'DS001', ARRAY['Embroidery', 'Custom Stitching', 'Logo Design'], 65.00, 25, 4.8)
ON CONFLICT (id) DO NOTHING;

-- Insert customer data
INSERT INTO customers (id, company_name, billing_address, assigned_sales_rep, total_orders, total_spent) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'ABC Corporation', '{"street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345"}', '550e8400-e29b-41d4-a716-446655440001', 3, 850.00),
  ('550e8400-e29b-41d4-a716-446655440004', 'XYZ Industries', '{"street": "456 Oak Ave", "city": "Business City", "state": "NY", "zip": "67890"}', '550e8400-e29b-41d4-a716-446655440001', 2, 1200.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, title, description, category, price, original_price, image_url, tags, is_active, created_by) VALUES
  ('prod-001', 'Custom Embroidered Polo Shirt', 'High-quality polo shirt with custom embroidery options', 'Apparel', 45.00, 55.00, 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg', ARRAY['polo', 'embroidery', 'custom'], true, '4ad87249-27bb-4b29-bf24-615789c24433'),
  ('prod-002', 'Corporate Logo T-Shirt', 'Comfortable cotton t-shirt perfect for corporate branding', 'Apparel', 25.00, 30.00, 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg', ARRAY['t-shirt', 'logo', 'corporate'], true, '4ad87249-27bb-4b29-bf24-615789c24433'),
  ('prod-003', 'Embroidered Baseball Cap', 'Classic baseball cap with custom embroidery', 'Accessories', 35.00, 40.00, 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg', ARRAY['cap', 'hat', 'embroidery'], true, '4ad87249-27bb-4b29-bf24-615789c24433'),
  ('prod-004', 'Custom Jacket Patches', 'High-quality embroidered patches for jackets and uniforms', 'Patches', 15.00, 20.00, 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg', ARRAY['patch', 'jacket', 'uniform'], true, '4ad87249-27bb-4b29-bf24-615789c24433'),
  ('prod-005', 'Monogrammed Towels', 'Luxury towels with custom monogramming', 'Home', 60.00, 75.00, 'https://images.pexels.com/photos/6045242/pexels-photo-6045242.jpeg', ARRAY['towel', 'monogram', 'luxury'], true, '4ad87249-27bb-4b29-bf24-615789c24433'),
  ('prod-006', 'Team Jersey Customization', 'Professional sports jersey customization service', 'Sports', 85.00, 100.00, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg', ARRAY['jersey', 'sports', 'team'], true, '4ad87249-27bb-4b29-bf24-615789c24433')
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, order_number, customer_id, sales_rep_id, assigned_designer_id, order_type, status, total_amount, custom_instructions, design_requirements, due_date) VALUES
  ('order-001', 'ORD-2024-001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'catalog', 'completed', 270.00, 'Please use company colors: blue and white', '{"colors": ["blue", "white"], "logo": "company_logo.png"}', '2024-02-15 10:00:00+00'),
  ('order-002', 'ORD-2024-002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'custom', 'in_progress', 450.00, 'Custom design needed for team uniforms', '{"design_type": "team_uniform", "sizes": ["S", "M", "L", "XL"], "quantity": 15}', '2024-03-01 10:00:00+00'),
  ('order-003', 'ORD-2024-003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', null, 'catalog', 'pending', 180.00, 'Rush order if possible', null, '2024-02-28 10:00:00+00'),
  ('order-004', 'ORD-2024-004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'custom', 'review', 320.00, 'Corporate event merchandise', '{"event": "Annual Conference 2024", "deadline": "urgent"}', '2024-02-20 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, custom_specifications) VALUES
  ('item-001', 'order-001', 'prod-001', 6, 45.00, 270.00, '{"embroidery_text": "ABC Corp", "embroidery_position": "left_chest"}'),
  ('item-002', 'order-002', 'prod-006', 15, 85.00, 1275.00, '{"jersey_numbers": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], "team_name": "ABC Warriors"}'),
  ('item-003', 'order-002', 'prod-004', 15, 15.00, 225.00, '{"patch_design": "team_logo", "attachment": "iron_on"}'),
  ('item-004', 'order-003', 'prod-002', 12, 25.00, 300.00, '{"logo_placement": "center", "logo_size": "medium"}'),
  ('item-005', 'order-004', 'prod-003', 8, 35.00, 280.00, '{"embroidery_text": "XYZ Industries", "color": "navy_blue"}'),
  ('item-006', 'order-004', 'prod-005', 4, 60.00, 240.00, '{"monogram": "XYZ", "color": "gold_thread"}')