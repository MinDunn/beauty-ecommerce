package com.beauty.ecommerce.cart.application.service;

import com.beauty.ecommerce.cart.application.port.in.CartUseCase;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CartServiceIntegrationTest {

    @Autowired
    private CartUseCase cartUseCase;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private UserJpaEntity testUser;
    private ProductJpaEntity product;

    @BeforeEach
    void setUp() {
        testUser = UserJpaEntity.builder()
                .email("test@example.com")
                .password("password")
                .fullName("Test User")
                .role("USER")
                .build();
        userRepository.save(testUser);

        product = ProductJpaEntity.builder()
                .name("Son môi Test")
                .currentPrice(new BigDecimal("100000"))
                .stockQuantity(10)
                .build();
        productRepository.save(product);
    }

    @Test
    void whenAddToCart_thenItemIsPresent() {
        // When
        cartUseCase.addToCart(testUser.getEmail(), product.getId(), 2, null);

        // Then
        List<CartItem> cart = cartUseCase.getCart(testUser.getEmail());
        assertThat(cart).hasSize(1);
        assertThat(cart.get(0).getQuantity()).isEqualTo(2);
        assertThat(cart.get(0).getProductName()).isEqualTo("Son môi Test");
    }

    @Test
    void whenAddExistingItem_thenQuantityIncrements() {
        // Given
        cartUseCase.addToCart(testUser.getEmail(), product.getId(), 2, null);

        // When
        cartUseCase.addToCart(testUser.getEmail(), product.getId(), 3, null);

        // Then
        List<CartItem> cart = cartUseCase.getCart(testUser.getEmail());
        assertThat(cart).hasSize(1);
        assertThat(cart.get(0).getQuantity()).isEqualTo(5); // 2 + 3 = 5
    }

    @Test
    void whenUpdateQuantity_thenQuantityIsModified() {
        // Given
        cartUseCase.addToCart(testUser.getEmail(), product.getId(), 2, null);

        // When
        cartUseCase.updateQuantity(testUser.getEmail(), product.getId(), 10, null);

        // Then
        List<CartItem> cart = cartUseCase.getCart(testUser.getEmail());
        assertThat(cart.get(0).getQuantity()).isEqualTo(10);
    }

    @Test
    void whenRemoveFromCart_thenItemIsDeleted() {
        // Given
        cartUseCase.addToCart(testUser.getEmail(), product.getId(), 2, null);

        // When
        cartUseCase.removeFromCart(testUser.getEmail(), product.getId(), null);

        // Then
        List<CartItem> cart = cartUseCase.getCart(testUser.getEmail());
        assertThat(cart).isEmpty();
    }
}
