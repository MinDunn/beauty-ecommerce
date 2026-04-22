-- V38__add_legal_compliance_fields.sql
-- Thêm các trường tuân thủ pháp lý theo NĐ 85 và NĐ 13

-- Bổ sung Xuất xứ và Thông tin cảnh báo cho sản phẩm (Theo NĐ 85)
ALTER TABLE products ADD COLUMN origin VARCHAR(255) DEFAULT 'Xem trên bao bì';
ALTER TABLE products ADD COLUMN warnings TEXT;

-- Bổ sung quyền rút lại sự đồng ý marketing cho người dùng (Theo NĐ 13)
ALTER TABLE users ADD COLUMN marketing_consent BOOLEAN DEFAULT FALSE;
