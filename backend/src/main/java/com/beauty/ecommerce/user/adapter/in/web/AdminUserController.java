package com.beauty.ecommerce.user.adapter.in.web;

import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.user.adapter.in.web.request.CreateUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.request.UpdateUserRequest;
import com.beauty.ecommerce.user.adapter.in.web.response.AdminUserResponse;
import com.beauty.ecommerce.user.application.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        log.info("Admin lấy danh sách người dùng");
        List<AdminUserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Admin tạo tài khoản mới cho email: {}", request.getEmail());
        AdminUserResponse newUser = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản thành công", newUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserDetails(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        log.info("Admin cập nhật thông tin người dùng ID: {}", id);
        AdminUserResponse updatedUser = userService.updateUserDetails(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", updatedUser));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền thành công", null));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        Boolean isActive = request.get("isActive");
        userService.updateUserStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success(
                isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", 
                null
        ));
    }
}
