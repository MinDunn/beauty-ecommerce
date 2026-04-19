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
    description TEXT,
    parent_id BIGINT,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
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
INSERT IGNORE INTO categories (id, name, description) VALUES (1, 'Trang điểm', 'Các sản phẩm trang điểm cao cấp');
INSERT IGNORE INTO categories (id, name, description) VALUES (2, 'Chăm sóc da', 'Các sản phẩm chăm sóc da chuyên sâu');
INSERT IGNORE INTO categories (id, name, description) VALUES (3, 'Chăm sóc tóc', 'Các sản phẩm cho mái tóc chắc khỏe');
INSERT IGNORE INTO categories (id, name, description) VALUES (4, 'Chăm sóc cơ thể', 'Sản phẩm chăm sóc cơ thể dịu nhẹ');
INSERT IGNORE INTO categories (id, name, description) VALUES (5, 'Nước hoa', 'Nước hoa nam, nữ, unisex và tinh dầu thơm cao cấp');

-- Sample Products
-- SKINCARE
INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Kem Chống Nắng La Roche-Posay Anthelios', 'Kiểm soát dầu nhờn, bảo vệ UVA/UVB cực cao.', 535000, 435000, 100, 'lrp_anthelios.png', 2, NOW());

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Nước Hoa Hồng Thayer Không Cồn', 'Cân bằng độ ẩm và làm sạch sâu lỗ chân lông.', 300000, 245000, 80, 'thayer_toner.png', 2, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Sữa Tắm Bioderma Atoderm Gel', 'Dành cho da khô và nhạy cảm, giúp làm sạch dịu nhẹ.', 450000, 395000, 50, 'bioderma_shower_gel.png', 2, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- MAKEUP
INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Son Kem Lì 3CE Velvet Lip Tint', 'Màu sắc thời thượng, chất son mịn mượt.', 380000, 345000, 200, '3ce_liptint.png', 1, NOW());

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Kem Nền Maybelline Fit Me', 'Kiềm dầu, che phủ lỗ chân lông hoàn hảo.', 280000, 245000, 150, 'maybelline_foundation.png', 1, DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Mascara Maybelline Sky High', 'Làm dài và cong mi suốt cả ngày dài.', 320000, 285000, 60, 'mascara.png', 1, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- HAIRCARE
INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Dầu Gội TRESemmé Keratin Smooth', 'Chuẩn salon, cho mái tóc suôn mượt vào nếp.', 250000, 215000, 90, 'tresemme_shampoo.png', 3, NOW());

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Dầu Gội OGX Thick & Full + Biotin', 'Ngăn ngừa tóc rụng, giúp tóc dày và bồng bềnh.', 350000, 295000, 40, 'ogx_shampoo.png', 3, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- BODYCARE
INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Sữa Dưỡng Thể Vaseline Gluta-Hya', 'Dưỡng sáng da chuyên sâu, cấp ẩm tức thì.', 195000, 165000, 120, 'vaseline_lotion.png', 4, NOW());

INSERT IGNORE INTO products (name, description, original_price, current_price, stock_quantity, image_url, category_id, created_at) 
VALUES ('Tẩy Tế Bào Chết St.Ives Scrub', 'Lấy đi tế bào chết, cho làn da mịn màng.', 180000, 155000, 110, 'st_ives_scrub.png', 4, DATE_SUB(NOW(), INTERVAL 6 DAY));

-- PERFUME (replaces SUPPLEMENTS)

