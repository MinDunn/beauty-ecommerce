-- Migration V35: Ensure skin_type_metadata table exists and has data
-- This is a healing migration to fix potential 500 errors if V33 was skipped or failed partially

-- 1. Create the table if it's missing
CREATE TABLE IF NOT EXISTS skin_type_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Ensure default data exists
INSERT IGNORE INTO skin_type_metadata (name) VALUES 
('Da dầu'), 
('Da khô'), 
('Da hỗn hợp'), 
('Da mụn'), 
('Da nhạy cảm'), 
('Mọi loại da');

-- 3. Double check columns in products table (redundant but safe)
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_types VARCHAR(500);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS skin_types VARCHAR(500);
