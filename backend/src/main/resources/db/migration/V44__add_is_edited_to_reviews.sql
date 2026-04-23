-- Thêm cột is_edited vào bảng reviews
ALTER TABLE reviews ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
