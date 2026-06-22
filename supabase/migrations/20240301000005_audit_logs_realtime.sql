-- 0005_audit_logs_realtime.sql
-- Add audit_logs table to Realtime publication

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
  END IF;
END $$;

ALTER TABLE audit_logs REPLICA IDENTITY DEFAULT;