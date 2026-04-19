package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.adapter.out.persistence.CouponJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.CouponRepository;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponJpaEntity validateCoupon(String code, Double orderValue, java.util.List<Long> categoryIds) {
        log.info("Xác thực mã giảm giá: {} cho đơn hàng: {}. Danh sách danh mục: {}", code, orderValue, categoryIds);
        CouponJpaEntity coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

        if (!coupon.getIsActive()) {
            throw new BadRequestException("Mã giảm giá đã bị ngưng sử dụng");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (coupon.getMinOrderAmount() != null && BigDecimal.valueOf(orderValue).compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này");
        }

        // Kiểm tra danh mục nếu mã có giới hạn
        if (coupon.getCategoryId() != null) {
            if (categoryIds == null || !categoryIds.contains(coupon.getCategoryId())) {
                throw new BadRequestException("Mã giảm giá này không áp dụng cho các sản phẩm trong giỏ hàng của bạn");
            }
        }

        return coupon;
    }

    @Transactional
    public void useCoupon(String code) {
        CouponJpaEntity coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
        
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            coupon.setIsActive(false);
        }
        couponRepository.save(coupon);
    }

    // Admin Methods
    public java.util.List<com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse createCoupon(com.beauty.ecommerce.product.adapter.in.web.request.CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Mã giảm giá này đã tồn tại");
        }
        
        CouponJpaEntity coupon = CouponJpaEntity.builder()
                .code(request.getCode().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 100)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .categoryId(request.getCategoryId())
                .build();
        
        return mapToResponse(couponRepository.save(coupon));
    }

    public com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse updateCoupon(Long id, com.beauty.ecommerce.product.adapter.in.web.request.CouponRequest request) {
        CouponJpaEntity coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
        
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setIsActive(request.getIsActive());
        coupon.setCategoryId(request.getCategoryId());
        
        return mapToResponse(couponRepository.save(coupon));
    }

    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mã giảm giá không tồn tại");
        }
        couponRepository.deleteById(id);
    }

    private com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse mapToResponse(CouponJpaEntity coupon) {
        return com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountValue(coupon.getDiscountValue())
                .discountType(coupon.getDiscountType())
                .minOrderAmount(coupon.getMinOrderAmount())
                .expiryDate(coupon.getExpiryDate())
                .isActive(coupon.getIsActive())
                .usageLimit(coupon.getUsageLimit())
                .usageCount(coupon.getUsageCount())
                .categoryId(coupon.getCategoryId())
                .build();
    }
}
