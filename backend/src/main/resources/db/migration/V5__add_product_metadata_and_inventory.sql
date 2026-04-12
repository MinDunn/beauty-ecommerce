-- Add metadata columns to products table
ALTER TABLE products ADD COLUMN instructions TEXT;
ALTER TABLE products ADD COLUMN ingredients TEXT;

-- Create inventory_receipts table
CREATE TABLE inventory_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    cost_price DECIMAL(15,2) NOT NULL,
    quantity INT NOT NULL,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
