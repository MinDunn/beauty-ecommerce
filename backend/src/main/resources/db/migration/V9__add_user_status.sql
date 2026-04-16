-- Add is_active column to users table
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
