INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('SHIPPING_FEE_CITY', '20000', 'Phí vận chuyển cho các thành phố trực thuộc Trung ương');

INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('SHIPPING_FEE_PROVINCE', '35000', 'Phí vận chuyển cho các tỉnh khác');

INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('SHIPPING_FREE_THRESHOLD', '500000', 'Ngưỡng tổng tiền đơn hàng để được miễn phí vận chuyển');

ALTER TABLE orders ADD COLUMN province VARCHAR(100);
