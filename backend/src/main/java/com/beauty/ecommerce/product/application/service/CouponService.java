package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.adapter.out.persistence.CouponJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.CouponRepository;
import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponJpaEntity validateCoupon(String code, Double orderValue) {
        log.info("Xác thực mã giảm giá: {} cho đơn hàng: {}", code, orderValue);
        CouponJpaEntity coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

        if (!coupon.getActive()) {
            throw new BadRequestException("Mã giảm giá đã bị ngưng sử dụng");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (coupon.getMinOrderValue() != null && orderValue < coupon.getMinOrderValue()) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này");
        }

        return coupon;
    }

    @Transactional
    public void useCoupon(String code) {
        CouponJpaEntity coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
        
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            coupon.setActive(false);
        }
        couponRepository.save(coupon);
    }
}
