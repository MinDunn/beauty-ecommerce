package com.beauty.ecommerce.cart.application.port.in;

import com.beauty.ecommerce.cart.domain.entity.CartItem;
import java.util.List;

public interface CartUseCase {
    List<CartItem> getCart(String email);
    void addToCart(String email, Long productId, Integer quantity, String variantName);
    void updateQuantity(String email, Long productId, Integer quantity, String variantName);
    void removeFromCart(String email, Long productId, String variantName);
    void clearCart(String email);
}
