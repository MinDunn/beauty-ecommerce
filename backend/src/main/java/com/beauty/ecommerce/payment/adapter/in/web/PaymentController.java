package com.beauty.ecommerce.payment.adapter.in.web;

import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.PaymentStatus;
import com.beauty.ecommerce.payment.application.service.MoMoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final MoMoService moMoService;
    private final OrderUseCase orderUseCase;

    @PostMapping("/create-momo")
    public ResponseEntity<Map<String, String>> createMomoPayment(@RequestBody Map<String, Long> request) {
        Long orderId = request.get("orderId");
        Order order = orderUseCase.lookupOrder(orderId);
        
        String payUrl = moMoService.createPaymentUrl(
            order.getId(), 
            order.getTotalPrice().longValue(), 
            "Thanh toan don hang #" + order.getId()
        );
        
        return ResponseEntity.ok(Map.of("payUrl", payUrl));
    }

    @PostMapping("/momo-ipn")
    public ResponseEntity<Void> receiveMomoIpn(@RequestBody Map<String, Object> ipnData) {
        log.info("Received MoMo IPN: {}", ipnData);
        
        // MoMo orderId format: orderId_timestamp
        String fullOrderId = (String) ipnData.get("orderId");
        int resultCode = (int) ipnData.get("resultCode");
        
        try {
            Long orderId = Long.parseLong(fullOrderId.split("_")[0]);
            if (resultCode == 0) {
                orderUseCase.completePayment(orderId);
                log.info("Order #{} marked as PAID and STOCK DEDUCTED", orderId);
            } else {
                orderUseCase.updatePaymentStatus(orderId, PaymentStatus.FAILED);
                log.warn("Order #{} payment FAILED with code {}", orderId, resultCode);
            }
        } catch (Exception e) {
            log.error("Error processing MoMo IPN", e);
        }
        
        return ResponseEntity.noContent().build();
    }
}
