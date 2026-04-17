-- Add paymentTransactionId to orders table
ALTER TABLE orders ADD COLUMN payment_transaction_id VARCHAR(255);
