package com.beauty.ecommerce.order.application.port.out;

import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import java.util.List;
import java.util.Optional;

public interface OrderPort {
    Order save(Order order);
    List<Order> findByUserEmail(String email);
    List<Order> findAll();
    Optional<Order> findById(Long id);
    void updateStatus(Long id, OrderStatus status);
}
