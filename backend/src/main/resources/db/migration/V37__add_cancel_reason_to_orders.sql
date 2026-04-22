-- Add cancel_reason column to store why a customer wants to cancel
ALTER TABLE orders 
    ADD COLUMN cancel_reason VARCHAR(500);
