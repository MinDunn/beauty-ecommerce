package com.beauty.ecommerce.common.adapter.in.web;

import com.beauty.ecommerce.common.application.service.ActivityLogService;
import com.beauty.ecommerce.common.domain.entity.ActivityLog;
import com.beauty.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activities")
@RequiredArgsConstructor
public class AdminActivityController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getRecentActivities(
            @RequestParam(required = false) String group,
            @RequestParam(required = false) String query) {
        List<ActivityLog> activities;
        
        if (query != null && !query.trim().isEmpty()) {
            activities = activityLogService.searchActivities(group, query);
        } else if (group != null && !group.isEmpty() && !group.equals("ALL")) {
            activities = activityLogService.getActivitiesByGroup(group);
        } else {
            activities = activityLogService.getRecentActivities();
        }
        
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
