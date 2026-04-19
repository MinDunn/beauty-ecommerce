ALTER TABLE coupons ADD COLUMN category_id BIGINT;
ALTER TABLE coupons ADD CONSTRAINT fk_coupons_category FOREIGN KEY (category_id) REFERENCES categories(id);
