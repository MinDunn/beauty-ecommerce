package com.beauty.ecommerce.inventory.application.service;

import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryReceiptJpaEntity;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryReceiptRepository;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryReceiptRepository receiptRepository;
    private final ProductRepository productRepository;

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity) {
        // 1. Load product
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // 2. Create and save receipt
        InventoryReceiptJpaEntity receipt = InventoryReceiptJpaEntity.builder()
                .productId(productId)
                .costPrice(costPrice)
                .quantity(quantity)
                .receivedAt(LocalDateTime.now())
                .build();
        
        InventoryReceiptJpaEntity savedReceipt = receiptRepository.save(receipt);

        // 3. Update product stock
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        return savedReceipt;
    }

    @Transactional
    public void addStockBulk(java.util.List<com.beauty.ecommerce.inventory.adapter.in.web.AdminInventoryController.InventoryReceiptRequest> requests) {
        for (com.beauty.ecommerce.inventory.adapter.in.web.AdminInventoryController.InventoryReceiptRequest request : requests) {
            addStock(request.getProductId(), request.getCostPrice(), request.getQuantity());
        }
    }
}
