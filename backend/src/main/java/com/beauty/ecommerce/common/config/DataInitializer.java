package com.beauty.ecommerce.common.config;

import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Bắt đầu kiểm tra cấu trúc Database...");
            ensureSkinTypeColumnExists();
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
        log.info("Bỏ qua khởi tạo danh mục tự động (để tránh trùng lặp dữ liệu)...");
    }

    private void ensureSkinTypeColumnExists() {
        log.info("Kiểm tra và tạo cột skin_type nếu chưa tồn tại...");
        try {
            // MySQL 8.0.19+ supports ADD COLUMN IF NOT EXISTS, but for better compatibility:
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN skin_type VARCHAR(50)");
            log.info("Đã tạo cột skin_type thành công.");
        } catch (Exception e) {
            // If column already exists, MySQL throws an error we can safely ignore
            log.info("Cột skin_type đã tồn tại hoặc có lỗi (bỏ qua): {}", e.getMessage());
        }
    }
}
