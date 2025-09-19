-- Correct sample-data migration (idempotent, schema-aligned)
DO $$
DECLARE
  admin_id uuid;
  sales_rep_1_id uuid;
  sales_rep_2_id uuid;
  designer_1_id uuid;
  designer_2_id uuid;
  customer_1_id uuid;
  customer_2_id uuid;

  product_1_id uuid;
  product_2_id uuid;
  product_3_id uuid;
  product_4_id uuid;
  product_5_id uuid;
  product_6_id uuid;

  order_1_id uuid;
  order_2_id uuid;
BEGIN
  -- 1) Create or find auth.users (with proper columns)
  PERFORM id FROM auth.users WHERE email = 'admin@absstitch.com';
  IF NOT FOUND THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      admin_id, 
      'admin@absstitch.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"admin"}',
      '{}'
    );
  ELSE
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@absstitch.com';
  END IF;

  -- Sales reps
  PERFORM id FROM auth.users WHERE email = 'sarah.johnson@absstitch.com';
  IF NOT FOUND THEN
    sales_rep_1_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      sales_rep_1_id, 
      'sarah.johnson@absstitch.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"sales_rep"}',
      '{}'
    );
  ELSE
    SELECT id INTO sales_rep_1_id FROM auth.users WHERE email = 'sarah.johnson@absstitch.com';
  END IF;

  PERFORM id FROM auth.users WHERE email = 'mike.chen@absstitch.com';
  IF NOT FOUND THEN
    sales_rep_2_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      sales_rep_2_id, 
      'mike.chen@absstitch.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"sales_rep"}',
      '{}'
    );
  ELSE
    SELECT id INTO sales_rep_2_id FROM auth.users WHERE email = 'mike.chen@absstitch.com';
  END IF;

  -- Designers
  PERFORM id FROM auth.users WHERE email = 'emily.rodriguez@absstitch.com';
  IF NOT FOUND THEN
    designer_1_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      designer_1_id, 
      'emily.rodriguez@absstitch.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"designer"}',
      '{}'
    );
  ELSE
    SELECT id INTO designer_1_id FROM auth.users WHERE email = 'emily.rodriguez@absstitch.com';
  END IF;

  PERFORM id FROM auth.users WHERE email = 'david.park@absstitch.com';
  IF NOT FOUND THEN
    designer_2_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      designer_2_id, 
      'david.park@absstitch.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"designer"}',
      '{}'
    );
  ELSE
    SELECT id INTO designer_2_id FROM auth.users WHERE email = 'david.park@absstitch.com';
  END IF;

  -- Customers
  PERFORM id FROM auth.users WHERE email = 'lisa.thompson@example.com';
  IF NOT FOUND THEN
    customer_1_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      customer_1_id, 
      'lisa.thompson@example.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"customer"}',
      '{}'
    );
  ELSE
    SELECT id INTO customer_1_id FROM auth.users WHERE email = 'lisa.thompson@example.com';
  END IF;

  PERFORM id FROM auth.users WHERE email = 'james.wilson@example.com';
  IF NOT FOUND THEN
    customer_2_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      customer_2_id, 
      'james.wilson@example.com', 
      crypt('password123', gen_salt('bf')), 
      now(), now(), now(),
      '{"role":"customer"}',
      '{}'
    );
  ELSE
    SELECT id INTO customer_2_id FROM auth.users WHERE email = 'james.wilson@example.com';
  END IF;

  -- 2) user_profiles (FK aligned with auth.users)
  INSERT INTO user_profiles (id, email, full_name, role, phone, is_active, notification_preferences, created_at, updated_at)
  VALUES
    (admin_id, 'admin@absstitch.com', 'System Administrator', 'admin', '+1-555-0001', true, '{"email":true,"push":true}'::jsonb, now(), now()),
    (sales_rep_1_id, 'sarah.johnson@absstitch.com', 'Sarah Johnson', 'sales_rep', '+1-555-0101', true, '{"email":true,"push":true}'::jsonb, now(), now()),
    (sales_rep_2_id, 'mike.chen@absstitch.com', 'Mike Chen', 'sales_rep', '+1-555-0102', true, '{"email":true,"push":true}'::jsonb, now(), now()),
    (designer_1_id, 'emily.rodriguez@absstitch.com', 'Emily Rodriguez', 'designer', '+1-555-0201', true, '{"email":true,"push":true}'::jsonb, now(), now()),
    (designer_2_id, 'david.park@absstitch.com', 'David Park', 'designer', '+1-555-0202', true, '{"email":true,"push":true}'::jsonb, now(), now()),
    (customer_1_id, 'lisa.thompson@example.com', 'Lisa Thompson', 'customer', '+1-555-0301', true, '{"email":true,"push":false}'::jsonb, now(), now()),
    (customer_2_id, 'james.wilson@example.com', 'James Wilson', 'customer', '+1-555-0302', true, '{"email":true,"push":false}'::jsonb, now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- ✅ Now you can continue with products, customers, designers, orders (just like in your old script),
  -- but ensure you match column names exactly from your actual schema.

END $$;
