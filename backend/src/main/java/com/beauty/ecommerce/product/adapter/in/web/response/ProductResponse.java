package com.beauty.ecommerce.product.adapter.in.web.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal currentPrice;
    private Integer stockQuantity;
    private String imageUrl;
    private java.util.List<String> images;
    private java.util.List<ProductVariantResponse> variants;
    private Long categoryId;
    private String instructions;
    private String ingredients;
    private String skinType;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Long viewCount;
    private Integer sold;
    private java.time.LocalDate expiryDate;
    private String status;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariantResponse {
        private Long id;
        private String variantName;
        private java.math.BigDecimal price;
        private String imageUrl;
        private Integer stockQuantity;
    }
}
