package com.beauty.ecommerce.order.application.service;

import com.beauty.ecommerce.order.adapter.out.persistence.OrderJpaEntity;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void cleanupAbandonedMomoOrders() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(30);
        
        List<OrderJpaEntity> abandonedOrders = orderRepository.findByStatusAndPaymentMethodAndOrderDateBefore(
                OrderStatus.PENDING.name(), PaymentMethod.MOMO.name(), cutoffTime);

        if (!abandonedOrders.isEmpty()) {
            log.info("Found {} abandoned MoMo orders. Cancelling them...", abandonedOrders.size());
            for (OrderJpaEntity order : abandonedOrders) {
                order.setStatus(OrderStatus.CANCELLED.name());
                orderRepository.save(order);
                log.info("Cancelled order #{}", order.getId());
            }
        }
    }
}
