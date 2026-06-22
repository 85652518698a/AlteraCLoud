-- 0006_views.sql
-- Add views counter column to files table

ALTER TABLE files ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;