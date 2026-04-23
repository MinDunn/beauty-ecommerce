package com.beauty.ecommerce.order.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderJpaEntity, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<OrderJpaEntity> {
    List<OrderJpaEntity> findByUserEmailOrderByOrderDateDesc(String email);
    List<OrderJpaEntity> findAllByOrderByOrderDateDesc();
    
    List<OrderJpaEntity> findByStatusAndPaymentMethodAndOrderDateBefore(String status, String paymentMethod, java.time.LocalDateTime cutoffTime);

    long countByUser_Id(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM OrderJpaEntity o WHERE o.user.id = :userId AND (o.status = 'DELIVERED' OR o.status = 'COMPLETED')")
    java.math.BigDecimal sumTotalSpentByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) > 0 FROM OrderJpaEntity o JOIN o.items i WHERE o.user.id = :userId AND i.product.id = :productId AND o.status = 'DELIVERED'")
    boolean hasPurchasedProduct(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("productId") Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.status <> 'CANCELLED' AND (o.paymentStatus = 'PAID' OR o.paymentMethod = 'COD')")
    long countValidOrders();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM OrderJpaEntity o WHERE o.status <> 'CANCELLED' AND (o.paymentStatus = 'PAID' OR o.paymentMethod = 'COD')")
    java.math.BigDecimal sumTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.status <> 'CANCELLED' AND (o.paymentStatus = 'PAID' OR o.paymentMethod = 'COD') AND o.orderDate >= :startDate")
    long countValidOrdersSince(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM OrderJpaEntity o WHERE o.status <> 'CANCELLED' AND (o.paymentStatus = 'PAID' OR o.paymentMethod = 'COD') AND o.orderDate >= :startDate")
    java.math.BigDecimal sumTotalRevenueSince(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.status <> 'CANCELLED' AND (o.paymentStatus = 'PAID' OR o.paymentMethod = 'COD') AND o.orderDate >= :startDate AND o.orderDate < :endDate")
    long countValidOrdersBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM OrderJpaEntity o WHERE o.status <> 'CANCELLED' AND (o.paymentStatus = 'PAID' OR o.paymentMethod = 'COD') AND o.orderDate >= :startDate AND o.orderDate < :endDate")
    java.math.BigDecimal sumTotalRevenueBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM OrderJpaEntity o ORDER BY o.orderDate DESC")
    List<OrderJpaEntity> findRecentOrders(org.springframework.data.domain.Pageable pageable);
}
