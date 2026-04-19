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
    private String skinType;
    private Long categoryId;
    private String instructions;
    private String ingredients;
    private LocalDateTime createdAt;
    private Long viewCount;
    private java.util.List<String> images;
    private java.util.List<ProductVariant> variants;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProductVariant {
        private Long id;
        private String variantName;
        private java.math.BigDecimal price;
        private String imageUrl;
        private Integer stockQuantity;
    }
}
