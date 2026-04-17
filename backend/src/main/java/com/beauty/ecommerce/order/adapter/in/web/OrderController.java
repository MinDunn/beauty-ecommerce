package com.beauty.ecommerce.order.adapter.in.web;

import com.beauty.ecommerce.order.adapter.in.web.request.OrderRequest;
import com.beauty.ecommerce.order.adapter.in.web.response.OrderItemResponse;
import com.beauty.ecommerce.order.adapter.in.web.response.OrderResponse;
import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.application.port.in.PlaceOrderCommand;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.PaymentMethod;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderUseCase orderUseCase;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PaymentMethod method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        
        PlaceOrderCommand command = PlaceOrderCommand.builder()
            .email(email)
            .receiverName(request.getReceiverName())
            .receiverPhone(request.getReceiverPhone())
            .shippingAddress(request.getShippingAddress())
            .paymentMethod(method)
            .couponCode(request.getCouponCode())
            .checkoutItems(request.getCheckoutItems() != null ? 
                request.getCheckoutItems().stream()
                    .map(item -> PlaceOrderCommand.CheckoutItem.builder()
                        .productId(item.getProductId())
                        .variantName(item.getVariantName())
                        .build())
                    .collect(Collectors.toList()) : null)
            .build();

        Order order = orderUseCase.placeOrder(command);
        return ResponseEntity.ok(mapToResponse(order));
    }

    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getOrderHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<OrderResponse> response = orderUseCase.getOrderHistory(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/lookup/{orderId}")
    public ResponseEntity<OrderResponse> lookupOrder(@PathVariable Long orderId) {
        Order order = orderUseCase.lookupOrder(orderId);
        return ResponseEntity.ok(mapToResponse(order));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId, @RequestParam(required = false) String reason) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            orderUseCase.cancelOrderByUser(orderId, email, reason);
            return ResponseEntity.ok("Đã hủy đơn hàng thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "UNKNOWN")
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "PENDING")
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .productImageUrl(item.getProductImageUrl())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
