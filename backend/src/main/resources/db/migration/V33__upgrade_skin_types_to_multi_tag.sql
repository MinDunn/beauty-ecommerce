-- Migration V31: Upgrade skin_type to multi-tag version (skin_types)
-- We use VARCHAR(500) to store comma-separated tags

-- 1. Update products table
ALTER TABLE products CHANGE COLUMN skin_type skin_types VARCHAR(500);

-- 2. Update product_variants table
ALTER TABLE product_variants ADD COLUMN skin_types VARCHAR(500);

-- 3. Create master list for skin type options
CREATE TABLE IF NOT EXISTS skin_type_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Insert default options
INSERT IGNORE INTO skin_type_metadata (name) VALUES 
('Da dầu'), 
('Da khô'), 
('Da hỗn hợp'), 
('Da mụn'), 
('Da nhạy cảm'), 
('Mọi loại da');
