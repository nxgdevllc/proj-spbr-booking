-- Migrate Existing Users to Supabase Auth
-- This script creates initial users in Supabase Auth system
-- Run this after setting up Supabase Auth

-- Create admin user
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
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@sanpedrobeachresort.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "System Administrator"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create corresponding user profile for admin
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@sanpedrobeachresort.com'),
  'admin@sanpedrobeachresort.com',
  'System Administrator',
  'admin',
  NOW(),
  NOW()
);

-- Create manager user
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
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'manager@sanpedrobeachresort.com',
  crypt('manager123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Resort Manager"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create corresponding user profile for manager
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'manager@sanpedrobeachresort.com'),
  'manager@sanpedrobeachresort.com',
  'Resort Manager',
  'manager',
  NOW(),
  NOW()
);

-- Create employee user
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
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'employee@sanpedrobeachresort.com',
  crypt('employee123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Resort Employee"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create corresponding user profile for employee
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'employee@sanpedrobeachresort.com'),
  'employee@sanpedrobeachresort.com',
  'Resort Employee',
  'employee',
  NOW(),
  NOW()
);

-- Create guest user (for testing)
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
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'guest@sanpedrobeachresort.com',
  crypt('guest123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Guest User"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create corresponding user profile for guest
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'guest@sanpedrobeachresort.com'),
  'guest@sanpedrobeachresort.com',
  'Guest User',
  'guest',
  NOW(),
  NOW()
);

-- Verify the users were created
SELECT 
  u.email,
  up.full_name,
  up.role,
  u.email_confirmed_at
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
ORDER BY up.role, u.email;
