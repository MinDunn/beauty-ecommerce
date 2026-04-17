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

            revenueHistory.add(DashboardResponse.RevenueData.builder()
                    .date(date.format(formatter))
                    .revenue(dayRevenue)
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

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalFeedback(totalFeedback)
                .revenueGrowth(revenueGrowth)
                .orderGrowth(orderGrowth)
                .customerGrowth(customerGrowth)
                .feedbackGrowth(feedbackGrowth)
                .revenueHistory(revenueHistory)
                .recentOrders(recentOrders)
                .topFavoritedProducts(topFavorited)
                .topRatedProducts(topRated)
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
