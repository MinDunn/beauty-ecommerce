package com.beauty.ecommerce.review.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewJpaEntity, Long> {
    List<ReviewJpaEntity> findByProductId(Long productId);
}
