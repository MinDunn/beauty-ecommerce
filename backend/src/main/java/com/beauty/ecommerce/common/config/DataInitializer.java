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
            ensureSoldAndViewColumnsExist();
            log.info("Bắt đầu khởi tạo dữ liệu mẫu...");
            initializeUsers();
            initializeCategoriesAndProducts();
            fixActivityLogGroups();
            log.info("Hoàn tất khởi tạo dữ liệu mẫu.");
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo dữ liệu mẫu: {}. Ứng dụng vẫn sẽ tiếp tục chạy.", e.getMessage());
        }
    }

    private void fixActivityLogGroups() {
        log.info("Đang chuẩn hóa phân nhóm cho nhật ký hoạt động cũ...");
        try {
            // Chuyển các log mua sắm về đúng nhóm
            jdbcTemplate.execute("UPDATE activity_logs SET action_group = 'SHOPPING' " +
                    "WHERE action_group IN ('MUA SẮM', 'SYSTEM') " +
                    "AND action_type IN ('ADD_TO_CART', 'REMOVE_FROM_CART', 'CLEAR_CART', 'PLACE_ORDER', 'CANCEL_ORDER_REQUEST', 'APPROVE_CANCELLATION', 'REJECT_CANCELLATION')");
            
            // Chuyển các log tài khoản về đúng nhóm
            jdbcTemplate.execute("UPDATE activity_logs SET action_group = 'ACCOUNT' " +
                    "WHERE action_group IN ('TÀI KHOẢN', 'SYSTEM') " +
                    "AND action_type IN ('LOGIN', 'LOGIN_GOOGLE', 'REGISTER', 'CHANGE_PASSWORD', 'LOCK_USER', 'UNLOCK_USER')");
            
            // Chuẩn hóa nhóm hệ thống
            jdbcTemplate.execute("UPDATE activity_logs SET action_group = 'SYSTEM' " +
                    "WHERE action_group = 'HỆ THỐNG'");
            
            log.info("Đã chuẩn hóa dữ liệu nhật ký thành công.");
        } catch (Exception e) {
            log.warn("Không thể chuẩn hóa nhật ký hoạt động (có thể bảng chưa tồn tại): {}", e.getMessage());
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

    private void ensureSoldAndViewColumnsExist() {
        log.info("Kiểm tra và tạo cột sold/view_count nếu chưa tồn tại...");
        try {
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN sold INT DEFAULT 0");
            log.info("Đã tạo cột sold thành công.");
        } catch (Exception e) {
            log.info("Cột sold đã tồn tại hoặc có lỗi (bỏ qua): {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN view_count BIGINT DEFAULT 0");
            log.info("Đã tạo cột view_count thành công.");
        } catch (Exception e) {
            log.info("Cột view_count đã tồn tại hoặc có lỗi (bỏ qua): {}", e.getMessage());
        }
    }
}
