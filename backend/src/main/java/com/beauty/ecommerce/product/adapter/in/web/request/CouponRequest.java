package com.beauty.ecommerce.product.adapter.in.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotBlank(message = "Loại giảm giá không được để trống")
    private String discountType; // PERCENTAGE or FIXED

    @NotNull(message = "Giá trị giảm giá không được để trống")
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;

    private LocalDateTime expiryDate;
    private LocalDateTime startDate;

    private Integer usageLimit;

    private Boolean isActive = true;

    private Long categoryId;

    private BigDecimal maxDiscountAmount;

    private Integer minQuantity;

    private Boolean isNewUserOnly;

    private BigDecimal minSpentAmount;

    private String description;
}
