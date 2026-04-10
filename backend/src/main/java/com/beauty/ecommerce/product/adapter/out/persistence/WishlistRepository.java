package com.beauty.ecommerce.product.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistJpaEntity, Long> {
    List<WishlistJpaEntity> findByUserId(Long userId);
    Optional<WishlistJpaEntity> findByUserIdAndProductId(Long userId, Long productId);
    long countByUserId(Long userId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
}
