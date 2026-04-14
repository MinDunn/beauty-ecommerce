-- =============================================
-- Migration V6: Product Variants, Gallery & Order Support
-- =============================================

-- 1. Create product_images table for multi-image gallery
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Create product_variants table
CREATE TABLE product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2), -- Optional price override
    stock_quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Update cart_items to store selected variant
ALTER TABLE cart_items ADD COLUMN variant_name VARCHAR(255);

-- 4. Update order_items to store variant info for history
ALTER TABLE order_items ADD COLUMN variant_name VARCHAR(255);
