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
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/coupons/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @RequestParam String code,
            @RequestParam Double orderValue,
            @RequestParam(required = false) java.util.List<Long> categoryIds) {
        log.info("Yêu cầu xác thực mã giảm giá: {} cho các danh mục: {}", code, categoryIds);
        CouponJpaEntity coupon = couponService.validateCoupon(code, orderValue, categoryIds);
        
        CouponResponse response = CouponResponse.builder()
                .code(coupon.getCode())
                .discountValue(coupon.getDiscountValue())
                .discountType(coupon.getDiscountType())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã giảm giá thành công", response));
    }

    // Admin Endpoints
    @GetMapping("/admin/coupons")
    public ResponseEntity<ApiResponse<java.util.List<CouponResponse>>> getAllCoupons() {
        log.info("Admin yêu cầu danh sách tất cả mã giảm giá");
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @jakarta.validation.Valid @RequestBody com.beauty.ecommerce.product.adapter.in.web.request.CouponRequest request) {
        log.info("Admin tạo mã giảm giá mới: {}", request.getCode());
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo mã giảm giá thành công", couponService.createCoupon(request)));
    }

    @PutMapping("/admin/coupons/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.beauty.ecommerce.product.adapter.in.web.request.CouponRequest request) {
        log.info("Admin cập nhật mã giảm giá ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", couponService.updateCoupon(id, request)));
    }

    @DeleteMapping("/admin/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        log.info("Admin xóa mã giảm giá ID: {}", id);
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", null));
    }
}
