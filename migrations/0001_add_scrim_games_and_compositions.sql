-- Migration: Add numberOfGames and compositions to scrims table
ALTER TABLE scrims ADD COLUMN IF NOT EXISTS number_of_games INTEGER;
ALTER TABLE scrims ADD COLUMN IF NOT EXISTS compositions JSONB;
