package com.beauty.ecommerce.order.adapter.in.web.response;

import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private String paymentMethod;
    private String paymentStatus;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String cancelReason;
    private boolean vatRequested;
    private String taxCode;
    private String companyName;
    private String companyAddress;
    private List<OrderItemResponse> items;
}
