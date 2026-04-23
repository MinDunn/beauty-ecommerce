package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.common.adapter.in.web.response.DashboardResponse;
import com.beauty.ecommerce.contact.adapter.out.persistence.ContactRepository;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderItemRepository;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderJpaEntity;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentMethod;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.WishlistRepository;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentRepository;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentJpaEntity;
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

    public DashboardResponse getStats(int days) {
        List<OrderJpaEntity> allOrders = orderRepository.findAll();
        
        // Calculate totals
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .map(OrderJpaEntity::getTotalPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .count();
        long totalCustomers = userRepository.count();
        long totalFeedback = reviewRepository.count() + contactRepository.count();
        
        // Calculate Cost of Goods Sold (COGS)
        Map<Long, BigDecimal> productCostMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(
                        ProductJpaEntity::getId,
                        p -> p.getOriginalPrice() != null ? p.getOriginalPrice() : BigDecimal.ZERO,
                        (a, b) -> a
                ));

        BigDecimal totalCost = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .flatMap(o -> o.getItems().stream())
                .map(item -> {
                    BigDecimal unitCost = productCostMap.getOrDefault(item.getProduct().getId(), BigDecimal.ZERO);
                    return unitCost.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Inventory Loss and Compensation
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
        LocalDate currentPeriodStart = today.minusDays(days);
        LocalDate previousPeriodStart = today.minusDays(2 * days);

        // Current period totals
        BigDecimal currentPeriodRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .filter(o -> o.getOrderDate() != null && !o.getOrderDate().toLocalDate().isBefore(currentPeriodStart))
                .map(OrderJpaEntity::getTotalPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long currentPeriodOrders = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .filter(o -> o.getOrderDate() != null && !o.getOrderDate().toLocalDate().isBefore(currentPeriodStart))
                .count();

        // Previous period totals
        BigDecimal prevRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .filter(o -> o.getOrderDate() != null 
                        && !o.getOrderDate().toLocalDate().isBefore(previousPeriodStart) 
                        && o.getOrderDate().toLocalDate().isBefore(currentPeriodStart))
                .map(OrderJpaEntity::getTotalPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long prevOrders = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .filter(o -> o.getOrderDate() != null 
                        && !o.getOrderDate().toLocalDate().isBefore(previousPeriodStart) 
                        && o.getOrderDate().toLocalDate().isBefore(currentPeriodStart))
                .count();

        long prevCustomers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null 
                        && !u.getCreatedAt().toLocalDate().isBefore(previousPeriodStart) 
                        && u.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .count();

        long prevFeedback = (long) reviewRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null 
                        && !r.getCreatedAt().toLocalDate().isBefore(previousPeriodStart) 
                        && r.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .count() + contactRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null 
                        && !c.getCreatedAt().toLocalDate().isBefore(previousPeriodStart) 
                        && c.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .count();

        // Current period totals for Customers and Feedback
        long currentPeriodCustomers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .count();
        long currentPeriodFeedback = (long) reviewRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .count() + contactRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .count();

        // Calculate growths
        BigDecimal revenueGrowth = calculateGrowth(currentPeriodRevenue.subtract(prevRevenue), prevRevenue);
        BigDecimal orderGrowth = calculateGrowth(BigDecimal.valueOf(currentPeriodOrders - prevOrders), BigDecimal.valueOf(prevOrders));
        BigDecimal customerGrowth = calculateGrowth(BigDecimal.valueOf(currentPeriodCustomers - prevCustomers), BigDecimal.valueOf(prevCustomers));
        BigDecimal feedbackGrowth = calculateGrowth(BigDecimal.valueOf(currentPeriodFeedback - prevFeedback), BigDecimal.valueOf(prevFeedback));

        // Period Profit Calculation
        BigDecimal currentPeriodCost = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .filter(o -> o.getOrderDate() != null && !o.getOrderDate().toLocalDate().isBefore(currentPeriodStart))
                .flatMap(o -> o.getItems().stream())
                .map(item -> {
                    BigDecimal unitCost = productCostMap.getOrDefault(item.getProduct().getId(), BigDecimal.ZERO);
                    return unitCost.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentPeriodLoss = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null && !a.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getEstimatedLossAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentPeriodCompensation = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null && !a.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getCompensationAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentPeriodProfit = currentPeriodRevenue.subtract(currentPeriodCost).subtract(currentPeriodLoss).add(currentPeriodCompensation);

        // Previous Period Profit for Growth
        BigDecimal prevCost = allOrders.stream()
                .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                .filter(o -> o.getOrderDate() != null 
                        && !o.getOrderDate().toLocalDate().isBefore(previousPeriodStart) 
                        && o.getOrderDate().toLocalDate().isBefore(currentPeriodStart))
                .flatMap(o -> o.getItems().stream())
                .map(item -> {
                    BigDecimal unitCost = productCostMap.getOrDefault(item.getProduct().getId(), BigDecimal.ZERO);
                    return unitCost.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevLoss = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null 
                        && !a.getCreatedAt().toLocalDate().isBefore(previousPeriodStart) 
                        && a.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getEstimatedLossAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevCompensation = allAdjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .filter(a -> a.getCreatedAt() != null 
                        && !a.getCreatedAt().toLocalDate().isBefore(previousPeriodStart) 
                        && a.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                .map(InventoryAdjustmentJpaEntity::getCompensationAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevProfit = prevRevenue.subtract(prevCost).subtract(prevLoss).add(prevCompensation);
        BigDecimal profitGrowth = calculateGrowth(currentPeriodProfit.subtract(prevProfit), prevProfit);

        // revenue chart history
        List<DashboardResponse.RevenueData> revenueHistory = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        int historyDays = Math.min(days, 30);
        for (int i = historyDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            final int dayIndex = i;

            BigDecimal dayRevenue = allOrders.stream()
                    .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                    .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                    .filter(o -> {
                        if (o.getOrderDate() == null) return false;
                        LocalDate orderDate = o.getOrderDate().toLocalDate();
                        // If it's the last bar (today), be more lenient to catch timezone shifts
                        if (dayIndex == 0) {
                            return !orderDate.isBefore(date.minusDays(1)); // Count today and yesterday's late orders if needed
                        }
                        return orderDate.equals(date);
                    })
                    .map(OrderJpaEntity::getTotalPrice)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dayCost = allOrders.stream()
                    .filter(o -> o.getStatus() != null && !OrderStatus.CANCELLED.name().equalsIgnoreCase(o.getStatus()))
                    .filter(o -> PaymentStatus.PAID.name().equals(o.getPaymentStatus()) || PaymentMethod.COD.name().equals(o.getPaymentMethod()))
                    .filter(o -> {
                        if (o.getOrderDate() == null) return false;
                        LocalDate orderDate = o.getOrderDate().toLocalDate();
                        if (dayIndex == 0) return !orderDate.isBefore(date.minusDays(1));
                        return orderDate.equals(date);
                    })
                    .flatMap(o -> o.getItems().stream())
                    .map(item -> {
                        BigDecimal unitCost = productCostMap.getOrDefault(item.getProduct().getId(), BigDecimal.ZERO);
                        return unitCost.multiply(BigDecimal.valueOf(item.getQuantity()));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

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

        // Recent 4 orders
        List<Map<String, Object>> recentOrders = allOrders.stream()
                .filter(o -> o.getOrderDate() != null)
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(4)
                .map(o -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", o.getId());
                    map.put("name", o.getReceiverName());
                    map.put("amount", o.getTotalPrice());
                    map.put("status", o.getStatus());
                    return map;
                })
                .collect(Collectors.toList());

        // 1. Lấy lượt yêu thích
        LocalDateTime startDateTime = currentPeriodStart.atStartOfDay();
        Map<Long, Long> favoriteMap = wishlistRepository.findTopFavoritedProducts(startDateTime, PageRequest.of(0, 100))
                .stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (Long) obj[1]
                ));

        // 2. Lấy lượt bán thực tế
        Map<Long, Long> salesMap = orderItemRepository.findSalesCountByProduct(startDateTime)
                .stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (Long) obj[1]
                ));

        // 3. Tính toán Potental Score = Favorites - Sales
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
        List<DashboardResponse.ProductTrendData> topRated = reviewRepository.findTopRatedProducts(startDateTime, PageRequest.of(0, 5))
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
        List<DashboardResponse.CategoryRevenueData> categoryRevenue = orderItemRepository.findRevenueByCategory(startDateTime)
                .stream()
                .map(obj -> DashboardResponse.CategoryRevenueData.builder()
                        .name(obj[0] != null ? (String) obj[0] : "Khác")
                        .revenue((BigDecimal) obj[1])
                        .build())
                .collect(Collectors.toList());

        // Order Status Distribution
        Map<String, Long> statusCount = allOrders.stream()
                .filter(o -> o.getStatus() != null)
                .collect(Collectors.groupingBy(OrderJpaEntity::getStatus, Collectors.counting()));
        
        List<DashboardResponse.OrderStatusData> statusDistribution = statusCount.entrySet().stream()
                .map(e -> DashboardResponse.OrderStatusData.builder()
                        .status(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

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
}
