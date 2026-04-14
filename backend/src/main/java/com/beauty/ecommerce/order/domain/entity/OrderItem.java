package com.beauty.ecommerce.order.domain.entity;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal price;
    private String variantName;
}
