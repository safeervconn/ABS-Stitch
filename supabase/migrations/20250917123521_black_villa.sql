/*
  # Create Sample Data for Testing

  1. Sample Products
    - Create realistic embroidery design products
    - Include various categories and price points
    - Add proper image URLs and descriptions

  2. Test Users
    - Create demo users for each role
    - Include realistic profile data
    - Set up proper role-specific records

  3. Sample Orders
    - Create test orders for demonstration
    - Link customers, sales reps, and designers
    - Include various order statuses
*/

-- Insert sample products
INSERT INTO products (title, description, category, price, original_price, image_url, tags, is_active, created_at) VALUES
('Abstract Waves Design', 'Beautiful abstract wave pattern perfect for modern embroidery applications. Features flowing lines and dynamic movement.', 'Digital Art', 25.00, 35.00, 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['abstract', 'waves', 'modern', 'blue'], true, now()),
('Geometric Pattern Set', 'Clean geometric patterns ideal for apparel and corporate branding. Includes multiple variations and color schemes.', 'T-Shirt Design', 30.00, null, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['geometric', 'pattern', 'corporate', 'modern'], true, now()),
('Nature Inspired Logo', 'Organic nature-inspired design perfect for eco-friendly brands and outdoor companies. Hand-crafted botanical elements.', 'Logo Design', 35.00, null, 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['nature', 'organic', 'eco', 'botanical'], true, now()),
('Minimalist Icon Collection', 'Professional minimalist icon set for business applications. Clean lines and versatile design elements.', 'Icon Set', 20.00, null, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['minimalist', 'icons', 'business', 'clean'], true, now()),
('Vintage Typography Design', 'Retro vintage typography perfect for nostalgic branding and classic apparel designs. Authentic vintage feel.', 'T-Shirt Design', 28.00, null, 'https://images.pexels.com/photos/1070542/pexels-photo-1070542.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['vintage', 'typography', 'retro', 'classic'], true, now()),
('Modern Landscape Art', 'Contemporary landscape artwork for interior decoration and wall art applications. Sophisticated color palette.', 'Wall Art', 40.00, null, 'https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['landscape', 'modern', 'interior', 'sophisticated'], true, now()),
('Cosmic Dreams Pattern', 'Dreamy cosmic artwork with vibrant space themes. Perfect for youth apparel and creative applications.', 'Digital Art', 32.00, null, 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['space', 'cosmic', 'vibrant', 'creative'], true, now()),
('Urban Street Art Style', 'Bold urban street art design for edgy apparel and youth-oriented branding. Authentic street culture aesthetic.', 'T-Shirt Design', 26.00, null, 'https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['urban', 'street', 'edgy', 'youth'], true, now()),
('Floral Elegance Collection', 'Elegant floral designs perfect for beauty, wellness, and feminine brands. Delicate and sophisticated patterns.', 'Logo Design', 38.00, null, 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['floral', 'elegant', 'feminine', 'beauty'], true, now()),
('Tech Circuit Design', 'High-tech circuit board pattern for technology companies and modern applications. Futuristic aesthetic.', 'Digital Art', 29.00, null, 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['tech', 'circuit', 'futuristic', 'modern'], true, now()),
('Watercolor Splash Art', 'Vibrant watercolor splash artwork for creative spaces and artistic applications. Dynamic color blending.', 'Wall Art', 33.00, null, 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['watercolor', 'artistic', 'vibrant', 'creative'], true, now()),
('Classic Monogram Set', 'Timeless monogram designs for personal branding and luxury applications. Elegant and versatile.', 'Logo Design', 24.00, null, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['monogram', 'classic', 'luxury', 'elegant'], true, now()),
('Sports Team Logo', 'Dynamic sports team logo design with bold typography and athletic elements. Perfect for team branding.', 'Logo Design', 45.00, null, 'https://images.pexels.com/photos/1070542/pexels-photo-1070542.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['sports', 'team', 'athletic', 'bold'], true, now()),
('Mandala Pattern Design', 'Intricate mandala pattern for spiritual and wellness brands. Detailed geometric sacred geometry.', 'Digital Art', 31.00, null, 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['mandala', 'spiritual', 'geometric', 'wellness'], true, now()),
('Corporate Badge Set', 'Professional corporate badge and emblem designs for business applications. Authority and trust.', 'Logo Design', 42.00, null, 'https://images.pexels.com/photos/1194775/pexels-photo-1194775.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['corporate', 'badge', 'professional', 'business'], true, now()),
('Artistic Brush Strokes', 'Expressive brush stroke patterns for creative and artistic applications. Hand-painted aesthetic.', 'Digital Art', 27.00, null, 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['artistic', 'brush', 'expressive', 'creative'], true, now());

-- Note: Test users will be created through the application signup process
-- This ensures proper authentication setup and role-based record creation

-- Create some sample orders (these will be linked to users created through the app)
-- Orders will be created through the application interface to maintain proper relationships