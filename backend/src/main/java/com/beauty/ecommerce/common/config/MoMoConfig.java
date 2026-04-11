package com.beauty.ecommerce.common.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class MoMoConfig {

    // Thông số Sandbox mặc định của MoMo
    private final String partnerCode = "MOMOBKUN20180529";
    private final String accessKey = "klm05nuayqz7s9uJ";
    private final String secretKey = "at67qH6mk8w5Y1n71enV319TE092Z2jk";
    
    private final String payUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
    
    @Value("${app.momo.redirect-url:http://localhost:5173/order-success}")
    private String redirectUrl;
    
    @Value("${app.momo.ipn-url:http://localhost:8080/api/payment/momo-ipn}")
    private String ipnUrl;
}
