CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collection_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, file_id)
);

CREATE INDEX idx_collections_created_by ON collections(created_by);
CREATE INDEX idx_collection_files_collection ON collection_files(collection_id);
CREATE INDEX idx_collection_files_file ON collection_files(file_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collections"
  ON collections FOR SELECT USING (true);

CREATE POLICY "Anyone can read collection_files"
  ON collection_files FOR SELECT USING (true);

alter publication supabase_realtime add table collections;
alter publication supabase_realtime add table collection_files;
