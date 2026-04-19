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
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> response = orderUseCase.getAllOrders(search, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/bulk-status")
    public ResponseEntity<Void> updateOrdersStatus(@RequestBody BulkStatusRequest request) {
        orderUseCase.updateOrdersStatus(request.getIds(), request.getStatus());
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class BulkStatusRequest {
        private List<Long> ids;
        private OrderStatus status;
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        orderUseCase.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/confirm-payment")
    public ResponseEntity<Void> confirmPayment(@PathVariable Long id) {
        orderUseCase.completePayment(id, null);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/approve-cancel")
    public ResponseEntity<Void> approveCancellation(@PathVariable Long id) {
        orderUseCase.approveCancellation(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject-cancel")
    public ResponseEntity<Void> rejectCancellation(@PathVariable Long id) {
        orderUseCase.rejectCancellation(id);
        return ResponseEntity.ok().build();
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "UNKNOWN")
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "UNPAID")
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
