-- Add sold column to track sales volume
ALTER TABLE products ADD COLUMN sold INT DEFAULT 0;
