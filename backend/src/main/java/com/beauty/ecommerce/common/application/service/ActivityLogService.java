package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.common.adapter.out.persistence.ActivityLogRepository;
import com.beauty.ecommerce.common.domain.entity.ActivityLog;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    // Các hằng số nhóm hành động
    public static final String GROUP_ACCOUNT = "ACCOUNT";
    public static final String GROUP_SHOPPING = "SHOPPING";
    public static final String GROUP_SYSTEM = "SYSTEM";

    @Async
    public void logActivity(Long userId, String userEmail, String actionGroup, String actionType, String description) {
        String ipAddress = getClientIp();
        
        // Nếu thiếu thông tin người dùng, cố gắng lấy từ SecurityContext
        if (userEmail == null || userEmail.equals("SYSTEM") || userEmail.equals("ADMIN")) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                userEmail = auth.getName();
                if (userId == null) {
                    userId = userRepository.findByEmail(userEmail)
                            .map(UserJpaEntity::getId)
                            .orElse(null);
                }
            }
        }

        ActivityLog activityLog = ActivityLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .actionGroup(actionGroup)
                .actionType(actionType)
                .description(description)
                .ipAddress(ipAddress)
                .createdAt(LocalDateTime.now())
                .build();
        
        activityLogRepository.save(activityLog);
    }

    // Tiện ích để lấy IP của người dùng
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String remoteAddr = request.getHeader("X-Forwarded-For");
                if (remoteAddr == null || remoteAddr.isEmpty()) {
                    remoteAddr = request.getRemoteAddr();
                }
                return remoteAddr;
            }
        } catch (Exception e) {
            log.warn("Không thể lấy IP người dùng: {}", e.getMessage());
        }
        return "UNKNOWN";
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    public List<ActivityLog> getActivitiesByGroup(String group) {
        return activityLogRepository.findByActionGroupOrderByCreatedAtDesc(group);
    }

    public List<ActivityLog> searchActivities(String group, String query) {
        if (group != null && (group.equals("ALL") || group.isEmpty())) {
            group = null;
        }
        return activityLogRepository.searchActivities(group, query);
    }
}
