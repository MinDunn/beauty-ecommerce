package com.beauty.ecommerce.order.application.service;

import com.beauty.ecommerce.cart.application.port.out.CartPort;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.application.port.out.OrderPort;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderItem;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
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

    @Override
    @Transactional
    public Order placeOrder(String email, String receiverName, String receiverPhone, String shippingAddress) {
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

        // 1. Save Order
        Order savedOrder = orderPort.save(order);

        // 2. Update Product Stock
        for (CartItem cartItem : cartItems) {
            updateProductStockPort.updateStock(cartItem.getProductId(), cartItem.getQuantity());
        }

        // 3. Clear Cart
        cartPort.clearCart(email);

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
    }

    @Override
    public Order lookupOrder(Long orderId) {
        return orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));
    }
}
