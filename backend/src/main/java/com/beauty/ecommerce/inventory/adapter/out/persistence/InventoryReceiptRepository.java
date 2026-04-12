package com.beauty.ecommerce.inventory.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceiptJpaEntity, Long> {
}
