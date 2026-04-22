-- V40__add_vat_fields_to_orders.sql
-- Bổ sung các trường thông tin hóa đơn VAT (Theo NĐ 123/2020/NĐ-CP)
-- Gộp các lệnh vào một lần ALTER để đảm bảo tính nhất quán

ALTER TABLE orders 
    ADD COLUMN vat_requested BOOLEAN DEFAULT FALSE,
    ADD COLUMN tax_code VARCHAR(255),
    ADD COLUMN company_name VARCHAR(255),
    ADD COLUMN company_address VARCHAR(255);
