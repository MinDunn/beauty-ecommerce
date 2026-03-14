package com.beauty.ecommerce.category.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @GetMapping
    public ResponseEntity<List<String>> getAllCategories() {
        // TODO: Call GetCategoryUseCase
        return ResponseEntity.ok(List.of("Son môi", "Kem dưỡng da", "Kem chống nắng"));
    }
}
