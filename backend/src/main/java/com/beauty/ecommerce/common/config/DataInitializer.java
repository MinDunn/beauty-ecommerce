package com.beauty.ecommerce.common.config;

import com.beauty.ecommerce.category.adapter.out.persistence.CategoryJpaEntity;
import com.beauty.ecommerce.category.adapter.out.persistence.CategoryRepository;
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
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            log.info("Bắt đầu khởi tạo dữ liệu mẫu...");
            initializeUsers();
            initializeCategoriesAndProducts();
            log.info("Hoàn tất khởi tạo dữ liệu mẫu.");
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo dữ liệu mẫu: {}. Ứng dụng vẫn sẽ tiếp tục chạy.", e.getMessage());
        }
    }

    private void initializeUsers() {
        String adminEmail = "admin@beauty.com";
        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            admin -> {
                log.info("Cập nhật lại mật khẩu cho tài khoản Admin: {}...", adminEmail);
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            },
            () -> {
                log.info("Khởi tạo tài khoản quản trị mặc định: {}...", adminEmail);
                UserJpaEntity admin = UserJpaEntity.builder()
                        .email(adminEmail)
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("Quản Trị Viên")
                        .role("ADMIN")
                        .createdAt(LocalDateTime.now())
                        .build();
                userRepository.save(admin);
                log.info("Đã tạo tài khoản Admin thành công: admin@beauty.com / admin123");
            }
        );

        if (userRepository.findByEmail("user@beauty.com").isEmpty()) {
            UserJpaEntity user = UserJpaEntity.builder()
                    .email("user@beauty.com")
                    .password(passwordEncoder.encode("user123"))
                    .fullName("Khách Hàng Mẫu")
                    .role("USER")
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
            log.info("Đã tạo tài khoản User thành công: user@beauty.com / user123");
        }
    }

    private void initializeCategoriesAndProducts() {
        // Ensure categories exist
        CategoryJpaEntity makeup = categoryRepository.findByName("Trang điểm")
                .orElseGet(() -> categoryRepository.save(CategoryJpaEntity.builder().name("Trang điểm").description("Các sản phẩm làm đẹp, kem nền, son môi...").build()));
        
        CategoryJpaEntity skincare = categoryRepository.findByName("Chăm sóc da")
                .orElseGet(() -> categoryRepository.save(CategoryJpaEntity.builder().name("Chăm sóc da").description("Kem dưỡng, sữa rửa mặt, mặt nạ...").build()));

        CategoryJpaEntity haircare = categoryRepository.findByName("Chăm sóc tóc")
                .orElseGet(() -> categoryRepository.save(CategoryJpaEntity.builder().name("Chăm sóc tóc").description("Dầu gội, dầu xả, tinh dầu dưỡng tóc...").build()));

        CategoryJpaEntity bodycare = categoryRepository.findByName("Chăm sóc cơ thể")
                .orElseGet(() -> categoryRepository.save(CategoryJpaEntity.builder().name("Chăm sóc cơ thể").description("Sữa tắm, dưỡng thể, tẩy tế bào chết...").build()));

        CategoryJpaEntity supplements = categoryRepository.findByName("Thực phẩm chức năng")
                .orElseGet(() -> categoryRepository.save(CategoryJpaEntity.builder().name("Thực phẩm chức năng").description("Vitamin, collagen, sản phẩm hỗ trợ sức khỏe sắc đẹp...").build()));

        if (productRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu sản phẩm mẫu...");

            List<ProductJpaEntity> products = List.of(
                ProductJpaEntity.builder()
                        .name("Son Môi Dior Rouge")
                        .description("Son môi cao cấp từ thương hiệu Dior.")
                        .originalPrice(new BigDecimal("1200000"))
                        .currentPrice(new BigDecimal("950000"))
                        .stockQuantity(50)
                        .imageUrl("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=600&q=80")
                        .categoryId(makeup.getId())
                        .build(),
                ProductJpaEntity.builder()
                        .name("Kem Nền Estee Lauder")
                        .description("Kem nền bền màu, che phủ cực tốt.")
                        .originalPrice(new BigDecimal("1500000"))
                        .currentPrice(new BigDecimal("1350000"))
                        .stockQuantity(30)
                        .imageUrl("https://images.unsplash.com/photo-1599733594230-6b823276abcc?auto=format&fit=crop&w=600&q=80")
                        .categoryId(makeup.getId())
                        .build(),
                ProductJpaEntity.builder()
                        .name("Sữa Rửa Mặt CeraVe")
                        .description("Sữa rửa mặt dịu nhẹ cho da nhạy cảm.")
                        .originalPrice(new BigDecimal("450000"))
                        .currentPrice(new BigDecimal("380000"))
                        .stockQuantity(100)
                        .imageUrl("https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80")
                        .categoryId(skincare.getId())
                        .build(),
                ProductJpaEntity.builder()
                        .name("Nước Hoa Chanel No.5")
                        .description("Biểu tượng quyến rũ của phái đẹp.")
                        .originalPrice(new BigDecimal("4500000"))
                        .currentPrice(new BigDecimal("4200000"))
                        .stockQuantity(10)
                        .imageUrl("https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80")
                        .categoryId(bodycare.getId())
                        .build(),
                ProductJpaEntity.builder()
                        .name("Mặt Nạ Laneige")
                        .description("Mặt nạ ngủ cấp ẩm tức thì.")
                        .originalPrice(new BigDecimal("650000"))
                        .currentPrice(new BigDecimal("520000"))
                        .stockQuantity(40)
                        .imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80")
                        .categoryId(skincare.getId())
                        .build(),
                ProductJpaEntity.builder()
                        .name("Viên Uống Collagen Glow")
                        .description("Hỗ trợ da sáng khỏe và đàn hồi.")
                        .originalPrice(new BigDecimal("890000"))
                        .currentPrice(new BigDecimal("690000"))
                        .stockQuantity(60)
                        .imageUrl("https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=600&q=80")
                        .categoryId(supplements.getId())
                        .build(),
                ProductJpaEntity.builder()
                        .name("Dầu Gội Phục Hồi Tóc Hư Tổn")
                        .description("Làm sạch dịu nhẹ, phục hồi tóc khô xơ.")
                        .originalPrice(new BigDecimal("320000"))
                        .currentPrice(new BigDecimal("255000"))
                        .stockQuantity(70)
                        .imageUrl("https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80")
                        .categoryId(haircare.getId())
                        .build()
            );

            productRepository.saveAll(products);
            log.info("Đã tạo sản phẩm mẫu và gán danh mục thành công.");
        }
    }
}
