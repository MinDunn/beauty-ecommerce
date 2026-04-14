package com.beauty.ecommerce.cart.adapter.out.persistence;

import com.beauty.ecommerce.cart.adapter.out.persistence.mapper.CartMapper;
import com.beauty.ecommerce.cart.application.port.out.CartPort;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CartPersistenceAdapter implements CartPort {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Override
    public List<CartItem> findByUserEmail(String email) {
        return cartRepository.findByUserEmail(email).stream()
                .map(cartMapper::mapToDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void save(String email, Long productId, Integer quantity, String variantName) {
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItemJpaEntity cartItem = cartRepository.findByUserEmailAndProductIdAndVariantName(email, productId, variantName)
                .map(item -> {
                    item.setQuantity(item.getQuantity() + quantity);
                    return item;
                })
                .orElse(CartItemJpaEntity.builder()
                        .user(user)
                        .product(product)
                        .quantity(quantity)
                        .variantName(variantName)
                        .build());

        cartRepository.save(cartItem);
    }

    @Override
    @Transactional
    public void updateQuantity(String email, Long productId, Integer quantity, String variantName) {
        CartItemJpaEntity cartItem = cartRepository.findByUserEmailAndProductIdAndVariantName(email, productId, variantName)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartItem.setQuantity(quantity);
        cartRepository.save(cartItem);
    }

    @Override
    @Transactional
    public void delete(String email, Long productId, String variantName) {
        CartItemJpaEntity cartItem = cartRepository.findByUserEmailAndProductIdAndVariantName(email, productId, variantName)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        cartRepository.deleteByUserEmail(email);
    }
}
