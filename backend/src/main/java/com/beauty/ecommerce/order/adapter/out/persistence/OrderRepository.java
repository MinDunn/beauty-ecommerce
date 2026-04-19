package com.beauty.ecommerce.order.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderJpaEntity, Long> {
    List<OrderJpaEntity> findByUserEmailOrderByOrderDateDesc(String email);
    List<OrderJpaEntity> findAllByOrderByOrderDateDesc();
    
    List<OrderJpaEntity> findByStatusAndPaymentMethodAndOrderDateBefore(String status, String paymentMethod, java.time.LocalDateTime cutoffTime);

    long countByUser_Id(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM OrderJpaEntity o WHERE o.user.id = :userId AND (o.status = 'DELIVERED' OR o.status = 'COMPLETED')")
    java.math.BigDecimal sumTotalSpentByUserId(Long userId);
}
