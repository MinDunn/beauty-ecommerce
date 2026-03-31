package com.beauty.ecommerce.review.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewJpaEntity, Long> {
    List<ReviewJpaEntity> findByProductId(Long productId);

    @Query("SELECT AVG(r.ratingStar) FROM ReviewJpaEntity r WHERE r.productId = :productId")
    Double findAverageRatingByProductId(Long productId);

    @Query("SELECT r.productId, AVG(r.ratingStar) FROM ReviewJpaEntity r WHERE r.productId IN :productIds GROUP BY r.productId")
    List<Object[]> findAverageRatingsByProductIds(List<Long> productIds);
}
