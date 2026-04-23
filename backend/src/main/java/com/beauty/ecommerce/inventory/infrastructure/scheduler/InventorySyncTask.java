package com.beauty.ecommerce.inventory.infrastructure.scheduler;

import com.beauty.ecommerce.inventory.application.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventorySyncTask {

    private final InventoryService inventoryService;

    // Run every 15 minutes
    @Scheduled(cron = "0 0/15 * * * *")
    public void runInventorySync() {
        log.info("Starting scheduled inventory sync and auto-healing check...");
        try {
            inventoryService.syncAllProducts();
            log.info("Scheduled inventory sync completed successfully.");
        } catch (Exception e) {
            log.error("Error during scheduled inventory sync: {}", e.getMessage(), e);
        }
    }
}
