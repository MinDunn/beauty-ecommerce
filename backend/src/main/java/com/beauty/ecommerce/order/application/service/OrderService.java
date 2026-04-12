package com.beauty.ecommerce.order.application.service;

import com.beauty.ecommerce.cart.application.port.out.CartPort;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.application.port.out.OrderPort;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderItem;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentMethod;
import com.beauty.ecommerce.order.domain.entity.PaymentStatus;
import com.beauty.ecommerce.common.application.service.ActivityLogService;
import com.beauty.ecommerce.product.application.port.out.UpdateProductStockPort;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService implements OrderUseCase {

    private final OrderPort orderPort;
    private final CartPort cartPort;
    private final UpdateProductStockPort updateProductStockPort;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public Order placeOrder(String email, String receiverName, String receiverPhone, String shippingAddress, PaymentMethod paymentMethod) {
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartPort.findByUserEmail(email);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .userId(user.getId())
                .orderDate(LocalDateTime.now())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.UNPAID)
                .receiverName(receiverName)
                .receiverPhone(receiverPhone)
                .shippingAddress(shippingAddress)
                .items(cartItems.stream()
                        .map(cartItem -> OrderItem.builder()
                                .productId(cartItem.getProductId())
                                .productName(cartItem.getProductName())
                                .productImageUrl(cartItem.getProductImageUrl())
                                .quantity(cartItem.getQuantity())
                                .price(cartItem.getPrice())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        // Update user profile if phone/address are empty
        boolean userUpdated = false;
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            user.setPhone(receiverPhone);
            userUpdated = true;
        }
        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            user.setAddress(shippingAddress);
            userUpdated = true;
        }
        if (userUpdated) {
            userRepository.save(user);
        }

        // 1. Save Order
        Order savedOrder = orderPort.save(order);

        // 2. Update Product Stock
        for (CartItem cartItem : cartItems) {
            updateProductStockPort.updateStock(cartItem.getProductId(), cartItem.getQuantity());
        }

        // 3. Clear Cart
        cartPort.clearCart(email);

        activityLogService.logActivity(user.getId(), email, "PLACE_ORDER", "Đặt đơn hàng mới #" + savedOrder.getId() + " (Tổng tiền: " + totalPrice + "đ)");

        return savedOrder;
    }

    @Override
    public List<Order> getOrderHistory(String email) {
        return orderPort.findByUserEmail(email);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderPort.findAll();
    }

    @Override
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        orderPort.updateStatus(orderId, status);
        activityLogService.logActivity(null, "ADMIN", "UPDATE_ORDER_STATUS", "Cập nhật trạng thái đơn hàng #" + orderId + " thành " + status);
    }

    @Override
    public void updatePaymentStatus(Long orderId, PaymentStatus status) {
        orderPort.updatePaymentStatus(orderId, status);
    }

    @Override
    public Order lookupOrder(Long orderId) {
        return orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));
    }
}
