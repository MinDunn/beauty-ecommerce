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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final com.beauty.ecommerce.order.adapter.out.persistence.OrderRepository orderRepository;
    private final com.beauty.ecommerce.common.application.service.ActivityLogService activityLogService;

    public CouponJpaEntity validateCoupon(String code, Double orderValue, java.util.List<Long> categoryIds, Integer totalItemCount, Long userId) {
        log.info("Xác thực mã giảm giá: {} cho đơn hàng: {}. Số lượng: {}. UserID: {}", code, orderValue, totalItemCount, userId);
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
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " + coupon.getMinOrderAmount().longValue() + "đ để áp dụng mã này");
        }

        // Kiểm tra số lượng sản phẩm tối thiểu
        if (coupon.getMinQuantity() != null && totalItemCount < coupon.getMinQuantity()) {
            throw new BadRequestException("Bạn cần mua ít nhất " + coupon.getMinQuantity() + " sản phẩm để sử dụng mã này");
        }

        // Kiểm tra danh mục nếu mã có giới hạn
        if (coupon.getCategoryId() != null) {
            if (categoryIds == null || !categoryIds.contains(coupon.getCategoryId())) {
                throw new BadRequestException("Mã giảm giá này không áp dụng cho các sản phẩm trong giỏ hàng của bạn");
            }
        }

        // Kiểm tra điều kiện khách hàng mới
        if (Boolean.TRUE.equals(coupon.getIsNewUserOnly())) {
            if (userId == null) {
                throw new BadRequestException("Vui lòng đăng nhập để sử dụng mã dành cho khách hàng mới");
            }
            long orderCount = orderRepository.countByUser_Id(userId);
            if (orderCount > 0) {
                throw new BadRequestException("Mã giảm giá này chỉ dành cho đơn hàng đầu tiên của bạn");
            }
        }

        // Kiểm tra điều kiện chi tiêu tối thiểu trong quá khứ
        if (coupon.getMinSpentAmount() != null && coupon.getMinSpentAmount().compareTo(BigDecimal.ZERO) > 0) {
            if (userId == null) {
                throw new BadRequestException("Vui lòng đăng nhập để kiểm tra điều kiện chi tiêu tích lũy");
            }
            BigDecimal totalSpent = orderRepository.sumTotalSpentByUserId(userId);
            if (totalSpent == null) totalSpent = BigDecimal.ZERO;
            if (totalSpent.compareTo(coupon.getMinSpentAmount()) < 0) {
                throw new BadRequestException("Bạn cần tích lũy chi tiêu ít nhất " + coupon.getMinSpentAmount().longValue() + "đ để sử dụng mã này. Hiện tại bạn mới đạt " + totalSpent.longValue() + "đ");
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
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDateTime.now())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 100)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .categoryId(request.getCategoryId())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 0)
                .isNewUserOnly(request.getIsNewUserOnly() != null ? request.getIsNewUserOnly() : false)
                .minSpentAmount(request.getMinSpentAmount())
                .description(request.getDescription())
                .build();
        
        CouponJpaEntity savedCoupon = couponRepository.save(coupon);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "CREATE_COUPON", "Tạo mới mã giảm giá: " + savedCoupon.getCode());
        return mapToResponse(savedCoupon);
    }

    public com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse updateCoupon(Long id, com.beauty.ecommerce.product.adapter.in.web.request.CouponRequest request) {
        CouponJpaEntity coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));
        
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        if (request.getStartDate() != null) {
            coupon.setStartDate(request.getStartDate());
        }
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setIsActive(request.getIsActive());
        coupon.setCategoryId(request.getCategoryId());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMinQuantity(request.getMinQuantity());
        coupon.setIsNewUserOnly(request.getIsNewUserOnly());
        coupon.setMinSpentAmount(request.getMinSpentAmount());
        coupon.setDescription(request.getDescription());
        
        CouponJpaEntity updatedCoupon = couponRepository.save(coupon);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "UPDATE_COUPON", "Cập nhật mã giảm giá: " + updatedCoupon.getCode());
        return mapToResponse(updatedCoupon);
    }

    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mã giảm giá không tồn tại");
        }
        couponRepository.deleteById(id);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "DELETE_COUPON", "Xóa mã giảm giá ID: " + id);
    }

    private com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse mapToResponse(CouponJpaEntity coupon) {
        return com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountValue(coupon.getDiscountValue())
                .discountType(coupon.getDiscountType())
                .minOrderAmount(coupon.getMinOrderAmount())
                .expiryDate(coupon.getExpiryDate())
                .startDate(coupon.getStartDate())
                .isActive(coupon.getIsActive())
                .usageLimit(coupon.getUsageLimit())
                .usageCount(coupon.getUsageCount())
                .categoryId(coupon.getCategoryId())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minQuantity(coupon.getMinQuantity())
                .isNewUserOnly(coupon.getIsNewUserOnly())
                .minSpentAmount(coupon.getMinSpentAmount())
                .description(coupon.getDescription())
                .build();
    }

    // Public Methods for Voucher Center
    public Map<String, List<com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse>> getPublicVouchers() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = now.plusHours(24);

        Map<String, List<com.beauty.ecommerce.product.adapter.in.web.response.CouponResponse>> vouchers = new HashMap<>();
        
        vouchers.put("all", couponRepository.findAllActive(now).stream().map(this::mapToResponse).collect(Collectors.toList()));
        vouchers.put("percentage", couponRepository.findAllActive(now).stream().filter(c -> "PERCENTAGE".equals(c.getDiscountType())).map(this::mapToResponse).collect(Collectors.toList()));
        vouchers.put("fixed", couponRepository.findAllActive(now).stream().filter(c -> "FIXED".equals(c.getDiscountType())).map(this::mapToResponse).collect(Collectors.toList()));
        vouchers.put("comingSoon", couponRepository.findComingSoon(now).stream().map(this::mapToResponse).collect(Collectors.toList()));
        vouchers.put("expiringSoon", couponRepository.findExpiringSoon(now, deadline).stream().map(this::mapToResponse).collect(Collectors.toList()));

        return vouchers;
    }
}
