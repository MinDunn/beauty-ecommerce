package com.beauty.ecommerce.order.application.port.in;

import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentStatus;
import java.util.List;

public interface OrderUseCase {
    Order placeOrder(PlaceOrderCommand command);
    List<Order> getOrderHistory(String email);
    List<Order> getAllOrders(String query, OrderStatus status);
    void updateOrderStatus(Long orderId, OrderStatus status);
    void updateOrdersStatus(List<Long> orderIds, OrderStatus status);
    void updatePaymentStatus(Long orderId, PaymentStatus status);
    void completePayment(Long orderId, String transId);
    Order lookupOrder(Long orderId);
    void cancelOrderByUser(Long orderId, String email, String reason);
    void approveCancellation(Long orderId);
    void rejectCancellation(Long orderId);
}
