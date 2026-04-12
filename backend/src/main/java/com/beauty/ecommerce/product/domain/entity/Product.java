package com.beauty.ecommerce.product.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product {
    private Long id;
    private String name;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal currentPrice;
    private Integer stockQuantity;
    private String imageUrl;
    private Long categoryId;
    private String instructions;
    private String ingredients;
    private LocalDateTime createdAt;
}
