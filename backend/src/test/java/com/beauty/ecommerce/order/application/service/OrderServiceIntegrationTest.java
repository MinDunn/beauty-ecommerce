package com.beauty.ecommerce.order.application.service;

import com.beauty.ecommerce.cart.application.port.out.CartPort;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import com.beauty.ecommerce.order.application.port.in.OrderUseCase;
import com.beauty.ecommerce.order.application.port.in.PlaceOrderCommand;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentMethod;
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
public class OrderServiceIntegrationTest {

    @Autowired
    private OrderUseCase orderUseCase;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartPort cartPort;

    private UserJpaEntity testUser;
    private ProductJpaEntity product1;
    private ProductJpaEntity product2;

    @BeforeEach
    void setUp() {
        // 1. Create Test User
        testUser = UserJpaEntity.builder()
                .email("test@example.com")
                .password("password")
                .fullName("Test User")
                .role("USER")
                .build();
        userRepository.save(testUser);

        // 2. Create Test Products
        product1 = ProductJpaEntity.builder()
                .name("Son môi A")
                .currentPrice(new BigDecimal("200000"))
                .stockQuantity(10)
                .build();
        product2 = ProductJpaEntity.builder()
                .name("Kem nền B")
                .currentPrice(new BigDecimal("500000"))
                .stockQuantity(5)
                .build();
        productRepository.saveAll(List.of(product1, product2));

        // 3. Add to Cart
        cartPort.save(testUser.getEmail(), product1.getId(), 2, null); // 2 units of product1
        cartPort.save(testUser.getEmail(), product2.getId(), 1, null); // 1 unit of product2
    }

    @Test
    void whenPlaceOrder_thenStockDecreasedAndCartCleared() {
        // Given
        String email = testUser.getEmail();
        String receiverName = "Bảo";
        String receiverPhone = "0987654321";
        String shippingAddress = "TP.HCM";

        // When
        PlaceOrderCommand command = PlaceOrderCommand.builder()
            .email(email)
            .receiverName(receiverName)
            .receiverPhone(receiverPhone)
            .shippingAddress(shippingAddress)
            .paymentMethod(PaymentMethod.COD)
            .build();

        Order savedOrder = orderUseCase.placeOrder(command);

        // Then: 1. Check Order Details
        assertThat(savedOrder).isNotNull();
        assertThat(savedOrder.getTotalPrice()).isEqualByComparingTo(new BigDecimal("900000")); // (200k*2) + 500k
        assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(savedOrder.getItems()).hasSize(2);

        // Then: 2. Check Stock Decreased
        ProductJpaEntity updatedProduct1 = productRepository.findById(product1.getId()).orElseThrow();
        ProductJpaEntity updatedProduct2 = productRepository.findById(product2.getId()).orElseThrow();
        
        assertThat(updatedProduct1.getStockQuantity()).isEqualTo(8); // 10 - 2 = 8
        assertThat(updatedProduct2.getStockQuantity()).isEqualTo(4); // 5 - 1 = 4

        // Then: 3. Check Cart Cleared
        List<CartItem> remainingCartItems = cartPort.findByUserEmail(email);
        assertThat(remainingCartItems).isEmpty();
    }
}
