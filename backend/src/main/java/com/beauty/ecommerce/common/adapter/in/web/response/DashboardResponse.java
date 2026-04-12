package com.beauty.ecommerce.common.adapter.in.web.response;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class DashboardResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalCustomers;
    private long totalFeedback;
    private List<RevenueData> revenueHistory;
    private List<Map<String, Object>> recentOrders;

    @Getter
    @Builder
    public static class RevenueData {
        private String date;
        private BigDecimal revenue;
    }
}
