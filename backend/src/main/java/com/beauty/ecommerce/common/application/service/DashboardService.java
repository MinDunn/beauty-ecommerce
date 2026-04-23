package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.common.adapter.in.web.response.DashboardResponse;
import com.beauty.ecommerce.contact.adapter.out.persistence.ContactRepository;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderItemRepository;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.WishlistRepository;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentRepository;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentJpaEntity;
import com.beauty.ecommerce.inventory.application.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ContactRepository contactRepository;
    private final WishlistRepository wishlistRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final InventoryService inventoryService;

    public DashboardResponse getStats(int days) {
        // Use optimized repository methods instead of findAll()
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        long totalOrders = orderRepository.countValidOrders();
        long totalCustomers = userRepository.count();
        long totalFeedback = reviewRepository.count() + contactRepository.count();
        
        // Optimized COGS calculation using InventoryService for accuracy
        BigDecimal totalCost = calculateActualCOGS(orderItemRepository.findAll().stream()
                .filter(oi -> !"CANCELLED".equalsIgnoreCase(oi.getOrder().getStatus()))
                .filter(oi -> "PAID".equalsIgnoreCase(oi.getOrder().getPaymentStatus()) 
                           || "COD".equalsIgnoreCase(oi.getOrder().getPaymentMethod()))
                .collect(Collectors.toList()));

        // Inventory Loss and Compensation (already using repository but could be optimized if needed)
        List<InventoryAdjustmentJpaEntity> allAdjustments = adjustmentRepository.findAll();
        BigDecimal totalInventoryLoss = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .map(InventoryAdjustmentJpaEntity::getEstimatedLossAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCompensation = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .map(InventoryAdjustmentJpaEntity::getCompensationAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProfit = totalRevenue.subtract(totalCost).subtract(totalInventoryLoss).add(totalCompensation);

        // Time periods for growth calculation
        LocalDate today = LocalDate.now();
        LocalDateTime currentPeriodStart = today.minusDays(days).atStartOfDay();
        LocalDateTime previousPeriodStart = today.minusDays(2 * days).atStartOfDay();

        // Current period totals using optimized queries
        BigDecimal currentPeriodRevenue = orderRepository.sumTotalRevenueSince(currentPeriodStart);
        if (currentPeriodRevenue == null) currentPeriodRevenue = BigDecimal.ZERO;
        long currentPeriodOrders = orderRepository.countValidOrdersSince(currentPeriodStart);
        long currentPeriodCustomers = userRepository.countUsersSince(currentPeriodStart);
        long currentPeriodFeedback = reviewRepository.countReviewsSince(currentPeriodStart) + contactRepository.countContactsSince(currentPeriodStart);

        // Previous period totals using optimized queries
        BigDecimal prevRevenue = orderRepository.sumTotalRevenueBetween(previousPeriodStart, currentPeriodStart);
        if (prevRevenue == null) prevRevenue = BigDecimal.ZERO;
        long prevOrders = orderRepository.countValidOrdersBetween(previousPeriodStart, currentPeriodStart);
        long prevCustomers = userRepository.countUsersBetween(previousPeriodStart, currentPeriodStart);
        long prevFeedback = reviewRepository.countReviewsBetween(previousPeriodStart, currentPeriodStart) + contactRepository.countContactsBetween(previousPeriodStart, currentPeriodStart);

        // Calculate growths
        BigDecimal revenueGrowth = calculateGrowth(currentPeriodRevenue.subtract(prevRevenue), prevRevenue);
        BigDecimal orderGrowth = calculateGrowth(BigDecimal.valueOf(currentPeriodOrders - prevOrders), BigDecimal.valueOf(prevOrders));
        BigDecimal customerGrowth = calculateGrowth(BigDecimal.valueOf(currentPeriodCustomers - prevCustomers), BigDecimal.valueOf(prevCustomers));
        BigDecimal feedbackGrowth = calculateGrowth(BigDecimal.valueOf(currentPeriodFeedback - prevFeedback), BigDecimal.valueOf(prevFeedback));

        // Period Profit Calculation
        BigDecimal currentPeriodCost = calculateActualCOGS(orderItemRepository.findAll().stream()
                .filter(oi -> oi.getOrder().getOrderDate().isAfter(currentPeriodStart) || oi.getOrder().getOrderDate().isEqual(currentPeriodStart))
                .filter(oi -> !"CANCELLED".equalsIgnoreCase(oi.getOrder().getStatus()))
                .filter(oi -> "PAID".equalsIgnoreCase(oi.getOrder().getPaymentStatus()) 
                           || "COD".equalsIgnoreCase(oi.getOrder().getPaymentMethod()))
                .collect(Collectors.toList()));

        BigDecimal currentPeriodLoss = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null && !a.getCreatedAt().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getEstimatedLossAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentPeriodCompensation = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null && !a.getCreatedAt().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getCompensationAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentPeriodProfit = currentPeriodRevenue.subtract(currentPeriodCost).subtract(currentPeriodLoss).add(currentPeriodCompensation);

        // Previous Period Profit for Growth
        BigDecimal prevCost = orderItemRepository.calculateTotalCOGSBetween(previousPeriodStart, currentPeriodStart);
        if (prevCost == null) prevCost = BigDecimal.ZERO;

        BigDecimal prevLoss = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null 
                        && !a.getCreatedAt().isBefore(previousPeriodStart) 
                        && a.getCreatedAt().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getEstimatedLossAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevCompensation = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null 
                        && !a.getCreatedAt().isBefore(previousPeriodStart) 
                        && a.getCreatedAt().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getCompensationAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevProfit = prevRevenue.subtract(prevCost).subtract(prevLoss).add(prevCompensation);
        BigDecimal profitGrowth = calculateGrowth(currentPeriodProfit.subtract(prevProfit), prevProfit);

        // Revenue chart history
        List<DashboardResponse.RevenueData> revenueHistory = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        int historyDays = Math.min(days, 30);
        for (int i = historyDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();

            BigDecimal dayRevenue = orderRepository.sumTotalRevenueBetween(start, end);
            if (dayRevenue == null) dayRevenue = BigDecimal.ZERO;

            BigDecimal dayCost = orderItemRepository.calculateTotalCOGSBetween(start, end);
            if (dayCost == null) dayCost = BigDecimal.ZERO;

            BigDecimal dayLoss = allAdjustments.stream()
                    .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                    .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().equals(date))
                    .map(InventoryAdjustmentJpaEntity::getEstimatedLossAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dayCompensation = allAdjustments.stream()
                    .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                    .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().equals(date))
                    .map(InventoryAdjustmentJpaEntity::getCompensationAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dayProfit = dayRevenue.subtract(dayCost).subtract(dayLoss).add(dayCompensation);

            revenueHistory.add(DashboardResponse.RevenueData.builder()
                    .date(date.format(formatter))
                    .revenue(dayRevenue)
                    .profit(dayProfit)
                    .build());
        }

        // Recent orders using optimized query with pagination
        List<Map<String, Object>> recentOrders = orderRepository.findRecentOrders(PageRequest.of(0, 4)).stream()
                .map(o -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", o.getId());
                    map.put("name", o.getReceiverName());
                    map.put("amount", o.getTotalPrice());
                    map.put("status", o.getStatus());
                    return map;
                })
                .collect(Collectors.toList());

        // Top Favorited Products
        Map<Long, Long> favoriteMap = wishlistRepository.findTopFavoritedProducts(currentPeriodStart, PageRequest.of(0, 5))
                .stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (Long) obj[1],
                        (a, b) -> a
                ));

        // Top Sales Count
        Map<Long, Long> salesMap = orderItemRepository.findSalesCountByProduct(currentPeriodStart)
                .stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (Long) obj[1],
                        (a, b) -> a
                ));

        List<DashboardResponse.ProductTrendData> topFavorited = favoriteMap.keySet().stream()
                .map(productId -> {
                    long faves = favoriteMap.get(productId);
                    long sales = salesMap.getOrDefault(productId, 0L);
                    ProductJpaEntity product = productRepository.findById(productId).orElse(null);
                    return DashboardResponse.ProductTrendData.builder()
                            .id(productId)
                            .name(product != null ? product.getName() : "Unknown")
                            .imageUrl(product != null ? product.getImageUrl() : "")
                            .count(faves)
                            .salesCount(sales)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getCount() - b.getSalesCount(), a.getCount() - a.getSalesCount()))
                .limit(5)
                .collect(Collectors.toList());

        // Top Rated Products (5 stars)
        List<DashboardResponse.ProductTrendData> topRated = reviewRepository.findTopRatedProducts(currentPeriodStart, PageRequest.of(0, 5))
                .stream()
                .map(obj -> {
                    Long productId = (Long) obj[0];
                    long count = (Long) obj[1];
                    ProductJpaEntity product = productRepository.findById(productId).orElse(null);
                    return DashboardResponse.ProductTrendData.builder()
                            .id(productId)
                            .name(product != null ? product.getName() : "Unknown")
                            .imageUrl(product != null ? product.getImageUrl() : "")
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());

        // Category Revenue
        List<DashboardResponse.CategoryRevenueData> categoryRevenue = orderItemRepository.findRevenueByCategory(currentPeriodStart)
                .stream()
                .map(obj -> DashboardResponse.CategoryRevenueData.builder()
                        .name(obj[0] != null ? (String) obj[0] : "Khác")
                        .revenue((BigDecimal) obj[1])
                        .build())
                .collect(Collectors.toList());

        // Order Status Distribution
        // This still requires fetching statuses, but we can do it with a specialized query if needed.
        // For now, let's keep it but ideally use a group by status query.
        List<DashboardResponse.OrderStatusData> statusDistribution = new ArrayList<>();
        
        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalProfit(totalProfit)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalFeedback(totalFeedback)
                .revenueGrowth(revenueGrowth)
                .profitGrowth(profitGrowth)
                .orderGrowth(orderGrowth)
                .customerGrowth(customerGrowth)
                .feedbackGrowth(feedbackGrowth)
                .totalCost(totalCost)
                .totalInventoryLoss(totalInventoryLoss)
                .totalCompensation(totalCompensation)
                .revenueHistory(revenueHistory)
                .recentOrders(recentOrders)
                .topFavoritedProducts(topFavorited)
                .topRatedProducts(topRated)
                .revenueByCategory(categoryRevenue)
                .orderStatusDistribution(statusDistribution)
                .build();
    }

    private BigDecimal calculateGrowth(BigDecimal currentDiff, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            // If currentDiff is positive, return 100% growth
            return currentDiff.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        return currentDiff.divide(previous, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal calculateActualCOGS(List<com.beauty.ecommerce.order.adapter.out.persistence.OrderItemJpaEntity> items) {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        return items.stream()
                .map(item -> {
                    BigDecimal unitCost = inventoryService.getUnitCost(item.getProduct().getId(), item.getVariantName());
                    return unitCost.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
