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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryReceiptRepository receiptRepository;
    private final ProductRepository productRepository;

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity) {
        return addStock(productId, costPrice, quantity, null);
    }

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity, LocalDateTime receivedAt) {
        // 1. Load product
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // 2. Create and save receipt
        InventoryReceiptJpaEntity receipt = InventoryReceiptJpaEntity.builder()
                .productId(productId)
                .costPrice(costPrice)
                .quantity(quantity)
                .receivedAt(receivedAt != null ? receivedAt : LocalDateTime.now())
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
            addStock(request.getProductId(), request.getCostPrice(), request.getQuantity(), request.getReceivedAt());
        }
    }

    public List<InventoryReceiptResponse> getAllReceipts() {
        List<InventoryReceiptJpaEntity> receipts = receiptRepository.findAllByOrderByReceivedAtDesc();
        Map<Long, String> productNameById = productRepository.findAllById(
                        receipts.stream().map(InventoryReceiptJpaEntity::getProductId).collect(Collectors.toSet())
                )
                .stream()
                .collect(Collectors.toMap(ProductJpaEntity::getId, ProductJpaEntity::getName));

        return receipts.stream()
                .map(receipt -> new InventoryReceiptResponse(
                        receipt.getId(),
                        receipt.getProductId(),
                        productNameById.getOrDefault(receipt.getProductId(), "Sản phẩm không xác định"),
                        receipt.getCostPrice(),
                        receipt.getQuantity(),
                        receipt.getReceivedAt()
                ))
                .toList();
    }

    public record InventoryReceiptResponse(
            Long id,
            Long productId,
            String productName,
            BigDecimal costPrice,
            Integer quantity,
            LocalDateTime receivedAt
    ) {
    }
}
