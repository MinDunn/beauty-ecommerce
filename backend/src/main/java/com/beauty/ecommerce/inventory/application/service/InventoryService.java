package com.beauty.ecommerce.inventory.application.service;

import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentJpaEntity;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentRepository;
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
    private final com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantRepository variantRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity) {
        return addStock(productId, costPrice, quantity, null, null);
    }

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity, LocalDateTime receivedAt, String variantName) {
        // 1. Load product
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // 2. Create and save receipt
        InventoryReceiptJpaEntity receipt = InventoryReceiptJpaEntity.builder()
                .productId(productId)
                .costPrice(costPrice)
                .quantity(quantity)
                .variantName(variantName)
                .receivedAt(receivedAt != null ? receivedAt : LocalDateTime.now())
                .build();
        
        InventoryReceiptJpaEntity savedReceipt = receiptRepository.save(receipt);

        // 3. Update product stock (always update total stock)
        product.setStockQuantity((product.getStockQuantity() != null ? product.getStockQuantity() : 0) + quantity);
        productRepository.save(product);

        // 4. Update variant stock if provided
        if (variantName != null && !variantName.trim().isEmpty()) {
            com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity variant = variantRepository.findByProductIdAndVariantName(productId, variantName)
                    .orElseThrow(() -> new RuntimeException("Biến thể '" + variantName + "' không tồn tại cho sản phẩm này."));
            
            variant.setStockQuantity((variant.getStockQuantity() != null ? variant.getStockQuantity() : 0) + quantity);
            variantRepository.save(variant);
        }

        return savedReceipt;
    }

    @Transactional
    public void addStockBulk(java.util.List<com.beauty.ecommerce.inventory.adapter.in.web.AdminInventoryController.InventoryReceiptRequest> requests) {
        for (com.beauty.ecommerce.inventory.adapter.in.web.AdminInventoryController.InventoryReceiptRequest request : requests) {
            addStock(request.getProductId(), request.getCostPrice(), request.getQuantity(), request.getReceivedAt(), request.getVariantName());
        }
    }

    @Transactional
    public InventoryAdjustmentJpaEntity adjustStock(Long productId, Integer quantity, String reason, java.math.BigDecimal compensation, String variantName, String createdBy) {
        // 1. Load product
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // 2. Calculate estimated loss if quantity < 0 (decreasing stock)
        BigDecimal estimatedLoss = BigDecimal.ZERO;
        if (quantity < 0) {
            java.util.Optional<InventoryReceiptJpaEntity> latestReceipt = java.util.Optional.empty();
            
            // Try specific variant first if provided
            if (variantName != null && !variantName.trim().isEmpty()) {
                latestReceipt = receiptRepository.findFirstByProductIdAndVariantNameOrderByReceivedAtDesc(productId, variantName);
            }
            
            // Fallback to latest receipt of this product regardless of variant if not found yet
            if (latestReceipt.isEmpty()) {
                latestReceipt = receiptRepository.findFirstByProductIdOrderByReceivedAtDesc(productId);
            }
            
            if (latestReceipt.isPresent()) {
                BigDecimal costPrice = latestReceipt.get().getCostPrice();
                estimatedLoss = costPrice.multiply(BigDecimal.valueOf(Math.abs(quantity)));
            }
        }

        // 3. Create and save adjustment log
        InventoryAdjustmentJpaEntity adjustment = InventoryAdjustmentJpaEntity.builder()
                .productId(productId)
                .variantName(variantName)
                .quantity(quantity)
                .reason(reason)
                .compensationAmount(compensation)
                .estimatedLossAmount(estimatedLoss)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .build();
        
        InventoryAdjustmentJpaEntity savedAdjustment = adjustmentRepository.save(adjustment);

        // 4. Update product stock
        product.setStockQuantity((product.getStockQuantity() != null ? product.getStockQuantity() : 0) + quantity);
        productRepository.save(product);

        // 5. Update variant stock if provided
        if (variantName != null && !variantName.trim().isEmpty()) {
            com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity variant = variantRepository.findByProductIdAndVariantName(productId, variantName)
                    .orElseThrow(() -> new RuntimeException("Biến thể '" + variantName + "' không tồn tại cho sản phẩm này."));
            
            variant.setStockQuantity((variant.getStockQuantity() != null ? variant.getStockQuantity() : 0) + quantity);
            variantRepository.save(variant);
        }

        return savedAdjustment;
    }

    public List<InventoryAdjustmentResponse> getAllAdjustments() {
        List<InventoryAdjustmentJpaEntity> adjustments = adjustmentRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, String> productNameById = productRepository.findAllById(
                        adjustments.stream().map(InventoryAdjustmentJpaEntity::getProductId).collect(Collectors.toSet())
                )
                .stream()
                .collect(Collectors.toMap(ProductJpaEntity::getId, ProductJpaEntity::getName));

        return adjustments.stream()
                .map(adj -> new InventoryAdjustmentResponse(
                        adj.getId(),
                        adj.getProductId(),
                        productNameById.getOrDefault(adj.getProductId(), "Sản phẩm không xác định"),
                        adj.getQuantity(),
                        adj.getReason(),
                        adj.getCompensationAmount(),
                        adj.getEstimatedLossAmount(),
                        adj.getVariantName(),
                        adj.getCreatedAt(),
                        adj.getCreatedBy()
                ))
                .toList();
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
                        receipt.getVariantName(),
                        receipt.getReceivedAt()
                ))
                .toList();
    }

    public record InventoryAdjustmentResponse(
            Long id,
            Long productId,
            String productName,
            Integer quantity,
            String reason,
            java.math.BigDecimal compensationAmount,
            java.math.BigDecimal estimatedLossAmount,
            String variantName,
            LocalDateTime adjustedAt,
            String createdBy
    ) {}

    public record InventoryReceiptResponse(
            Long id,
            Long productId,
            String productName,
            BigDecimal costPrice,
            Integer quantity,
            String variantName,
            LocalDateTime receivedAt
    ) {
    }
}
