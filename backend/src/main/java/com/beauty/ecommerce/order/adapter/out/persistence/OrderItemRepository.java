package com.beauty.ecommerce.order.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemJpaEntity, Long> {
    List<OrderItemJpaEntity> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT oi.product.id, SUM(oi.quantity) as totalSales FROM OrderItemJpaEntity oi " +
           "WHERE oi.order.orderDate >= :startDate " +
           "GROUP BY oi.product.id")
    List<Object[]> findSalesCountByProduct(java.time.LocalDateTime startDate);
    @org.springframework.data.jpa.repository.Query("SELECT oi.product.category.name, SUM(oi.price * oi.quantity) FROM OrderItemJpaEntity oi " +
           "WHERE oi.order.orderDate >= :startDate " +
           "GROUP BY oi.product.category.name")
    List<Object[]> findRevenueByCategory(java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(oi.quantity * p.originalPrice) FROM OrderItemJpaEntity oi " +
           "JOIN oi.product p " +
           "WHERE oi.order.status <> 'CANCELLED' " +
           "AND (oi.order.paymentStatus = 'PAID' OR oi.order.paymentMethod = 'COD')")
    java.math.BigDecimal calculateTotalCOGS();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(oi.quantity * p.originalPrice) FROM OrderItemJpaEntity oi " +
           "JOIN oi.product p " +
           "WHERE oi.order.status <> 'CANCELLED' " +
           "AND (oi.order.paymentStatus = 'PAID' OR oi.order.paymentMethod = 'COD') " +
           "AND oi.order.orderDate >= :startDate")
    java.math.BigDecimal calculateTotalCOGSSince(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(oi.quantity * p.originalPrice) FROM OrderItemJpaEntity oi " +
           "JOIN oi.product p " +
           "WHERE oi.order.status <> 'CANCELLED' " +
           "AND (oi.order.paymentStatus = 'PAID' OR oi.order.paymentMethod = 'COD') " +
           "AND oi.order.orderDate >= :startDate AND oi.order.orderDate < :endDate")
    java.math.BigDecimal calculateTotalCOGSBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
}
