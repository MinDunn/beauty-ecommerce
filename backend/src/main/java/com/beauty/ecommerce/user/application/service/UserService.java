package com.beauty.ecommerce.user.application.service;

import com.beauty.ecommerce.common.exception.BadRequestException;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.user.adapter.in.web.response.AdminUserResponse;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import com.beauty.ecommerce.user.adapter.in.web.request.CreateUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.UpdateUserRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.beauty.ecommerce.common.application.service.ActivityLogService activityLogService;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse createUser(CreateUserRequest request) {
        log.info("Admin tạo người dùng mới: {}", request.getEmail());
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã được sử dụng: " + request.getEmail());
        }

        UserJpaEntity user = UserJpaEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("ADMIN") // Mặc định Admin tạo là ADMIN
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "CREATE_USER", "Admin tạo người dùng mới: " + user.getEmail());
        return mapToAdminResponse(user);
    }

    @Transactional
    public void updateUserRole(Long userId, String newRole) {
        throw new BadRequestException("Hệ thống không cho phép thay đổi quyền hạn của tài khoản sau khi đã khởi tạo.");
    }

    @Transactional
    public AdminUserResponse updateUserDetails(Long userId, UpdateUserRequest request) {
        if (userId == null) throw new IllegalArgumentException("UserId không được để trống");
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        log.info("Admin cập nhật thông tin cho người dùng {}: {}", userId, request.getFullName());
        
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        user = userRepository.save(user);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, "UPDATE_USER", "Admin cập nhật thông tin người dùng: " + user.getEmail());
        return mapToAdminResponse(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, boolean isActive) {
        if (userId == null) throw new IllegalArgumentException("UserId không được để trống");
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        if ("admin@beauty.com".equals(user.getEmail())) {
            throw new BadRequestException("Không thể khóa tài khoản Admin hệ thống");
        }
        
        log.info("Cập nhật trạng thái người dùng {}: {}", userId, isActive ? "Mở khóa" : "Khóa");
        user.setIsActive(isActive);
        user = userRepository.save(user);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_ACCOUNT, isActive ? "UNLOCK_USER" : "LOCK_USER", (isActive ? "Mở khóa" : "Khóa") + " tài khoản người dùng: " + user.getEmail());
    }

    private AdminUserResponse mapToAdminResponse(UserJpaEntity user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() + "Z" : null)
                .build();
    }
}
