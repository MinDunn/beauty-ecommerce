-- Final cleanup for duplicate "Nước hoa" category
DELETE FROM categories WHERE name = 'Nước hoa' OR name = 'nước hoa';
