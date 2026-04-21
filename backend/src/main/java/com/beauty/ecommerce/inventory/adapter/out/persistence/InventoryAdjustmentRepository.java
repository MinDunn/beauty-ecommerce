package com.beauty.ecommerce.inventory.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustmentJpaEntity, Long> {
    List<InventoryAdjustmentJpaEntity> findAllByOrderByCreatedAtDesc();
    List<InventoryAdjustmentJpaEntity> findByProductIdOrderByCreatedAtDesc(Long productId);
}
