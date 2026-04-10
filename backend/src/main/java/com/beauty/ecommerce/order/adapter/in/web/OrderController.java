package com.beauty.ecommerce.order.adapter.in.web;

import com.beauty.ecommerce.order.adapter.in.web.request.OrderRequest;
import com.beauty.ecommerce.order.adapter.in.web.response.OrderItemResponse;
import com.beauty.ecommerce.order.adapter.in.web.response.OrderResponse;
import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.domain.entity.Order;
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
        Order order = orderUseCase.placeOrder(email, request.getReceiverName(), request.getReceiverPhone(), request.getShippingAddress());
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

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
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
