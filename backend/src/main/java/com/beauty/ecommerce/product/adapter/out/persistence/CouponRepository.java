package com.beauty.ecommerce.product.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<CouponJpaEntity, Long> {
    Optional<CouponJpaEntity> findByCode(String code);

    // Tìm tất cả các mã đang hoạt động và chưa hết hạn
    @Query("SELECT c FROM ProductCoupon c WHERE c.isActive = true AND (c.expiryDate IS NULL OR c.expiryDate > :now) AND (c.usageCount IS NULL OR c.usageLimit IS NULL OR c.usageCount < c.usageLimit) AND (c.startDate IS NULL OR c.startDate <= :now) ORDER BY c.createdAt DESC")
    List<CouponJpaEntity> findAllActive(@Param("now") LocalDateTime now);

    // Tìm mã sắp mở (startDate > now)
    @Query("SELECT c FROM ProductCoupon c WHERE c.isActive = true AND c.startDate IS NOT NULL AND c.startDate > :now ORDER BY c.startDate ASC")
    List<CouponJpaEntity> findComingSoon(@Param("now") LocalDateTime now);

    // Tìm mã sắp hết hạn (trong vòng 24h tới)
    @Query("SELECT c FROM ProductCoupon c WHERE c.isActive = true AND c.expiryDate > :now AND c.expiryDate <= :deadline AND (c.usageCount IS NULL OR c.usageLimit IS NULL OR c.usageCount < c.usageLimit) ORDER BY c.expiryDate ASC")
    List<CouponJpaEntity> findExpiringSoon(@Param("now") LocalDateTime now, @Param("deadline") LocalDateTime deadline);
}
