-- =============================================
-- Beauty E-commerce Database Schema
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS orders (
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
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123 - BCrypt encoded)
INSERT IGNORE INTO users (email, password, full_name, role, created_at)
VALUES ('admin@beauty.com', '$2a$10$oSkrd55wSMEt1fdFMbyfT.SXcqejjgLCfdY.B12BTTkTVvgZGhwYi', 'Admin', 'ADMIN', NOW());

-- Sample Categories
INSERT IGNORE INTO categories (id, name, description) VALUES (1, 'Trang điểm', 'Các sản phẩm trang điểm');
INSERT IGNORE INTO categories (id, name, description) VALUES (2, 'Chăm sóc da', 'Các sản phẩm chăm sóc da');

-- Sample Products
INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Son môi Matte', 'Son lì lâu trôi', 300000, 250000, 50, 'son_matte.jpg', 1, NOW());

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Kem nền', 'Kem nền che phủ tốt', 500000, 450000, 30, 'kem_nen.jpg', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Sữa rửa mặt', 'Sữa rửa mặt dịu nhẹ', 200000, 180000, 100, 'sua_rua_mat.jpg', 2, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Sample Reviews
INSERT IGNORE INTO reviews (user_id, product_id, rating_star, comment, created_at) VALUES (1, 1, 5, 'Rất tốt!', NOW());
INSERT IGNORE INTO reviews (user_id, product_id, rating_star, comment, created_at) VALUES (1, 1, 4, 'Màu đẹp', NOW());
INSERT IGNORE INTO reviews (user_id, product_id, rating_star, comment, created_at) VALUES (1, 2, 5, 'Tuyệt vời', NOW());
