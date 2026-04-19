package com.beauty.ecommerce.product.adapter.in.web.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private BigDecimal discountValue;
    private String discountType;
    private BigDecimal minOrderAmount;
    private LocalDateTime expiryDate;
    private LocalDateTime startDate;
    private Boolean isActive;
    private Integer usageLimit;
    private Integer usageCount;
    private Long categoryId;
    private BigDecimal maxDiscountAmount;
    private Integer minQuantity;
    private Boolean isNewUserOnly;
    private BigDecimal minSpentAmount;
    private String description;
}
