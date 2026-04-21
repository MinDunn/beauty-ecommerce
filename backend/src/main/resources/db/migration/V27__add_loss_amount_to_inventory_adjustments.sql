-- Thêm cột estimated_loss_amount vào bảng inventory_adjustments
ALTER TABLE inventory_adjustments ADD COLUMN estimated_loss_amount DECIMAL(19, 2) DEFAULT 0.00;
