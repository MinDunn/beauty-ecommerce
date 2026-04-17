package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.product.application.service.TrendingProductService;
import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products/trending")
@RequiredArgsConstructor
public class TrendingProductController {

    private final TrendingProductService trendingProductService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getTrendingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<Product> products = trendingProductService.getWeeklyTrendingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}
