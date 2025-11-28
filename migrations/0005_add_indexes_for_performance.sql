-- Migration: Add indexes for better query performance
-- This improves the speed of common queries

-- Index on champions name for alphabetical sorting
CREATE INDEX IF NOT EXISTS idx_champions_name ON champions(name);

-- Index on champion_evaluations for faster lookups
CREATE INDEX IF NOT EXISTS idx_champion_evaluations_champion_id ON champion_evaluations(champion_id);

-- Index on player_availability for faster filtering
CREATE INDEX IF NOT EXISTS idx_player_availability_player_id ON player_availability(player_id);
CREATE INDEX IF NOT EXISTS idx_player_availability_day ON player_availability(day_of_week);

-- Index on scrims for date filtering
CREATE INDEX IF NOT EXISTS idx_scrims_date ON scrims(date);

-- Index on drafts name for searching
CREATE INDEX IF NOT EXISTS idx_drafts_name ON drafts(name);

-- Index on champion_synergies for faster lookups
CREATE INDEX IF NOT EXISTS idx_champion_synergies_champion1_id ON champion_synergies(champion1_id);
CREATE INDEX IF NOT EXISTS idx_champion_synergies_champion2_id ON champion_synergies(champion2_id);
