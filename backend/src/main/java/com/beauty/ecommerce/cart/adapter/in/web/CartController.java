package com.beauty.ecommerce.cart.adapter.in.web;

import com.beauty.ecommerce.cart.adapter.in.web.request.CartItemRequest;
import com.beauty.ecommerce.cart.adapter.in.web.response.CartItemResponse;
import com.beauty.ecommerce.cart.application.port.in.CartUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartUseCase cartUseCase;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<CartItemResponse> response = cartUseCase.getCart(email).stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productImageUrl(item.getProductImageUrl())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .variantName(item.getVariantName())
                        .stockQuantity(item.getStockQuantity())
                        .subTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> addToCart(@Valid @RequestBody CartItemRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        cartUseCase.addToCart(email, request.getProductId(), request.getQuantity(), request.getVariantName());
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<Void> updateQuantity(@Valid @RequestBody CartItemRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        cartUseCase.updateQuantity(email, request.getProductId(), request.getQuantity(), request.getVariantName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long productId, @RequestParam(required = false) String variantName) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        cartUseCase.removeFromCart(email, productId, variantName);
        return ResponseEntity.ok().build();
    }
}
