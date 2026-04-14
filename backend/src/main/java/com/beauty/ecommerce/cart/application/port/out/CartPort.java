package com.beauty.ecommerce.cart.application.port.out;

import com.beauty.ecommerce.cart.domain.entity.CartItem;
import java.util.List;

public interface CartPort {
    List<CartItem> findByUserEmail(String email);
    void save(String email, Long productId, Integer quantity, String variantName);
    void updateQuantity(String email, Long productId, Integer quantity, String variantName);
    void delete(String email, Long productId, String variantName);
    void clearCart(String email);
}
