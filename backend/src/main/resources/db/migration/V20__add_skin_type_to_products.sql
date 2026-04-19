-- Migration V17: Thêm cột skin_type vào bảng products để hỗ trợ lọc theo loại da
ALTER TABLE products ADD COLUMN skin_type VARCHAR(50);
