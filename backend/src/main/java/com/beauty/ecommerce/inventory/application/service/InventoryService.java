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
import com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantRepository;
import com.beauty.ecommerce.order.adapter.out.persistence.OrderItemRepository;
import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryAdjustmentJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryReceiptRepository receiptRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity) {
        return addStock(productId, costPrice, quantity, null, null, null);
    }

    @Transactional
    public InventoryReceiptJpaEntity addStock(Long productId, BigDecimal costPrice, Integer quantity, LocalDateTime receivedAt, String variantName, java.time.LocalDate expiryDate) {
        // 1. Load product
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // 2. Create and save receipt
        InventoryReceiptJpaEntity receipt = InventoryReceiptJpaEntity.builder()
                .productId(productId)
                .costPrice(costPrice)
                .quantity(quantity)
                .variantName(variantName)
                .expiryDate(expiryDate)
                .receivedAt(receivedAt != null ? receivedAt : LocalDateTime.now())
                .build();
        
        InventoryReceiptJpaEntity savedReceipt = receiptRepository.save(receipt);

        // 3. Update variant stock if provided
        if (variantName != null && !variantName.trim().isEmpty()) {
            com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity variant = variantRepository.findByProductIdAndVariantName(productId, variantName)
                    .orElseThrow(() -> new RuntimeException("Biến thể '" + variantName + "' không tồn tại cho sản phẩm này."));
            
            variant.setStockQuantity((variant.getStockQuantity() != null ? variant.getStockQuantity() : 0) + quantity);
            variantRepository.save(variant);
            
            // Auto-heal/Sync: Recalculate total product stock from variants
            syncProductStock(productId);
        } else {
            // Update product stock directly if no variant
            product.setStockQuantity((product.getStockQuantity() != null ? product.getStockQuantity() : 0) + quantity);
            productRepository.save(product);
        }

        // 4. Sync Product Expiry Date (FEFO)
        syncProductExpiryDate(productId);

        return savedReceipt;
    }

    @Transactional
    public void addStockBulk(java.util.List<com.beauty.ecommerce.inventory.adapter.in.web.AdminInventoryController.InventoryReceiptRequest> requests) {
        for (com.beauty.ecommerce.inventory.adapter.in.web.AdminInventoryController.InventoryReceiptRequest request : requests) {
            addStock(request.getProductId(), request.getCostPrice(), request.getQuantity(), request.getReceivedAt(), request.getVariantName(), request.getExpiryDate());
        }
    }

    @Transactional
    public void adjustStock(Long productId, Integer quantity, String reason, BigDecimal compensationAmount, String variantName, String remarks, String createdBy) {
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + productId));

        // 2. Calculate estimated loss if quantity < 0 (decreasing stock)
        BigDecimal estimatedLoss = calculateEstimatedLoss(productId, variantName, quantity);

        // 3. Create and save adjustment log
        InventoryAdjustmentJpaEntity adjustment = InventoryAdjustmentJpaEntity.builder()
                .productId(productId)
                .variantName(variantName)
                .quantity(quantity)
                .reason(reason)
                .compensationAmount(compensationAmount)
                .estimatedLossAmount(estimatedLoss)
                .remarks(remarks)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .build();
        
        adjustmentRepository.save(adjustment);

        // 4. Update variant stock if provided
        if (variantName != null && !variantName.trim().isEmpty()) {
            com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity variant = variantRepository.findByProductIdAndVariantName(productId, variantName)
                    .orElseThrow(() -> new RuntimeException("Biến thể '" + variantName + "' không tồn tại cho sản phẩm này."));
            
            variant.setStockQuantity((variant.getStockQuantity() != null ? variant.getStockQuantity() : 0) + quantity);
            variantRepository.save(variant);
            
            // Auto-heal/Sync
            syncProductStock(productId);
        } else {
            // Update product stock directly if no variant
            product.setStockQuantity((product.getStockQuantity() != null ? product.getStockQuantity() : 0) + quantity);
            productRepository.save(product);
        }

        // 5. Sync Product Expiry Date (FEFO)
        syncProductExpiryDate(productId);
    }

    @Transactional
    public void auditStock(Long productId, String variantName, Integer physicalQuantity) {
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        Integer currentStock = 0;
        if (variantName != null && !variantName.trim().isEmpty()) {
            com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity variant = variantRepository.findByProductIdAndVariantName(productId, variantName)
                    .orElseThrow(() -> new RuntimeException("Biến thể không tồn tại"));
            currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        } else {
            currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        }

        int delta = physicalQuantity - currentStock;
        if (delta != 0) {
            adjustStock(productId, delta, "Kiểm kê thực tế", BigDecimal.ZERO, variantName, null, "ADMIN");
        }
    }

    @Transactional
    public synchronized void syncProductStock(Long productId) {
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // 1. Sync Stock from History (Reconstruct source of truth)
        List<com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity> variants = variantRepository.findByProductId(productId);
        
        if (variants != null && !variants.isEmpty()) {
            for (com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity variant : variants) {
                int calculatedStock = calculateStockFromHistory(productId, variant.getVariantName());
                variant.setStockQuantity(calculatedStock);
                variantRepository.save(variant);
            }
            
            // Recalculate total from variants
            int totalStock = variants.stream()
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();
            product.setStockQuantity(totalStock);
        } else {
            int calculatedStock = calculateStockFromHistory(productId, null);
            product.setStockQuantity(calculatedStock);
        }

        // 2. Sync Sold Count from Orders
        Integer actualSold = productRepository.findActualSoldCount(productId);
        if (actualSold != null && !actualSold.equals(product.getSold())) {
            product.setSold(actualSold);
        }
        
        productRepository.save(product);
        syncProductExpiryDate(productId);
    }

    private int calculateStockFromHistory(Long productId, String variantName) {
        // Sum of all receipts for this product/variant
        long totalIn = receiptRepository.findAll().stream()
                .filter(r -> r.getProductId().equals(productId))
                .filter(r -> (variantName == null && (r.getVariantName() == null || r.getVariantName().isEmpty())) || 
                            (variantName != null && variantName.equalsIgnoreCase(r.getVariantName())))
                .mapToLong(r -> r.getQuantity() != null ? r.getQuantity() : 0)
                .sum();

        // Sum of all approved adjustments
        long totalAdj = adjustmentRepository.findAll().stream()
                .filter(a -> a.getProductId().equals(productId))
                .filter(a -> "APPROVED".equals(a.getStatus()))
                .filter(a -> (variantName == null && (a.getVariantName() == null || a.getVariantName().isEmpty())) || 
                            (variantName != null && variantName.equalsIgnoreCase(a.getVariantName())))
                .mapToLong(a -> a.getQuantity() != null ? a.getQuantity() : 0)
                .sum();

        // Sum of all sold items in confirmed orders
        long totalOut = orderItemRepository.findAll().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .filter(i -> (variantName == null && (i.getVariantName() == null || i.getVariantName().isEmpty())) || 
                            (variantName != null && variantName.equalsIgnoreCase(i.getVariantName())))
                .filter(i -> {
                    String s = i.getOrder().getStatus();
                    return "DELIVERED".equals(s) || "COMPLETED".equals(s) || "SHIPPED".equals(s) || "CONFIRMED".equals(s);
                })
                .mapToLong(i -> i.getQuantity() != null ? i.getQuantity() : 0)
                .sum();

        return (int) (totalIn + totalAdj - totalOut);
    }



    @Transactional
    public void approveAdjustment(Long adjustmentId, String adminName) {
        InventoryAdjustmentJpaEntity adj = adjustmentRepository.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu điều chỉnh không tồn tại"));

        if (!"PENDING".equals(adj.getStatus())) {
            throw new RuntimeException("Chỉ có thể phê duyệt yêu cầu ở trạng thái PENDING");
        }

        // Apply changes to stock
        ProductJpaEntity product = productRepository.findById(adj.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        int newStock = (product.getStockQuantity() != null ? product.getStockQuantity() : 0) + adj.getQuantity();
        product.setStockQuantity(newStock);
        productRepository.save(product);

        adj.setStatus("APPROVED");
        adj.setRemarks(adj.getRemarks() + " | Phê duyệt bởi " + adminName + " vào lúc " + LocalDateTime.now());
        adjustmentRepository.save(adj);
        
        syncProductExpiryDate(adj.getProductId());
    }

    @Transactional
    public void rejectAdjustment(Long adjustmentId, String adminName) {
        InventoryAdjustmentJpaEntity adj = adjustmentRepository.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu điều chỉnh không tồn tại"));

        if (!"PENDING".equals(adj.getStatus())) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu ở trạng thái PENDING");
        }

        adj.setStatus("REJECTED");
        adj.setRemarks(adj.getRemarks() + " | Từ chối bởi " + adminName + " vào lúc " + LocalDateTime.now());
        adjustmentRepository.save(adj);
    }

    public List<InventoryAdjustmentResponse> getPendingAdjustments() {
        List<InventoryAdjustmentJpaEntity> pending = adjustmentRepository.findAll().stream()
                .filter(a -> "PENDING".equals(a.getStatus()))
                .collect(Collectors.toList());
        
        if (pending.isEmpty()) return List.of();

        Map<Long, String> productNameById = productRepository.findAllById(
                        pending.stream().map(InventoryAdjustmentJpaEntity::getProductId).collect(Collectors.toSet())
                )
                .stream()
                .collect(Collectors.toMap(ProductJpaEntity::getId, ProductJpaEntity::getName));

        return pending.stream()
                .map(adj -> new InventoryAdjustmentResponse(
                        adj.getId(),
                        adj.getProductId(),
                        productNameById.getOrDefault(adj.getProductId(), "Sản phẩm không xác định"),
                        adj.getQuantity(),
                        adj.getReason(),
                        adj.getCompensationAmount(),
                        adj.getEstimatedLossAmount(),
                        adj.getVariantName(),
                        adj.getRemarks(),
                        adj.getCreatedAt(),
                        adj.getCreatedBy()
                ))
                .toList();
    }

    @Transactional
    public void syncProductExpiryDate(Long productId) {
        ProductJpaEntity product = productRepository.findById(productId).orElse(null);
        if (product == null) return;

        // FEFO Logic
        List<InventoryReceiptJpaEntity> allReceipts = receiptRepository.findByProductIdOrderByExpiryDateAscReceivedAtAsc(productId);
        
        long totalIn = allReceipts.stream().mapToLong(r -> r.getQuantity() != null ? r.getQuantity() : 0).sum();
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        
        if (currentStock <= 0) {
            product.setExpiryDate(null);
            productRepository.save(product);
            return;
        }

        long soldCount = totalIn - currentStock;
        long runningSum = 0;
        java.time.LocalDate currentExpiryDate = null;
        
        for (InventoryReceiptJpaEntity receipt : allReceipts) {
            runningSum += (receipt.getQuantity() != null ? receipt.getQuantity() : 0);
            if (runningSum > soldCount) {
                currentExpiryDate = receipt.getExpiryDate();
                break;
            }
        }
        
        if (currentExpiryDate != null && !currentExpiryDate.equals(product.getExpiryDate())) {
            product.setExpiryDate(currentExpiryDate);
            productRepository.save(product);
        }
    }

    @Transactional
    public void syncAllProducts() {
        List<ProductJpaEntity> products = productRepository.findAll();
        for (ProductJpaEntity product : products) {
            syncProductStock(product.getId());
        }
    }

    public BigDecimal getUnitCost(Long productId, String variantName) {
        java.util.Optional<InventoryReceiptJpaEntity> latestReceipt = java.util.Optional.empty();
        
        if (variantName != null && !variantName.trim().isEmpty()) {
            latestReceipt = receiptRepository.findFirstByProductIdAndVariantNameOrderByReceivedAtDesc(productId, variantName);
        }
        
        if (latestReceipt.isEmpty()) {
            latestReceipt = receiptRepository.findFirstByProductIdOrderByReceivedAtDesc(productId);
        }
        
        if (latestReceipt.isPresent()) {
            return latestReceipt.get().getCostPrice();
        }
        
        return productRepository.findById(productId)
                .map(p -> {
                    // Fallback to 70% of current price as estimated cost if no receipts found
                    if (p.getCurrentPrice() != null) {
                        return p.getCurrentPrice().multiply(new java.math.BigDecimal("0.7"));
                    }
                    return p.getOriginalPrice() != null ? p.getOriginalPrice() : java.math.BigDecimal.ZERO;
                })
                .orElse(java.math.BigDecimal.ZERO);
    }

    private BigDecimal calculateEstimatedLoss(Long productId, String variantName, Integer quantity) {
        if (quantity == 0) return BigDecimal.ZERO;
        BigDecimal unitCost = getUnitCost(productId, variantName);
        BigDecimal totalValue = unitCost.multiply(BigDecimal.valueOf(Math.abs(quantity)));
        return quantity > 0 ? totalValue.negate() : totalValue;
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
                        adj.getRemarks(),
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
                        receipt.getExpiryDate(),
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
            String remarks,
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
            java.time.LocalDate expiryDate,
            LocalDateTime receivedAt
    ) {
    }
    @Transactional
    public void deleteAdjustments(List<Long> ids) {
        adjustmentRepository.deleteAllById(ids);
    }

    @Transactional
    public void deleteAllAdjustments() {
        adjustmentRepository.deleteAll();
    }
}
