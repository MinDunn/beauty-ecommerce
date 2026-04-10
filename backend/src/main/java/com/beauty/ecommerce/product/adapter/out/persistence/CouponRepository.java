package com.beauty.ecommerce.product.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<CouponJpaEntity, Long> {
    Optional<CouponJpaEntity> findByCode(String code);
}
