-- Thêm cột image_url cho biến thể sản phẩm
ALTER TABLE product_variants ADD COLUMN image_url VARCHAR(255);

-- Thêm cột variant_name cho phiếu nhập kho
ALTER TABLE inventory_receipts ADD COLUMN variant_name VARCHAR(255);
