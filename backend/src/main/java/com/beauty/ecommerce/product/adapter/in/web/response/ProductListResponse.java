package com.beauty.ecommerce.product.adapter.in.web.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductListResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal currentPrice;
    private BigDecimal originalPrice;
    private Integer stockQuantity;
    private String imageUrl;
    private java.util.List<String> images;
    private java.util.List<ProductResponse.ProductVariantResponse> variants;
    private Long categoryId;
    private String instructions;
    private String ingredients;
    private Double averageRating;
    private Long reviewCount;
    private String skinType;
    private Long viewCount;
    private Integer sold;
    private String status;
    private java.time.LocalDate expiryDate;
}
