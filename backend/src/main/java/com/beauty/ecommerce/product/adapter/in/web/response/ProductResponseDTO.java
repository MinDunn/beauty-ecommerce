package com.beauty.ecommerce.product.adapter.in.web.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal currentPrice;
    private String imageUrl;
}
