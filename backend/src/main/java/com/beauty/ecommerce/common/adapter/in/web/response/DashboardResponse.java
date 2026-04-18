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
    private BigDecimal revenueGrowth;
    private BigDecimal orderGrowth;
    private BigDecimal customerGrowth;
    private BigDecimal feedbackGrowth;
    private List<RevenueData> revenueHistory;
    private List<Map<String, Object>> recentOrders;
    private List<ProductTrendData> topFavoritedProducts;
    private List<ProductTrendData> topRatedProducts;

    @Getter
    @Builder
    public static class RevenueData {
        private String date;
        private BigDecimal revenue;
    }

    @Getter
    @Builder
    public static class ProductTrendData {
        private Long id;
        private String name;
        private String imageUrl;
        private long count; // Lượt yêu thích hoặc lượt đánh giá
        @Builder.Default
        private long salesCount = 0; // Lượt mua thực tế trong cùng kỳ
    }
}
