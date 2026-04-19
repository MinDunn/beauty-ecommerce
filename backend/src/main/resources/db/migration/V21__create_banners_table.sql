CREATE TABLE banners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(1000) NOT NULL,
    title VARCHAR(255),
    campaign VARCHAR(255),
    subtitle TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chen du lieu mau ban dau (lay tu file HeroBanner hien tai)
INSERT INTO banners (image_url, title, campaign, subtitle, display_order)
VALUES 
('https://innovativehub.com.vn/wp-content/uploads/2023/11/nganh-my-pham-viet-nam.jpg', 'Thế Giới Trang Điểm', 'New Trend 2026', 'Khám phá bức tranh toàn cảnh và tiềm năng phát triển của ngành mỹ phẩm tại thị trường Việt Nam hiện nay.', 1),
('https://bazaarvietnam.vn/wp-content/uploads/2020/01/my-pham-xanh-bazaar-vietnam-1.jpg', 'Xu Hướng Mỹ Phẩm Xanh', 'Clean Beauty 2026', 'Trải nghiệm dòng mỹ phẩm thiên nhiên thuần khiết, an toàn cho sức khỏe và thân thiện với môi trường.', 2);
