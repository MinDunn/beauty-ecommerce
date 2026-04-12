package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.common.adapter.out.persistence.ActivityLogRepository;
import com.beauty.ecommerce.common.domain.entity.ActivityLog;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    public void logActivity(Long userId, String userEmail, String actionType, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .actionType(actionType)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
