package com.beauty.ecommerce.order.application.port.in;

import com.beauty.ecommerce.order.domain.entity.PaymentMethod;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PlaceOrderCommand {
    String email;
    String receiverName;
    String receiverPhone;
    String shippingAddress;
    PaymentMethod paymentMethod;
    String couponCode;
    List<CheckoutItem> checkoutItems;

    @Value
    @Builder
    public static class CheckoutItem {
        Long productId;
        String variantName;
    }
}
