-- Migration V40: Add reply fields to reviews (Idempotent version)
-- Bổ sung cột phản hồi của admin vào bảng reviews

DROP PROCEDURE IF EXISTS add_column_if_not_exists;

DELIMITER //

CREATE PROCEDURE add_column_if_not_exists()
BEGIN
    -- Check for admin_reply
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'reviews' 
        AND COLUMN_NAME = 'admin_reply'
    ) THEN
        ALTER TABLE reviews ADD COLUMN admin_reply TEXT;
    END IF;

    -- Check for replied_at
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'reviews' 
        AND COLUMN_NAME = 'replied_at'
    ) THEN
        ALTER TABLE reviews ADD COLUMN replied_at DATETIME;
    END IF;
END //

DELIMITER ;

CALL add_column_if_not_exists();

DROP PROCEDURE add_column_if_not_exists;
