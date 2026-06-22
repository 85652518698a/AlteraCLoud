-- 0002_downloads.sql
-- Add download counter to files table

ALTER TABLE files ADD COLUMN IF NOT EXISTS downloads BIGINT NOT NULL DEFAULT 0;
