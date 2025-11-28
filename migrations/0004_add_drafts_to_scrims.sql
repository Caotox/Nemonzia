-- Add drafts column to scrims table
ALTER TABLE scrims ADD COLUMN IF NOT EXISTS drafts JSONB;
