-- Seed user roles
-- Run this AFTER creating the auth users in Supabase dashboard

-- Instructions:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" and create:
--    - Admin user: email = admin@example.com, password = [choose secure password]
--    - Supervisor user: email = supervisor@example.com, password = [choose secure password]
-- 3. Note the UUID for each user from the dashboard
-- 4. Update the UUIDs below and run this SQL in SQL Editor

-- Replace these UUIDs with the actual auth.users IDs from your dashboard
-- Example:
-- UPDATE profiles SET role = 'admin', full_name = 'Admin User'
-- WHERE id = '00000000-0000-0000-0000-000000000001';
--
-- UPDATE profiles SET role = 'supervisor', full_name = 'Supervisor User'
-- WHERE id = '00000000-0000-0000-0000-000000000002';

-- If the profiles were not auto-created by the trigger, insert them manually:
-- INSERT INTO profiles (id, full_name, role)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin'),
--   ('00000000-0000-0000-0000-000000000002', 'Supervisor User', 'supervisor');
