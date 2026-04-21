-- Retroactively calculate financial gain (negative loss) for surplus adjustments
-- Based on the product's original price as a fallback
UPDATE inventory_adjustments adj
JOIN products p ON adj.product_id = p.id
SET adj.estimated_loss_amount = -(adj.quantity * p.original_price)
WHERE adj.quantity > 0 
  AND (adj.estimated_loss_amount IS NULL OR adj.estimated_loss_amount = 0);
