ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date DATE;
UPDATE products 
SET expiry_date = (
    SELECT MIN(expiry_date) 
    FROM batches 
    WHERE batches.product_id = products.id 
    AND batches.quantity > 0
)
WHERE expiry_date IS NULL;
