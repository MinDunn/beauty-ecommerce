package com.beauty.ecommerce.inventory.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceiptJpaEntity, Long> {
    List<InventoryReceiptJpaEntity> findAllByOrderByReceivedAtDesc();
    
    java.util.Optional<InventoryReceiptJpaEntity> findFirstByProductIdOrderByReceivedAtDesc(Long productId);
    
    java.util.Optional<InventoryReceiptJpaEntity> findFirstByProductIdAndVariantNameOrderByReceivedAtDesc(Long productId, String variantName);

    List<InventoryReceiptJpaEntity> findByProductIdOrderByExpiryDateAscReceivedAtAsc(Long productId);
}
