package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.common.adapter.in.web.response.DashboardResponse;
import com.beauty.ecommerce.contact.adapter.out.persistence.ContactRepository;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderJpaEntity;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    public DashboardResponse getStats() {
        List<OrderJpaEntity> allOrders = orderRepository.findAllByOrderByOrderDateDesc();
        
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> !OrderStatus.CANCELLED.name().equals(o.getStatus()))
                .map(OrderJpaEntity::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.size();
        long totalCustomers = userRepository.count();
        long totalFeedback = reviewRepository.count() + contactRepository.count();

        // 7 days revenue chart
        List<DashboardResponse.RevenueData> revenueHistory = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            BigDecimal dayRevenue = allOrders.stream()
                    .filter(o -> !OrderStatus.CANCELLED.equals(o.getStatus()))
                    .filter(o -> o.getOrderDate() != null && o.getOrderDate().isAfter(startOfDay) && o.getOrderDate().isBefore(endOfDay))
                    .map(OrderJpaEntity::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            revenueHistory.add(DashboardResponse.RevenueData.builder()
                    .date(date.format(formatter))
                    .revenue(dayRevenue)
                    .build());
        }

        // Recent 4 orders
        List<Map<String, Object>> recentOrders = allOrders.stream()
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

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalFeedback(totalFeedback)
                .revenueHistory(revenueHistory)
                .recentOrders(recentOrders)
                .build();
    }
}
