package com.beauty.ecommerce.user.adapter.in.web;

import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.user.adapter.in.web.request.ChangePasswordRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.ForgotPasswordRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.LoginUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.RegisterUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.ResetPasswordRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.TokenRefreshRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.SocialLoginRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.UpdateProfileRequest;
import com.beauty.ecommerce.user.adapter.in.web.response.AuthResponse;
import com.beauty.ecommerce.user.adapter.in.web.response.UserProfileResponse;
import com.beauty.ecommerce.user.application.service.AuthService;
import com.beauty.ecommerce.common.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterUserRequest request) {
        log.info("Yêu cầu đăng ký mới: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng ký thành công", response));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginUserRequest request) {
        log.info("Yêu cầu đăng nhập: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/auth/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@Valid @RequestBody SocialLoginRequest request) {
        log.info("Yêu cầu đăng nhập bằng Google");
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập bằng Google thành công", response));
    }

    @GetMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        log.info("Lấy thông tin profile cho: {}", authentication.getName());
        UserProfileResponse response = authService.getProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        log.info("Yêu cầu làm mới Token");
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Yêu cầu quên mật khẩu cho email: {}", request.getEmail());
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Yêu cầu thành công. Vui lòng kiểm tra email.")
                .build());
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Yêu cầu đặt lại mật khẩu với token");
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Đặt lại mật khẩu thành công.")
                .build());
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        log.info("Yêu cầu đăng xuất từ: {}", authentication.getName());
        authService.logout(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/users/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("Yêu cầu đổi mật khẩu cho: {}", authentication.getName());
        authService.changePassword(authentication.getName(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PutMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        log.info("Cập nhật profile cho: {}", authentication.getName());
        UserProfileResponse response = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", response));
    }

    @PostMapping("/users/avatar")
    public ResponseEntity<ApiResponse<String>> updateAvatar(
            Authentication authentication,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.info("Cập nhật avatar cho: {}", authentication.getName());
        String avatarUrl = authService.updateAvatar(authentication.getName(), file, cloudinaryService);
        return ResponseEntity.ok(ApiResponse.success("Tải ảnh đại diện thành công", avatarUrl));
    }
}
