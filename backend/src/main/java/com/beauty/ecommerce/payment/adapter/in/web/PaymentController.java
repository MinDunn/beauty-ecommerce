package com.beauty.ecommerce.payment.adapter.in.web;

import com.beauty.ecommerce.common.config.MoMoConfig;
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
    private final MoMoConfig moMoConfig;

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
        
        try {
            String partnerCode = (String) ipnData.get("partnerCode");
            String accessKey = (String) ipnData.get("accessKey");
            String requestId = (String) ipnData.get("requestId");
            String amount = String.valueOf(ipnData.get("amount"));
            String orderIdStr = (String) ipnData.get("orderId");
            String orderInfo = (String) ipnData.get("orderInfo");
            String orderType = (String) ipnData.get("orderType");
            String transId = String.valueOf(ipnData.get("transId"));
            String message = (String) ipnData.get("message");
            String responseTime = (String) ipnData.get("responseTime");
            String payType = (String) ipnData.get("payType");
            String extraData = (String) ipnData.get("extraData");
            String signature = (String) ipnData.get("signature");

            // Build raw signature according to MoMo documentation
            String rawHash = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&message=" + message +
                    "&orderId=" + orderIdStr +
                    "&orderInfo=" + orderInfo +
                    "&orderType=" + orderType +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + payType +
                    "&requestId=" + requestId +
                    "&responseTime=" + responseTime +
                    "&resultCode=" + String.valueOf(ipnData.get("resultCode")) +
                    "&transId=" + transId;

            String expectedSignature = com.beauty.ecommerce.common.util.SignatureUtil.hmacSha256(rawHash, moMoConfig.getSecretKey());
            
            if (!expectedSignature.equals(signature)) {
                log.error("MoMo IPN Signature verification failed! Expected: {}, got: {}", expectedSignature, signature);
                return ResponseEntity.badRequest().build();
            }

            int resultCode = (int) ipnData.get("resultCode");
            Long orderId = Long.parseLong(orderIdStr.split("_")[0]);
            
            if (resultCode == 0) {
                orderUseCase.completePayment(orderId, transId);
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
