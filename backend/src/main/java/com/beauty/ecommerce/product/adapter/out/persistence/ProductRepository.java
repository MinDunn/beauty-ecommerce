package com.beauty.ecommerce.product.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderItemJpaEntity;

@Repository
public interface ProductRepository extends JpaRepository<ProductJpaEntity, Long>, JpaSpecificationExecutor<ProductJpaEntity> {
    List<ProductJpaEntity> findTop10ByStatusOrderByViewCountDesc(String status);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM OrderItemJpaEntity i JOIN i.order o WHERE i.product.id = :productId AND (o.status = 'DELIVERED' OR o.status = 'COMPLETED')")
    Integer findActualSoldCount(@Param("productId") Long productId);
}
