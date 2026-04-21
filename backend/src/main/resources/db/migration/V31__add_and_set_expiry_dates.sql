ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date DATE;
UPDATE products SET expiry_date = '2026-12-15' WHERE expiry_date IS NULL;
