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

        CategoryJpaEntity perfume = categoryRepository.findByName("Nước hoa")
                .orElseGet(() -> categoryRepository.save(CategoryJpaEntity.builder().name("Nước hoa").description("Nước hoa nam, nữ, unisex và tinh dầu thơm cao cấp...").build()));


    }
}
