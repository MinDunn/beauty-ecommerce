package com.beauty.ecommerce.cart.application.port.in;

import com.beauty.ecommerce.cart.domain.entity.CartItem;
import java.util.List;

public interface CartUseCase {
    List<CartItem> getCart(String email);
    void addToCart(String email, Long productId, Integer quantity);
    void updateQuantity(String email, Long productId, Integer quantity);
    void removeFromCart(String email, Long productId);
    void clearCart(String email);
}
