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
import com.beauty.ecommerce.product.application.service.CouponService;
import com.beauty.ecommerce.product.adapter.out.persistence.CouponJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import com.beauty.ecommerce.order.application.port.in.PlaceOrderCommand;
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
    private final CouponService couponService;
    private final com.beauty.ecommerce.payment.application.service.MoMoService moMoService;

    @Override
    @Transactional
    public Order placeOrder(PlaceOrderCommand command) {
        String email = command.getEmail();
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> allCartItems = cartPort.findByUserEmail(email);
        List<CartItem> cartItems;

        if (command.getCheckoutItems() != null && !command.getCheckoutItems().isEmpty()) {
            cartItems = allCartItems.stream()
                .filter(item -> command.getCheckoutItems().stream().anyMatch(ci -> 
                    ci.getProductId().equals(item.getProductId()) && 
                    ((ci.getVariantName() == null && item.getVariantName() == null) || 
                     (ci.getVariantName() != null && ci.getVariantName().equals(item.getVariantName())))
                ))
                .collect(Collectors.toList());
        } else {
            cartItems = allCartItems;
        }

        if (cartItems.isEmpty()) {
            throw new RuntimeException("No items selected for order");
        }

        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply Coupon
        String couponCode = command.getCouponCode();
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            CouponJpaEntity coupon = couponService.validateCoupon(couponCode, totalPrice.doubleValue());
            BigDecimal discount = BigDecimal.ZERO;
            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = totalPrice.multiply(coupon.getDiscountValue()).divide(new BigDecimal(100));
            } else {
                discount = coupon.getDiscountValue();
            }
            totalPrice = totalPrice.subtract(discount);
            if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
                totalPrice = BigDecimal.ZERO;
            }
        }

        Order order = Order.builder()
                .userId(user.getId())
                .orderDate(LocalDateTime.now())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .paymentMethod(command.getPaymentMethod())
                .paymentStatus(PaymentStatus.UNPAID)
                .receiverName(command.getReceiverName())
                .receiverPhone(command.getReceiverPhone())
                .shippingAddress(command.getShippingAddress())
                .items(cartItems.stream()
                        .map(cartItem -> OrderItem.builder()
                                .productId(cartItem.getProductId())
                                .productName(cartItem.getProductName())
                                .productImageUrl(cartItem.getProductImageUrl())
                                .quantity(cartItem.getQuantity())
                                .price(cartItem.getPrice())
                                .variantName(cartItem.getVariantName())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        // Update user profile
        boolean userUpdated = false;
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            user.setPhone(command.getReceiverPhone());
            userUpdated = true;
        }
        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            user.setAddress(command.getShippingAddress());
            userUpdated = true;
        }
        if (userUpdated) {
            userRepository.save(user);
        }

        // 1. Save Order
        Order savedOrder = orderPort.save(order);

        // 1.1 Use Coupon
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            couponService.useCoupon(couponCode);
        }

        // 2. Update Product Stock (Only for COD)
        if (command.getPaymentMethod() == PaymentMethod.COD) {
            for (CartItem cartItem : cartItems) {
                updateProductStockPort.updateStock(cartItem.getProductId(), cartItem.getQuantity());
            }
        }

        // 3. Clear Ordered Items from Cart
        for (CartItem item : cartItems) {
            cartPort.delete(email, item.getProductId(), item.getVariantName());
        }

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
    @Transactional
    public void completePayment(Long orderId, String transId) {
        Order order = orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return; // Already processed
        }

        // 1. Deduct stock
        for (OrderItem item : order.getItems()) {
            updateProductStockPort.updateStock(item.getProductId(), item.getQuantity());
        }

        // 2. Update status & transId
        orderPort.updatePaymentStatus(orderId, PaymentStatus.PAID);
        orderPort.updateStatus(orderId, OrderStatus.CONFIRMED);
        if (transId != null) {
            orderPort.updatePaymentTransactionId(orderId, transId);
        }

        activityLogService.logActivity(order.getUserId(), "SYSTEM", "COMPLETE_PAYMENT", 
                "Hoàn tất thanh toán cho đơn hàng #" + orderId + ". Tồn kho đã được cập nhật.");
    }

    @Override
    public Order lookupOrder(Long orderId) {
        return orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));
    }

    @Override
    @Transactional
    public void cancelOrderByUser(Long orderId, String email, String reason) {
        Order order = orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));

        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!order.getUserId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này.");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || 
            order.getStatus() == OrderStatus.CANCELLED || 
            order.getStatus() == OrderStatus.SHIPPING ||
            order.getStatus() == OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Đơn hàng không thể gửi yêu cầu hủy ở trạng thái hiện tại.");
        }

        // Just REQUEST cancellation, don't refund or restore stock yet
        orderPort.updateStatus(orderId, OrderStatus.CANCELLATION_REQUESTED);
        
        String logMessage = "Khách hàng gửi yêu cầu hủy đơn hàng #" + orderId + (reason != null ? ". Lý do: " + reason : "");
        activityLogService.logActivity(user.getId(), email, "CANCEL_ORDER_REQUEST", logMessage);
    }

    @Override
    @Transactional
    public void approveCancellation(Long orderId) {
        Order order = orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));

        if (order.getStatus() != OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Đơn hàng không ở trạng thái yêu cầu hủy.");
        }

        // 1. Process MoMo Refund if applicable
        if (order.getPaymentMethod() == PaymentMethod.MOMO && order.getPaymentStatus() == PaymentStatus.PAID) {
            if (order.getPaymentTransactionId() != null) {
                boolean success = moMoService.refundOrder(orderId, order.getPaymentTransactionId(), order.getTotalPrice().longValue());
                if (!success) {
                    throw new RuntimeException("Lỗi khi gọi API hoàn tiền MoMo. Admin vui lòng xử lý thủ công.");
                }
                orderPort.updatePaymentStatus(orderId, PaymentStatus.REFUNDED);
            }
        }

        // 2. Restore Stock
        for (OrderItem item : order.getItems()) {
            updateProductStockPort.restoreStock(item.getProductId(), item.getQuantity());
        }

        // 3. Finalize Status
        orderPort.updateStatus(orderId, OrderStatus.CANCELLED);
        
        activityLogService.logActivity(order.getUserId(), "ADMIN", "APPROVE_CANCELLATION", 
                "Admin đã phê duyệt yêu cầu hủy đơn hàng #" + orderId);
    }

    @Override
    @Transactional
    public void rejectCancellation(Long orderId) {
        Order order = orderPort.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));

        if (order.getStatus() != OrderStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Đơn hàng không ở trạng thái yêu cầu hủy.");
        }

        // Revert to CONFIRMED or PENDING based on logic, here we use CONFIRMED as a safe middle ground
        orderPort.updateStatus(orderId, OrderStatus.CONFIRMED);
        
        activityLogService.logActivity(order.getUserId(), "ADMIN", "REJECT_CANCELLATION", 
                "Admin đã từ chối yêu cầu hủy đơn hàng #" + orderId);
    }
}
