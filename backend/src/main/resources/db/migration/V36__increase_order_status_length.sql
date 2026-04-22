-- Increase length for order status and payment columns to avoid "Data too long" errors
ALTER TABLE orders 
    MODIFY COLUMN status VARCHAR(50) DEFAULT 'PENDING',
    MODIFY COLUMN payment_method VARCHAR(50),
    MODIFY COLUMN payment_status VARCHAR(50);
