package com.beauty.ecommerce.common.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class MoMoConfig {

    // Thông số Sandbox mặc định của MoMo (Có thể override qua .env)
    @Value("${app.momo.partner-code:MOMOBKUN20180529}")
    private String partnerCode;

    @Value("${app.momo.access-key:klm05nuayqz7s9uJ}")
    private String accessKey;

    @Value("${app.momo.secret-key:at67qH6mk8w5Y1n71enV319TE092Z2jk}")
    private String secretKey;
    
    @Value("${app.momo.pay-url:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String payUrl;
    
    @Value("${app.momo.redirect-url:http://localhost:5173/order-success}")
    private String redirectUrl;
    
    @Value("${app.momo.ipn-url:http://localhost:8080/api/payment/momo-ipn}")
    private String ipnUrl;
}
