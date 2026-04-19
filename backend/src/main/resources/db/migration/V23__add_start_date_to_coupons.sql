-- Migration to add start_date column to coupons table
ALTER TABLE coupons ADD COLUMN start_date DATETIME;

-- Set default value for existing coupons
UPDATE coupons SET start_date = created_at WHERE start_date IS NULL;
UPDATE coupons SET start_date = NOW() WHERE start_date IS NULL;
