package com.beauty.ecommerce.common.adapter.in.web;

import com.beauty.ecommerce.common.application.service.SystemSettingService;
import com.beauty.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService settingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }

    @GetMapping("/shipping")
    public ResponseEntity<?> getShippingSettings() {
        Map<String, String> shippingSettings = settingService.getSettings(List.of(
            "SHIPPING_FEE_CITY", 
            "SHIPPING_FEE_PROVINCE", 
            "SHIPPING_FREE_THRESHOLD"
        ));
        return ResponseEntity.ok(ApiResponse.success(shippingSettings));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settings) {
        settings.forEach(settingService::updateSetting);
        return ResponseEntity.ok(ApiResponse.success("Cấu hình đã được cập nhật"));
    }
}
