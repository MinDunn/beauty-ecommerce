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
}
