-- Add view_count column to track trending products
ALTER TABLE products ADD COLUMN view_count BIGINT DEFAULT 0;
