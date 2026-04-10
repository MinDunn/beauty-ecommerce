package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.product.application.service.CouponService;
import com.beauty.ecommerce.product.adapter.out.persistence.CouponJpaEntity;
import com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse;
import com.beauty.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Slf4j
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @RequestParam String code,
            @RequestParam Double orderValue) {
        log.info("Yêu cầu xác thực mã giảm giá: {}", code);
        CouponJpaEntity coupon = couponService.validateCoupon(code, orderValue);
        
        CouponResponse response = CouponResponse.builder()
                .code(coupon.getCode())
                .discountValue(coupon.getDiscountValue())
                .discountType(coupon.getDiscountType())
                .maxDiscount(coupon.getMaxDiscount())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã giảm giá thành công", response));
    }
}
