package com.beauty.ecommerce.payment.adapter.out.momo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MoMoPaymentRequest {
    private String partnerCode;
    private String partnerName;
    private String storeId;
    private String requestId;
    private Long amount;
    private String orderId;
    private String orderInfo;
    private String redirectUrl;
    private String ipnUrl;
    private String requestType;
    private String extraData;
    private String signature;
    private String lang;
}
