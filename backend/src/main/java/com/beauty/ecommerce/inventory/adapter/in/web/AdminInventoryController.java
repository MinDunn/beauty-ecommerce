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
                request.getReceivedAt()
        );
        return ResponseEntity.ok(receipt);
    }

    @PostMapping("/receipts/bulk")
    public ResponseEntity<Void> createBulkReceipts(@RequestBody List<InventoryReceiptRequest> requests) {
        inventoryService.addStockBulk(requests);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.GetMapping("/receipts")
    public ResponseEntity<List<InventoryService.InventoryReceiptResponse>> getAllReceipts() {
        return ResponseEntity.ok(inventoryService.getAllReceipts());
    }

    @Data
    public static class InventoryReceiptRequest {
        private Long productId;
        private BigDecimal costPrice;
        private Integer quantity;
        private LocalDateTime receivedAt;
    }
}
