-- Cleanup duplicate categories: Merge "Nước hoa" into "Nước Hoa"
-- 1. Update any products pointing to the lowercase "Nước hoa" (if any)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Nước Hoa' LIMIT 1)
WHERE category_id IN (SELECT id FROM categories WHERE name = 'Nước hoa');

-- 2. Update any subcategories pointing to the lowercase "Nước hoa"
UPDATE categories 
SET parent_id = (SELECT id FROM categories WHERE name = 'Nước Hoa' LIMIT 1)
WHERE parent_id IN (SELECT id FROM categories WHERE name = 'Nước hoa');

-- 3. Delete the redundant lowercase category
DELETE FROM categories WHERE name = 'Nước hoa';
