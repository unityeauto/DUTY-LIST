-- Migration: Seed an admin user for testing
-- This creates a test admin account that you can use to log in
-- Email: admin@example.com
-- Password: admin123 (change this after first login!)
-- Role: admin

-- NOTE: This migration will only work if you have access to auth.users
-- For production, create users via Supabase Dashboard > Authentication > Users
-- or via your app's signup flow

-- Example profile insert (you'll need to create the auth.users entry first via Supabase Dashboard)
-- After creating a user in Supabase Dashboard with email admin@example.com,
-- the trigger will auto-create the profile, but you may need to update the role:

-- UPDATE profiles
-- SET role = 'admin', full_name = 'Admin User'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
