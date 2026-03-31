package com.beauty.ecommerce.cart.application.service;

import com.beauty.ecommerce.cart.application.port.in.CartUseCase;
import com.beauty.ecommerce.cart.application.port.out.CartPort;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService implements CartUseCase {

    private final CartPort cartPort;

    @Override
    public List<CartItem> getCart(String email) {
        return cartPort.findByUserEmail(email);
    }

    @Override
    public void addToCart(String email, Long productId, Integer quantity) {
        cartPort.save(email, productId, quantity);
    }

    @Override
    public void updateQuantity(String email, Long productId, Integer quantity) {
        cartPort.updateQuantity(email, productId, quantity);
    }

    @Override
    public void removeFromCart(String email, Long productId) {
        cartPort.delete(email, productId);
    }

    @Override
    public void clearCart(String email) {
        cartPort.clearCart(email);
    }
}
