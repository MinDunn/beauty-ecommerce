package com.beauty.ecommerce.order.adapter.in.web.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String province;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String couponCode;
    private java.math.BigDecimal shippingFee;
    private boolean vatRequested;
    private String taxCode;
    private String companyName;
    private String companyAddress;
    private List<CheckoutItem> checkoutItems;

    @Data
    public static class CheckoutItem {
        private Long productId;
        private String variantName;
    }
}
