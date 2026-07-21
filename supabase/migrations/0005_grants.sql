-- Migration: Table grants for Supabase roles
-- RLS policies (0002_rls.sql) are the security gate, but Postgres checks
-- table-level privileges BEFORE row-level security. Without these grants,
-- every query fails with 42501 "permission denied for table ...".

-- Schema access
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- Authenticated users get DML on all tables; RLS policies restrict
-- what each role (admin / supervisor) can actually do per table.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Supabase internal role (used by Auth triggers, dashboard, etc.)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- RLS helper must be executable by signed-in users
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- Ensure future tables created via the SQL Editor get the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
