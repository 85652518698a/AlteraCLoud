-- 0004_course_taxonomy.sql
-- Add course column to files table
-- Add files table to Realtime publication

ALTER TABLE files ADD COLUMN IF NOT EXISTS course TEXT DEFAULT NULL;

ALTER PUBLICATION supabase_realtime ADD TABLE files;
