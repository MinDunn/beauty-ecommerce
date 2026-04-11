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
            Map<String, Object> response = restTemplate.postForObject(moMoConfig.getPayUrl(), request, Map.class);
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
}
