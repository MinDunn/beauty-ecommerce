package com.beauty.ecommerce.order.application.port.in;

import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentMethod;

import com.beauty.ecommerce.order.domain.entity.PaymentStatus;
import java.util.List;

public interface OrderUseCase {
    Order placeOrder(String email, String receiverName, String receiverPhone, String shippingAddress, PaymentMethod paymentMethod);
    List<Order> getOrderHistory(String email);
    List<Order> getAllOrders();
    void updateOrderStatus(Long orderId, OrderStatus status);
    void updatePaymentStatus(Long orderId, PaymentStatus status);
    Order lookupOrder(Long orderId);
}
