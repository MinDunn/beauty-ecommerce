package com.beauty.ecommerce.order.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping
    public ResponseEntity<String> createOrder() {
        // TODO: Call CheckoutOrderUseCase
        return ResponseEntity.ok("Order created successfully");
    }

    @GetMapping("/my-orders")
    public ResponseEntity<String> getMyOrders() {
        // TODO: Call GetMyOrdersUseCase
        return ResponseEntity.ok("List of user's orders");
    }
}
