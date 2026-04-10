package com.beauty.ecommerce.product.adapter.in.web.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CouponResponse {
    private String code;
    private Double discountValue;
    private String discountType;
    private Double maxDiscount;
}
