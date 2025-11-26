-- Migration: Change role column to roles array
ALTER TABLE champions DROP COLUMN IF EXISTS role;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];
