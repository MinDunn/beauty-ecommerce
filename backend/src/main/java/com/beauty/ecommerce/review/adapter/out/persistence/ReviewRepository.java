package com.beauty.ecommerce.review.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewJpaEntity, Long> {
    List<ReviewJpaEntity> findByProductId(Long productId);

    @Query("SELECT AVG(r.ratingStar) FROM ReviewJpaEntity r WHERE r.productId = :productId")
    Double findAverageRatingByProductId(Long productId);

    @Query("SELECT r.productId, AVG(r.ratingStar) FROM ReviewJpaEntity r WHERE r.productId IN :productIds GROUP BY r.productId")
    List<Object[]> findAverageRatingsByProductIds(java.util.List<Long> productIds);

    @Query("SELECT r.productId, AVG(r.ratingStar), COUNT(r.id) FROM ReviewJpaEntity r WHERE r.productId IN :productIds GROUP BY r.productId")
    List<Object[]> findRatingStatsByProductIds(java.util.List<Long> productIds);

    @Query("SELECT r.productId, COUNT(r.id) as reviewCount FROM ReviewJpaEntity r " +
           "WHERE r.ratingStar = 5 AND r.createdAt >= :startDate " +
           "GROUP BY r.productId " +
           "ORDER BY reviewCount DESC")
    List<Object[]> findTopRatedProducts(java.time.LocalDateTime startDate, org.springframework.data.domain.Pageable pageable);
}
