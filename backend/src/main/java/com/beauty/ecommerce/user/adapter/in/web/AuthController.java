package com.beauty.ecommerce.user.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/register")
    public ResponseEntity<String> register() {
        // TODO: Call CreateUserUseCase
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login() {
        // TODO: Call LoginUseCase & return JWT
        return ResponseEntity.ok("fake-jwt-token");
    }

    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser() {
        // TODO: Get current authenticated user
        return ResponseEntity.ok("Current User Info");
    }
}
