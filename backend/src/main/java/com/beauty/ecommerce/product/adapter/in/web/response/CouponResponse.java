package com.beauty.ecommerce.product.adapter.in.web.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CouponResponse {
    private String code;
    private BigDecimal discountValue;
    private String discountType;
}
