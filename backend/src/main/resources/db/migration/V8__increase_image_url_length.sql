-- Tăng độ dài cột image_url cho biến thể sản phẩm
ALTER TABLE product_variants MODIFY COLUMN image_url VARCHAR(500);
