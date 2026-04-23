CREATE TABLE system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Công thức tính lợi nhuận mặc định
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('PROFIT_FORMULA', '#revenue - #cost - #loss + #compensation', 'Công thức tính lợi nhuận (sử dụng cú pháp SpEL: #revenue, #cost, #loss, #compensation)');
