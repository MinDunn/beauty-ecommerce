package com.beauty.ecommerce.common.adapter.in.web;

import com.beauty.ecommerce.common.application.service.DashboardService;
import com.beauty.ecommerce.common.adapter.in.web.response.DashboardResponse;
import com.beauty.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardStats(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "7") int days) {
        DashboardResponse stats = dashboardService.getStats(days);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
