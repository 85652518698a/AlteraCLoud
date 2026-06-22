-- 0004_course_taxonomy.sql
-- Add course column to files table
-- Add files table to Realtime publication

ALTER TABLE files ADD COLUMN IF NOT EXISTS course TEXT DEFAULT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'files'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE files;
  END IF;
END $$;
