package com.beauty.ecommerce.common.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DashboardDebugRunner implements CommandLineRunner {

    private final DashboardService dashboardService;
    private final com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository orderRepository;
    private final com.beauty.ecommerce.order.adapter.out.persistence.OrderItemRepository orderItemRepository;
    private final com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentRepository adjustmentRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("========== DASHBOARD DEBUG START ==========");
        
        BigDecimal revenue = orderRepository.sumTotalRevenue();
        System.out.println("Total Revenue: " + (revenue != null ? revenue : "0"));

        var items = orderItemRepository.findAll().stream()
                .filter(oi -> !"CANCELLED".equalsIgnoreCase(oi.getOrder().getStatus()))
                .filter(oi -> "PAID".equalsIgnoreCase(oi.getOrder().getPaymentStatus()) 
                           || "COD".equalsIgnoreCase(oi.getOrder().getPaymentMethod()))
                .collect(Collectors.toList());
        
        System.out.println("Valid Order Items Count: " + items.size());

        BigDecimal totalCost = dashboardService.calculateActualCOGS(items);
        System.out.println("Total COGS: " + totalCost);

        var adjustments = adjustmentRepository.findAll();
        BigDecimal loss = adjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .map(a -> a.getEstimatedLossAmount())
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal comp = adjustments.stream()
                .filter(a -> a.getStatus() == null || a.getStatus().equalsIgnoreCase("APPROVED") || a.getStatus().equalsIgnoreCase("COMPLETED"))
                .map(a -> a.getCompensationAmount())
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        System.out.println("Total Inventory Loss: " + loss);
        System.out.println("Total Compensation: " + comp);
        
        BigDecimal profit = (revenue != null ? revenue : BigDecimal.ZERO)
                .subtract(totalCost)
                .subtract(loss)
                .add(comp);
        
        System.out.println("FINAL CALCULATED PROFIT: " + profit);
        System.out.println("========== DASHBOARD DEBUG END ==========");
    }
}
