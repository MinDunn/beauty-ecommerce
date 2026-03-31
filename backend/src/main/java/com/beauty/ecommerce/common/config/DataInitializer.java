package com.beauty.ecommerce.common.config;

import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeProducts();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu người dùng mẫu...");
            
            UserJpaEntity admin = UserJpaEntity.builder()
                    .email("admin@beauty.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Quản Trị Viên")
                    .role("ADMIN")
                    .createdAt(LocalDateTime.now())
                    .build();

            UserJpaEntity user = UserJpaEntity.builder()
                    .email("user@beauty.com")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Khách Hàng Mẫu")
                    .role("USER")
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.saveAll(List.of(admin, user));
            log.info("Đã tạo tài khoản: admin@beauty.com / admin123 và user@beauty.com / user123");
        }
    }

    private void initializeProducts() {
        if (productRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu sản phẩm mẫu...");

            List<ProductJpaEntity> products = List.of(
                ProductJpaEntity.builder()
                        .name("Son Môi Dior Rouge")
                        .description("Son môi cao cấp từ thương hiệu Dior.")
                        .originalPrice(new BigDecimal("1200000"))
                        .currentPrice(new BigDecimal("950000"))
                        .stockQuantity(50)
                        .imageUrl("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d")
                        .build(),
                ProductJpaEntity.builder()
                        .name("Kem Nền Estee Lauder")
                        .description("Kem nền bền màu, che phủ cực tốt.")
                        .originalPrice(new BigDecimal("1500000"))
                        .currentPrice(new BigDecimal("1350000"))
                        .stockQuantity(30)
                        .imageUrl("https://images.unsplash.com/photo-1599733594230-6b823276abcc")
                        .build(),
                ProductJpaEntity.builder()
                        .name("Sữa Rửa Mặt CeraVe")
                        .description("Sữa rửa mặt dịu nhẹ cho da nhạy cảm.")
                        .originalPrice(new BigDecimal("450000"))
                        .currentPrice(new BigDecimal("380000"))
                        .stockQuantity(100)
                        .imageUrl("https://images.unsplash.com/photo-1556228720-195a672e8a03")
                        .build(),
                ProductJpaEntity.builder()
                        .name("Nước Hoa Chanel No.5")
                        .description("Biểu tượng quyến rũ của phái đẹp.")
                        .originalPrice(new BigDecimal("4500000"))
                        .currentPrice(new BigDecimal("4200000"))
                        .stockQuantity(10)
                        .imageUrl("https://images.unsplash.com/photo-1541643600914-78b084683601")
                        .build(),
                ProductJpaEntity.builder()
                        .name("Mặt Nạ Laneige")
                        .description("Mặt nạ ngủ cấp ẩm tức thì.")
                        .originalPrice(new BigDecimal("650000"))
                        .currentPrice(new BigDecimal("520000"))
                        .stockQuantity(40)
                        .imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c")
                        .build()
            );

            productRepository.saveAll(products);
            log.info("Đã tạo 5 sản phẩm mẫu thành công.");
        }
    }
}
