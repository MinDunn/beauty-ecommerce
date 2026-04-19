package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.product.application.service.CouponService;
import com.beauty.ecommerce.product.adapter.out.persistence.CouponJpaEntity;
import com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse;
import com.beauty.ecommerce.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CouponController {

    private final CouponService couponService;
    private final com.beauty.ecommerce.user.adapter.out.persistence.UserRepository userRepository;

    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<Map<String, List<CouponResponse>>>> getPublicVouchers() {
        log.info("Khách hàng yêu cầu danh sách mã giảm giá công khai");
        return ResponseEntity.ok(ApiResponse.success(couponService.getPublicVouchers()));
    }

    @GetMapping("/coupons/validate")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> validateCoupon(
            @RequestParam String code,
            @RequestParam Double orderValue,
            @RequestParam(required = false) Integer totalQuantity,
            @RequestParam(required = false) java.util.List<Long> categoryIds,
            org.springframework.security.core.Authentication authentication) {
        
        Long userId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            userId = userRepository.findByEmail(authentication.getName())
                    .map(com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity::getId)
                    .orElse(null);
        }

        log.info("Yêu cầu xác thực mã: {} | Giá trị: {} | SL: {} | UserID: {}", code, orderValue, totalQuantity, userId);
        
        // Mặc định số lượng là 1 nếu không truyền (để tránh lỗi chia cho 0 hoặc logic sai)
        int itemCount = (totalQuantity != null) ? totalQuantity : 1;
        CouponJpaEntity coupon = couponService.validateCoupon(code, orderValue, categoryIds, itemCount, userId);
        
        // Tính toán giá trị giảm thực tế (bao gồm giới hạn Max Discount)
        java.math.BigDecimal discountAmount;
        if ("PERCENTAGE".equals(coupon.getDiscountType())) {
            discountAmount = java.math.BigDecimal.valueOf(orderValue)
                    .multiply(coupon.getDiscountValue())
                    .divide(java.math.BigDecimal.valueOf(100));
            
            if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discountAmount = coupon.getMaxDiscountAmount();
            }
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("code", coupon.getCode());
        data.put("discountType", coupon.getDiscountType());
        data.put("discountValue", coupon.getDiscountValue());
        data.put("discountAmount", discountAmount);
        data.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
        data.put("description", coupon.getDescription());
                
        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã giảm giá thành công", data));
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
