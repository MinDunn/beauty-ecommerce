package com.beauty.ecommerce.cart.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private String variantName;
    private BigDecimal price;
    private Integer quantity;
    private Integer stockQuantity;
    private Long userId;
}
