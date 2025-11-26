-- Migration: Add role column to champions table
ALTER TABLE champions ADD COLUMN IF NOT EXISTS role TEXT;
