package com.beauty.ecommerce.inventory.adapter.in.web;

import com.beauty.ecommerce.inventory.adapter.out.persistence.InventoryReceiptJpaEntity;
import com.beauty.ecommerce.inventory.application.service.InventoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/receipts")
    public ResponseEntity<InventoryReceiptJpaEntity> createReceipt(@RequestBody InventoryReceiptRequest request) {
        InventoryReceiptJpaEntity receipt = inventoryService.addStock(
                request.getProductId(),
                request.getCostPrice(),
                request.getQuantity(),
                request.getReceivedAt(),
                request.getVariantName(),
                request.getExpiryDate()
        );
        return ResponseEntity.ok(receipt);
    }

    @PostMapping("/receipts/bulk")
    public ResponseEntity<Void> createBulkReceipts(@RequestBody List<InventoryReceiptRequest> requests) {
        inventoryService.addStockBulk(requests);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.GetMapping("/receipts")
    public ResponseEntity<com.beauty.ecommerce.common.dto.ApiResponse<List<InventoryService.InventoryReceiptResponse>>> getAllReceipts() {
        return ResponseEntity.ok(com.beauty.ecommerce.common.dto.ApiResponse.success(inventoryService.getAllReceipts()));
    }

    @PostMapping("/adjustments")
    public ResponseEntity<Void> createAdjustment(@RequestBody InventoryAdjustmentRequest request) {
        inventoryService.adjustStock(
                request.getProductId(),
                request.getQuantity(),
                request.getReason(),
                request.getCompensationAmount(),
                request.getVariantName(),
                request.getRemarks(),
                "ADMIN" // In real app, get from SecurityContext
        );
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.GetMapping("/unit-cost")
    public ResponseEntity<BigDecimal> getUnitCost(
            @org.springframework.web.bind.annotation.RequestParam Long productId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String variantName) {
        return ResponseEntity.ok(inventoryService.getUnitCost(productId, variantName));
    }

    @PostMapping("/audit")
    public ResponseEntity<Void> auditStock(@RequestBody InventoryAuditRequest request) {
        inventoryService.auditStock(
                request.getProductId(),
                request.getVariantName(),
                request.getPhysicalQuantity()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync-all")
    public ResponseEntity<Void> syncAll() {
        inventoryService.syncAllProducts();
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.GetMapping("/adjustments")
    public ResponseEntity<com.beauty.ecommerce.common.dto.ApiResponse<List<InventoryService.InventoryAdjustmentResponse>>> getAllAdjustments() {
        return ResponseEntity.ok(com.beauty.ecommerce.common.dto.ApiResponse.success(inventoryService.getAllAdjustments()));
    }

    @Data
    public static class InventoryAdjustmentRequest {
        private Long productId;
        private Integer quantity;
        private String reason;
        private java.math.BigDecimal compensationAmount;
        private String variantName;
        private String remarks;
    }

    @Data
    public static class InventoryAuditRequest {
        private Long productId;
        private String variantName;
        private Integer physicalQuantity;
    }

    @Data
    public static class InventoryReceiptRequest {
        private Long productId;
        private BigDecimal costPrice;
        private Integer quantity;
        private String variantName;
        private java.time.LocalDate expiryDate;
        private LocalDateTime receivedAt;
    }
}
