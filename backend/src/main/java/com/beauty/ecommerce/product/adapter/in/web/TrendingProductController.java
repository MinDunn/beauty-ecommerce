package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.common.dto.ApiResponse;
import com.beauty.ecommerce.product.adapter.in.web.response.ProductListResponse;
import com.beauty.ecommerce.product.adapter.in.web.response.ProductResponse;
import com.beauty.ecommerce.product.application.service.TrendingProductService;
import com.beauty.ecommerce.product.domain.entity.Product;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products/trending")
@RequiredArgsConstructor
public class TrendingProductController {

    private final TrendingProductService trendingProductService;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getTrendingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<Product> products = trendingProductService.getWeeklyTrendingProducts(limit);

        // Tính toán Rating đồng bộ với ProductController
        List<Long> productIds = products.stream().map(Product::getId).collect(Collectors.toList());
        Map<Long, Double> ratingsMap = new java.util.HashMap<>();
        Map<Long, Long> countsMap = new java.util.HashMap<>();

        if (!productIds.isEmpty()) {
            reviewRepository.findRatingStatsByProductIds(productIds).forEach(obj -> {
                Long pId = (Long) obj[0];
                Double avg = obj[1] != null ? ((Number) obj[1]).doubleValue() : 0.0;
                Long count = obj[2] != null ? ((Number) obj[2]).longValue() : 0L;
                ratingsMap.put(pId, avg);
                countsMap.put(pId, count);
            });
        }

        List<ProductListResponse> response = products.stream()
                .map(p -> mapToListResponse(p,
                        ratingsMap.getOrDefault(p.getId(), 0.0),
                        countsMap.getOrDefault(p.getId(), 0L)))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private ProductListResponse mapToListResponse(Product product, Double avgRating, Long reviewCount) {
        return ProductListResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .currentPrice(product.getCurrentPrice())
                .originalPrice(product.getOriginalPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .images(product.getImages())
                .variants(product.getVariants() != null ? product.getVariants().stream()
                        .map(v -> ProductResponse.ProductVariantResponse.builder()
                                .id(v.getId())
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(v.getImageUrl())
                                .stockQuantity(v.getStockQuantity())
                                .build())
                        .collect(Collectors.toList()) : Collections.emptyList())
                .categoryId(product.getCategoryId())
                .instructions(product.getInstructions())
                .ingredients(product.getIngredients())
                .skinType(product.getSkinType())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .viewCount(product.getViewCount())
                .build();
    }
}
