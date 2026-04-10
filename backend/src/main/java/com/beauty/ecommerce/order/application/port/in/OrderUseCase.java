package com.beauty.ecommerce.order.application.port.in;

import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;

import java.util.List;

public interface OrderUseCase {
    Order placeOrder(String email, String receiverName, String receiverPhone, String shippingAddress);
    List<Order> getOrderHistory(String email);
    List<Order> getAllOrders();
    void updateOrderStatus(Long orderId, OrderStatus status);
    Order lookupOrder(Long orderId);
}
