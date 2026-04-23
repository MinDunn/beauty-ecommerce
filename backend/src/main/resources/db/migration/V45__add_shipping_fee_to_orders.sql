-- Add shipping_fee column to orders table
ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(15,2) DEFAULT 0.00;
