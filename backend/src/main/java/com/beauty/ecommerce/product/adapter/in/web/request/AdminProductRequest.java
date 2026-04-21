package com.beauty.ecommerce.product.adapter.in.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Original price is required")
    private BigDecimal originalPrice;
    
    @NotNull(message = "Sale price is required")
    private BigDecimal salePrice; // Maps to currentPrice
    
    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private String instructions;
    private String ingredients;
    private String skinType;
    @jakarta.validation.constraints.NotNull(message = "Expiry date is required")
    private java.time.LocalDate expiryDate;

    private String imageUrl;
    
    private java.util.List<String> existingImages;
    private java.util.List<VariantRequest> variants;

    @Data
    public static class VariantRequest {
        private String variantName;
        private java.math.BigDecimal price;
        private String imageUrl;
        private Integer stockQuantity;
        private Integer imageIndex; // Index in the general images list
    }
}
