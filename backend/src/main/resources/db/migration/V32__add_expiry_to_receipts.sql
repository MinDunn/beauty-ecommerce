-- Thêm cột expiry_date vào bảng inventory_receipts
ALTER TABLE inventory_receipts ADD COLUMN expiry_date DATE;

-- Cập nhật các phiếu nhập cũ thành hạn mặc định 2026-12-15
UPDATE inventory_receipts SET expiry_date = '2026-12-15' WHERE expiry_date IS NULL;
