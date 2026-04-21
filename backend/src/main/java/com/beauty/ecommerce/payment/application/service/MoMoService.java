package com.beauty.ecommerce.payment.application.service;

import com.beauty.ecommerce.common.config.MoMoConfig;
import com.beauty.ecommerce.common.util.SignatureUtil;
import com.beauty.ecommerce.payment.adapter.out.momo.MoMoPaymentRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoService {

    private final MoMoConfig moMoConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    public String createPaymentUrl(Long orderId, Long amount, String orderInfo) {
        String requestId = UUID.randomUUID().toString();
        String orderIdStr = orderId + "_" + System.currentTimeMillis(); // Unique orderId for MoMo

        String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                "&amount=" + amount +
                "&extraData=" + "" +
                "&ipnUrl=" + moMoConfig.getIpnUrl() +
                "&orderId=" + orderIdStr +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + moMoConfig.getPartnerCode() +
                "&redirectUrl=" + moMoConfig.getRedirectUrl() +
                "&requestId=" + requestId +
                "&requestType=captureWallet";

        String signature = SignatureUtil.hmacSha256(rawSignature, moMoConfig.getSecretKey());

        MoMoPaymentRequest request = MoMoPaymentRequest.builder()
                .partnerCode(moMoConfig.getPartnerCode())
                .partnerName("Glowzy Beauty")
                .storeId("GlowzyStore")
                .requestId(requestId)
                .amount(amount)
                .orderId(orderIdStr)
                .orderInfo(orderInfo)
                .redirectUrl(moMoConfig.getRedirectUrl())
                .ipnUrl(moMoConfig.getIpnUrl())
                .lang("vi")
                .extraData("")
                .requestType("captureWallet")
                .signature(signature)
                .build();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) restTemplate.postForObject(moMoConfig.getPayUrl(), request, Map.class);
            if (response != null && response.containsKey("payUrl")) {
                return (String) response.get("payUrl");
            }
            log.error("MoMo response: {}", response);
            throw new RuntimeException("Failed to get payUrl from MoMo");
        } catch (Exception e) {
            log.error("Error calling MoMo API", e);
            throw new RuntimeException("Lỗi kết nối tới cổng thanh toán MoMo: " + e.getMessage());
        }
    }

    public boolean refundOrder(Long orderId, String transIdStr, Long amount) {
        String requestId = UUID.randomUUID().toString();
        String orderIdStr = "refund_" + orderId + "_" + System.currentTimeMillis();

        String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                "&amount=" + amount +
                "&description=" + "Hoan tien don hang " + orderId +
                "&orderId=" + orderIdStr +
                "&partnerCode=" + moMoConfig.getPartnerCode() +
                "&requestId=" + requestId +
                "&transId=" + transIdStr;

        String signature = SignatureUtil.hmacSha256(rawSignature, moMoConfig.getSecretKey());

        Map<String, Object> request = Map.of(
                "partnerCode", moMoConfig.getPartnerCode(),
                "orderId", orderIdStr,
                "requestId", requestId,
                "amount", amount,
                "transId", Long.parseLong(transIdStr),
                "lang", "vi",
                "description", "Hoan tien don hang " + orderId,
                "signature", signature
        );

        try {
            // MoMo refund endpoint is usually /v2/gateway/api/refund
            String refundUrl = moMoConfig.getPayUrl().replace("/create", "/refund");
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) restTemplate.postForObject(refundUrl, request, Map.class);
            
            if (response != null) {
                Integer resultCode = (Integer) response.get("resultCode");
                if (resultCode != null && resultCode == 0) {
                    log.info("Refund successful for order {}", orderId);
                    return true;
                }
                log.error("MoMo refund failed: {}", response);
            }
            return false;
        } catch (Exception e) {
            log.error("Error calling MoMo Refund API", e);
            return false;
        }
    }
}
