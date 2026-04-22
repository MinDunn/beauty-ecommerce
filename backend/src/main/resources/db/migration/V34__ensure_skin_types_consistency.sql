-- Migration V33: Ensure skin_types column exists and matches JPA entity
-- This handles potential partial failures of previous migrations or out-of-order execution

-- 1. For products table
-- We use a simpler strategy for compatibility: Try to add it if it doesn't exist, or rename if the old one exists.

-- Add skin_types if it doesn't exist (using a procedure or just letting it fail silently is hard in SQL files, 
-- but Flyway usually requires valid syntax. However, we can use the CHANGE/ADD logic).

-- In TiDB/MySQL, we can check existence via information_schema
-- But many environments don't allow procedures in migrations.
-- We'll use a series of safe ALTERs.

-- If skin_types doesn't exist, and skin_type exists, rename it.
-- If skin_types doesn't exist, and skin_type doesn't exist, create it.

-- Simplified safe approach for MySQL/TiDB:
-- We'll try to add it, if it fails because it exists, that's fine (but Flyway will mark as failed).
-- To be truly safe in Flyway without procedures:

ALTER TABLE products MODIFY COLUMN IF EXISTS skin_type VARCHAR(500); -- Ensure old column is large enough before rename
-- No safe 'IF NOT EXISTS' for columns in basic SQL without procedures.
-- But since we ARE in a migration, we assume we know the state.
-- The error was "Unknown column 'skin_types'".

-- Let's try the direct fix:
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_types VARCHAR(500);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS skin_types VARCHAR(500);

-- If skin_type (singular) still exists, copy data and drop it
-- (TiDB supports IF EXISTS for columns in some versions, but not all)
-- We'll just ensure skin_types is there.

UPDATE products SET skin_types = skin_type WHERE skin_types IS NULL AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'skin_type' AND table_schema = DATABASE()) > 0;
