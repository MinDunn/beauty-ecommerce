package com.beauty.ecommerce.user.application.service;

import com.beauty.ecommerce.common.exception.BadRequestException;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.common.exception.UnauthorizedException;
import com.beauty.ecommerce.common.security.JwtUtil;
import com.beauty.ecommerce.user.adapter.in.web.request.LoginUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.RegisterUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.TokenRefreshRequest;
import com.beauty.ecommerce.user.adapter.in.web.response.AuthResponse;
import com.beauty.ecommerce.user.adapter.in.web.response.UserProfileResponse;
import com.beauty.ecommerce.user.adapter.out.persistence.*;
import com.beauty.ecommerce.common.application.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beauty.ecommerce.user.adapter.in.web.request.SocialLoginRequest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final com.beauty.ecommerce.common.application.service.ActivityLogService activityLogService;

    @Value("${jwt.refresh-expiration}")
    private Long refreshTokenDurationMs;

    @Value("${GOOGLE_CLIENT_ID:your-google-client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterUserRequest request) {
        log.info("Đang đăng ký người dùng mới: {}", request.getEmail());
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã được sử dụng: " + request.getEmail());
        }

        UserJpaEntity user = UserJpaEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("USER")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        activityLogService.logActivity(user.getId(), user.getEmail(), com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "REGISTER", "Đăng ký tài khoản mới: " + user.getEmail());

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshToken = createRefreshToken(user).getToken();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginUserRequest request) {
        log.info("Đang đăng nhập người dùng: {}", request.getEmail());
        
        UserJpaEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (user.getIsActive() == null || !user.getIsActive()) {
            log.warn("Cố gắng đăng nhập vào tài khoản bị khóa: {}", request.getEmail());
            throw new BadRequestException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        if (user.getProvider() != null && !user.getProvider().equals("LOCAL")) {
            log.warn("Cố gắng đăng nhập bằng mật khẩu cho tài khoản Social: {}", request.getEmail());
            throw new BadRequestException("Tài khoản này được liên kết với " + user.getProvider() + ". Vui lòng đăng nhập qua mạng xã hội.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshToken = createRefreshToken(user).getToken();

        activityLogService.logActivity(user.getId(), user.getEmail(), com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "LOGIN", "Đăng nhập hệ thống (Local)");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(SocialLoginRequest request) {
        log.info("Đang xử lý đăng nhập bằng Google cho email: {}", request.getEmail());

        String email = request.getEmail();
        String name = request.getFullName();
        String pictureUrl = request.getPictureUrl();
        String googleId = request.getGoogleId();

        UserJpaEntity user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Tạo người dùng mới từ Google: {}", email);
            UserJpaEntity newUser = UserJpaEntity.builder()
                    .email(email)
                    .fullName(name)
                    .avatarUrl(pictureUrl)
                    .provider("GOOGLE")
                    .providerId(googleId)
                    .role("USER")
                    .createdAt(LocalDateTime.now())
                    .isActive(true)
                    .build();
            return userRepository.save(newUser);
        });

        // Nếu user đã tồn tại nhưng chưa có providerId (đăng ký local trước đó)
        if (user.getProviderId() == null) {
            user.setProvider("GOOGLE");
            user.setProviderId(googleId);
            if (user.getAvatarUrl() == null) {
                user.setAvatarUrl(pictureUrl);
            }
            userRepository.save(user);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
        String refreshToken = createRefreshToken(user).getToken();

        activityLogService.logActivity(user.getId(), user.getEmail(), com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "LOGIN_GOOGLE", "Đăng nhập hệ thống bằng Google");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }


    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshTokenJpaEntity::getUser)
                .map(user -> {
                    String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole(), user.getId());
                    return AuthResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(requestRefreshToken)
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .role(user.getRole())
                            .build();
                })
                .orElseThrow(() -> new UnauthorizedException("Refresh token không tồn tại trong hệ thống"));
    }

    private RefreshTokenJpaEntity createRefreshToken(UserJpaEntity user) {
        // Xóa token cũ nếu có
        refreshTokenRepository.deleteByUser(user);

        RefreshTokenJpaEntity refreshToken = RefreshTokenJpaEntity.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private RefreshTokenJpaEntity verifyExpiration(RefreshTokenJpaEntity token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }
        return token;
    }

    public UserProfileResponse getProfile(String email) {
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, com.beauty.ecommerce.user.adapter.in.web.request.UpdateProfileRequest request) {
        log.info("Cập nhật thông tin profile cho: {}", email);
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        userRepository.save(user);
        activityLogService.logActivity(user.getId(), email, com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "UPDATE_PROFILE", "Người dùng cập nhật thông tin cá nhân.");
        return getProfile(email);
    }

    @Transactional
    public String updateAvatar(String email, org.springframework.web.multipart.MultipartFile file, com.beauty.ecommerce.common.service.CloudinaryService cloudinaryService) {
        log.info("Cập nhật ảnh đại diện cho: {}", email);
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        String imageUrl = cloudinaryService.uploadImage(file);
        user.setAvatarUrl(imageUrl);
        userRepository.save(user);
        return imageUrl;
    }

    @Transactional
    public void forgotPassword(String email) {
        log.info("Yêu cầu quên mật khẩu cho email: {}", email);
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Xóa token cũ nếu có
        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetTokenJpaEntity resetToken = PasswordResetTokenJpaEntity.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(24)) // Token valid for 24 hours
                .build();

        passwordResetTokenRepository.save(resetToken);
        activityLogService.logActivity(user.getId(), email, com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "FORGOT_PASSWORD", "Yêu cầu khôi phục mật khẩu.");

        // Gửi email HTML chuyên nghiệp
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendForgotPasswordEmail(user.getEmail(), user.getFullName(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Đang thực hiện đặt lại mật khẩu với token");
        PasswordResetTokenJpaEntity resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token không hợp lệ hoặc không tồn tại"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Token đã hết hạn");
        }

        UserJpaEntity user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xóa token sau khi sử dụng thành công
        passwordResetTokenRepository.delete(resetToken);
        activityLogService.logActivity(user.getId(), user.getEmail(), com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "RESET_PASSWORD", "Đặt lại mật khẩu thành công bằng token.");
        log.info("Đặt lại mật khẩu thành công cho người dùng: {}", user.getEmail());
    }

    @Transactional
    public void logout(String email) {
        log.info("Đang đăng xuất người dùng: {}", email);
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        refreshTokenRepository.deleteByUser(user);
        activityLogService.logActivity(user.getId(), email, com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "LOGOUT", "Người dùng đã đăng xuất khỏi hệ thống.");
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        log.info("Đang đổi mật khẩu cho người dùng: {}", email);
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        activityLogService.logActivity(user.getId(), email, com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "CHANGE_PASSWORD", "Người dùng đã đổi mật khẩu thành công.");
    }
}
