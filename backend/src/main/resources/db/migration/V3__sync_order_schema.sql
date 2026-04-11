-- Sync orders table with OrderJpaEntity
ALTER TABLE orders 
    ADD COLUMN payment_status VARCHAR(50),
    ADD COLUMN receiver_name VARCHAR(255),
    ADD COLUMN receiver_phone VARCHAR(50),
    ADD COLUMN order_date DATETIME DEFAULT CURRENT_TIMESTAMP;
