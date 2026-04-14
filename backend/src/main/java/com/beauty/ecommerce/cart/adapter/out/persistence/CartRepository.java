package com.beauty.ecommerce.cart.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartItemJpaEntity, Long> {
    List<CartItemJpaEntity> findByUserEmail(String email);
    Optional<CartItemJpaEntity> findByUserEmailAndProductIdAndVariantName(String email, Long productId, String variantName);
    void deleteByUserEmail(String email);
}
