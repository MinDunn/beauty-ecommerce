package com.beauty.ecommerce.product.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariantJpaEntity, Long> {
    Optional<ProductVariantJpaEntity> findByProductIdAndVariantName(Long productId, String variantName);
    java.util.List<ProductVariantJpaEntity> findByProductId(Long productId);
}
