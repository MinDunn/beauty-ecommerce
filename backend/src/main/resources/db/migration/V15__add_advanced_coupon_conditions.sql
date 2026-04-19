-- Migration V15: Thêm các điều kiện nâng cao cho mã giảm giá
ALTER TABLE coupons 
ADD COLUMN max_discount_amount DECIMAL(19, 2),
ADD COLUMN min_quantity INT DEFAULT 0,
ADD COLUMN is_new_user_only BOOLEAN DEFAULT FALSE,
ADD COLUMN min_spent_amount DECIMAL(19, 2) DEFAULT 0,
ADD COLUMN description TEXT;
