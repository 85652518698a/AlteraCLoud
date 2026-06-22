-- 0001_init.sql
-- Altera Cloud: Complete Database Schema + RLS + Storage Policies
-- Run this in Supabase SQL Editor or via `supabase migration up`

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Files table: stores all file metadata
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_path TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('notes', 'assignment', 'question_paper', 'question_bank', 'lab_manual')),
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  is_deployed BOOLEAN NOT NULL DEFAULT false,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table: tracks all admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('upload', 'delete', 'rename', 'deploy', 'undeploy', 'edit_meta')),
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin users table: centralized admin whitelist
-- Keeps admin emails in DB instead of hardcoding across 7+ files
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed admin users from the codebase constants
INSERT INTO admin_users (email, display_name, added_by) VALUES
  ('anujmhatre125@gmail.com', 'Anuj Mhatre', 'system'),
  ('nehapatil0045@gmail.com', 'Neha Patil', 'system'),
  ('anujmhatre345@gmail.com', 'Anuj Mhatre', 'system'),
  ('mhatre.anuj0855.csmu.ac.in', 'Anuj Mhatre (CSMU)', 'system')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_files_section ON files(section);
CREATE INDEX IF NOT EXISTS idx_files_is_deployed ON files(is_deployed);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_section_deployed ON files(section, is_deployed);
CREATE INDEX IF NOT EXISTS idx_files_name_trgm ON files USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================
-- 3. TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_files_updated_at ON files;
CREATE TRIGGER trigger_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. HELPER FUNCTION: check if user is admin by email
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE email = user_email);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ----- files table -----
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (even anon) can read deployed files
-- This enables the public file grid without auth
DROP POLICY IF EXISTS "Anyone can read deployed files" ON files;
CREATE POLICY "Anyone can read deployed files" ON files
  FOR SELECT
  USING (is_deployed = true);

-- Policy: Authenticated users (via Supabase Auth) can read all files
-- NOTE: If using Firebase Auth only, this won't apply to Firebase users
DROP POLICY IF EXISTS "Authenticated users can read all files" ON files;
CREATE POLICY "Authenticated users can read all files" ON files
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admin users can INSERT/UPDATE/DELETE
-- This works if admin emails are added to Supabase Auth users
DROP POLICY IF EXISTS "Admin full access via email" ON files;
CREATE POLICY "Admin full access via email" ON files
  FOR ALL
  TO authenticated
  USING (is_admin(auth.jwt() ->> 'email'))
  WITH CHECK (is_admin(auth.jwt() ->> 'email'));

-- NOTE: Mutations via Edge Functions use service_role key
-- which BYPASSES RLS entirely. The policies above are only
-- for direct Supabase client queries using the anon key.

-- ----- audit_logs table -----
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
DROP POLICY IF EXISTS "Admin read audit logs" ON audit_logs;
CREATE POLICY "Admin read audit logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.jwt() ->> 'email'));

-- Policy: Service role can insert (edge functions)
-- Service role bypasses RLS, so this is just for documentation

-- ----- admin_users table -----
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only existing admins can read admin_users
DROP POLICY IF EXISTS "Admin read admin_users" ON admin_users;
CREATE POLICY "Admin read admin_users" ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.jwt() ->> 'email'));

-- Policy: Only service_role can modify admin_users
-- Admin management should be done via Edge Function or SQL Editor

-- ============================================================
-- 6. STORAGE BUCKET & POLICIES
-- ============================================================

-- Create the storage bucket (idempotent via PL/pgSQL)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'altera-resources',
    'altera-resources',
    false,
    52428800, -- 50MB in bytes
    ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'text/csv'
    ]
  )
  ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END;
$$;

-- Storage RLS: Bucket is PRIVATE — no direct object access
-- All file access is via signed URLs generated by Edge Functions
-- Signed URLs bypass RLS, so no SELECT policies are needed

-- Explicitly deny anon/authenticated direct object access
DROP POLICY IF EXISTS "Deny anon access to altera-resources" ON storage.objects;
CREATE POLICY "Deny anon access to altera-resources" ON storage.objects
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (bucket_id <> 'altera-resources');

DROP POLICY IF EXISTS "Deny authenticated direct access to altera-resources" ON storage.objects;
CREATE POLICY "Deny authenticated direct access to altera-resources" ON storage.objects
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (bucket_id <> 'altera-resources');

-- Service role (Edge Functions) has full access for uploads, deletes, moves
DROP POLICY IF EXISTS "Service role full access to altera-resources" ON storage.objects;
CREATE POLICY "Service role full access to altera-resources" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'altera-resources')
  WITH CHECK (bucket_id = 'altera-resources');

-- ============================================================
-- 7. VERIFICATION QUERIES (run these to confirm setup)
-- ============================================================
-- SELECT * FROM files LIMIT 5;
-- SELECT * FROM audit_logs LIMIT 5;
-- SELECT * FROM admin_users;
-- SELECT * FROM storage.buckets WHERE id = 'altera-resources';
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('files', 'audit_logs', 'admin_users');
