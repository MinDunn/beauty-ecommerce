package com.beauty.ecommerce.order.adapter.in.web;

import com.beauty.ecommerce.order.adapter.in.web.response.OrderItemResponse;
import com.beauty.ecommerce.order.adapter.in.web.response.OrderResponse;
import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderUseCase orderUseCase;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> response = orderUseCase.getAllOrders().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        orderUseCase.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
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
