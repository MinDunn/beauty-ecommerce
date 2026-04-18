-- Add social login support columns to users table
ALTER TABLE users ADD COLUMN provider VARCHAR(20) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) DEFAULT NULL;

-- Allow password to be NULL for social login users
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) DEFAULT NULL;
