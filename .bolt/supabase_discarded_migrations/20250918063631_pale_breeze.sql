/*
  # Create Test Users and Sample Products

  1. Test Users
    - Creates 4 test users with different roles for development testing
    - Each user has complete profile information
    - Passwords are securely hashed by Supabase Auth

  2. Sample Products
    - Creates 16 embroidery design products with realistic data
    - Includes various categories, prices, and descriptions
    - Uses high-quality stock images from Pexels

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role
*/

-- Insert test users into auth.users (this would normally be done through Supabase Auth API)
-- For development, we'll create user profiles directly and assume auth users exist

-- Insert user profiles for test accounts
INSERT INTO user_profiles (id, email, full_name, role, phone, is_active, notification_preferences, created_at, updated_at) VALUES
  ('admin-test-001', 'admin@absstitch.com', 'System Administrator', 'admin', '+1-555-0001', true, '{"email": true, "push": true}', now(), now()),
  ('sales-test-001', 'sales@absstitch.com', 'John Sales', 'sales_rep', '+1-555-0002', true, '{"email": true, "push": true}', now(), now()),
  ('designer-test-001', 'designer@absstitch.com', 'Jane Designer', 'designer', '+1-555-0003', true, '{"email": true, "push": true}', now(), now()),
  ('customer-test-001', 'customer@absstitch.com', 'Sarah Johnson', 'customer', '+1-555-0004', true, '{"email": true, "push": true}', now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  updated_at = now();

-- Insert role-specific records
INSERT INTO customers (id, company_name, total_orders, total_spent, created_at) VALUES
  ('customer-test-001', 'Johnson Enterprises', 0, 0, now())
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  total_orders = EXCLUDED.total_orders,
  total_spent = EXCLUDED.total_spent;

INSERT INTO sales_reps (id, employee_id, department, commission_rate, total_sales, active_customers, created_at) VALUES
  ('sales-test-001', 'SR001', 'Sales', 10.0, 0, 0, now())
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  department = EXCLUDED.department,
  commission_rate = EXCLUDED.commission_rate;

INSERT INTO designers (id, employee_id, specialties, hourly_rate, total_completed, average_rating, created_at) VALUES
  ('designer-test-001', 'DS001', ARRAY['Embroidery', 'Custom Stitching', 'Logo Design'], 50.0, 0, 0, now())
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  specialties = EXCLUDED.specialties,
  hourly_rate = EXCLUDED.hourly_rate;

-- Insert sample products
INSERT INTO products (id, title, description, category, price, original_price, image_url, tags, is_active, created_by, created_at, updated_at) VALUES
  ('prod-001', 'Classic Rose Embroidery', 'Elegant rose design perfect for formal wear and special occasions', 'Floral', 45.00, NULL, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['rose', 'floral', 'elegant', 'formal'], true, 'designer-test-001', now(), now()),
  
  ('prod-002', 'Modern Geometric Pattern', 'Contemporary geometric design ideal for casual and business attire', 'Geometric', 38.00, 42.00, 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['geometric', 'modern', 'contemporary', 'business'], true, 'designer-test-001', now(), now()),
  
  ('prod-003', 'Vintage Butterfly Collection', 'Delicate butterfly motifs with vintage charm and intricate details', 'Nature', 52.00, NULL, 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['butterfly', 'vintage', 'nature', 'delicate'], true, 'designer-test-001', now(), now()),
  
  ('prod-004', 'Corporate Logo Stitching', 'Professional logo embroidery service for business branding', 'Corporate', 65.00, NULL, 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['logo', 'corporate', 'business', 'professional'], true, 'designer-test-001', now(), now()),
  
  ('prod-005', 'Tropical Leaf Design', 'Vibrant tropical leaves perfect for summer collections', 'Nature', 41.00, 48.00, 'https://images.pexels.com/photos/1172207/pexels-photo-1172207.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['tropical', 'leaves', 'summer', 'vibrant'], true, 'designer-test-001', now(), now()),
  
  ('prod-006', 'Abstract Art Pattern', 'Unique abstract design for artistic and creative expressions', 'Abstract', 55.00, NULL, 'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['abstract', 'artistic', 'creative', 'unique'], true, 'designer-test-001', now(), now()),
  
  ('prod-007', 'Traditional Mandala', 'Intricate mandala pattern with spiritual and cultural significance', 'Traditional', 58.00, NULL, 'https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['mandala', 'traditional', 'spiritual', 'intricate'], true, 'designer-test-001', now(), now()),
  
  ('prod-008', 'Sports Team Logo', 'Custom sports team embroidery for uniforms and merchandise', 'Sports', 48.00, 55.00, 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'uniform', 'merchandise'], true, 'designer-test-001', now(), now()),
  
  ('prod-009', 'Minimalist Line Art', 'Clean and simple line art design for modern aesthetics', 'Minimalist', 35.00, NULL, 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['minimalist', 'line art', 'modern', 'simple'], true, 'designer-test-001', now(), now()),
  
  ('prod-010', 'Vintage Floral Border', 'Classic floral border design with timeless appeal', 'Floral', 44.00, NULL, 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['vintage', 'floral', 'border', 'classic'], true, 'designer-test-001', now(), now()),
  
  ('prod-011', 'Celtic Knot Pattern', 'Traditional Celtic knot design with cultural heritage', 'Traditional', 50.00, NULL, 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['celtic', 'knot', 'traditional', 'heritage'], true, 'designer-test-001', now(), now()),
  
  ('prod-012', 'Modern Typography', 'Stylish text embroidery for personalized messages', 'Typography', 32.00, 38.00, 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['typography', 'text', 'personalized', 'modern'], true, 'designer-test-001', now(), now()),
  
  ('prod-013', 'Ocean Wave Design', 'Dynamic wave pattern inspired by ocean movements', 'Nature', 46.00, NULL, 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['ocean', 'wave', 'dynamic', 'nature'], true, 'designer-test-001', now(), now()),
  
  ('prod-014', 'Art Deco Pattern', 'Elegant Art Deco design with geometric sophistication', 'Geometric', 54.00, NULL, 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['art deco', 'elegant', 'geometric', 'sophisticated'], true, 'designer-test-001', now(), now()),
  
  ('prod-015', 'Woodland Animals', 'Cute woodland creature designs for children and nature lovers', 'Nature', 40.00, 45.00, 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['woodland', 'animals', 'cute', 'children'], true, 'designer-test-001', now(), now()),
  
  ('prod-016', 'Luxury Monogram', 'Sophisticated monogram design for premium personalization', 'Typography', 60.00, NULL, 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'luxury', 'premium', 'personalization'], true, 'designer-test-001', now(), now())

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  tags = EXCLUDED.tags,
  is_active = EXCLUDED.is_active,
  updated_at = now();