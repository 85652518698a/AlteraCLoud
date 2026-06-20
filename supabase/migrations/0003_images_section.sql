-- 0003_images_section.sql
-- Add 'images' to the section CHECK constraint

ALTER TABLE files DROP CONSTRAINT IF EXISTS files_section_check;
ALTER TABLE files ADD CONSTRAINT files_section_check
  CHECK (section IN ('notes', 'assignment', 'question_paper', 'question_bank', 'lab_manual', 'images'));
