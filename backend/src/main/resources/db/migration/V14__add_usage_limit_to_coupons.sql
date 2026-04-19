-- Migration V14: Bổ sung các cột theo dõi lượt sử dụng cho mã giảm giá
ALTER TABLE coupons 
ADD COLUMN usage_limit INT NOT NULL DEFAULT 100,
ADD COLUMN usage_count INT NOT NULL DEFAULT 0;
