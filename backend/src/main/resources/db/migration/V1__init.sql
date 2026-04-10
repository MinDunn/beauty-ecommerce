-- =============================================
-- Beauty E-commerce Database Schema - V1
-- =============================================

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    original_price DECIMAL(15,2),
    current_price DECIMAL(15,2),
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(500),
    category_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_price DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    shipping_address TEXT,
    contact_phone VARCHAR(20),
    payment_method VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating_star INT CHECK (rating_star BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Contacts (feedback) table
CREATE TABLE contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Wishlist table
CREATE TABLE wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Coupons table
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    discount_value DECIMAL(15,2) NOT NULL,
    min_order_amount DECIMAL(15,2) DEFAULT 0,
    expiry_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123 - BCrypt encoded)
INSERT IGNORE INTO users (email, password, full_name, role, created_at)
VALUES ('admin@beauty.com', '$2a$10$oSkrd55wSMEt1fdFMbyfT.SXcqejjgLCfdY.B12BTTkTVvgZGhwYi', 'Admin', 'ADMIN', NOW());

-- Sample Categories
INSERT IGNORE INTO categories (id, name, description) VALUES (1, 'Trang điểm', 'Các sản phẩm trang điểm');
INSERT IGNORE INTO categories (id, name, description) VALUES (2, 'Chăm sóc da', 'Các sản phẩm chăm sóc da');

-- Sample Coupons
INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, is_active)
VALUES ('WELCOME20', 'PERCENTAGE', 20.0, 0.0, '2027-01-01 00:00:00', TRUE);
INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, is_active)
VALUES ('GLOWZY100K', 'FIXED', 100000.0, 500000.0, '2027-01-01 00:00:00', TRUE);
