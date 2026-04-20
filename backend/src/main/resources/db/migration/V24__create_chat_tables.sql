CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(100),
    recipient_id VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(20), -- IMAGE, VIDEO
    type VARCHAR(20) NOT NULL, -- USER, GUEST, ADMIN
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
