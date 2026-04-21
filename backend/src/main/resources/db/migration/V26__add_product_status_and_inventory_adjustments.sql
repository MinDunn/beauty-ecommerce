-- Thêm cột status vào bảng products
ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;

-- Tạo bảng inventory_adjustments
CREATE TABLE inventory_adjustments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(100),
    quantity INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    compensation_amount DECIMAL(19, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    CONSTRAINT fk_adjustment_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
