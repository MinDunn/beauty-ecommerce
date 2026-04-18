package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.product.adapter.in.web.response.ProductListResponse;
import com.beauty.ecommerce.product.adapter.in.web.response.ProductResponse;
import com.beauty.ecommerce.product.application.port.in.GetProductUseCase;
import com.beauty.ecommerce.product.domain.entity.Product;
import com.beauty.ecommerce.review.adapter.out.persistence.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final GetProductUseCase productUseCase;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<Page<ProductListResponse>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "latest") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        // Validation cơ bản
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build();
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build();
        }

        // Xử lý Sorting mạnh mẽ
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && !sortBy.isBlank() && !sortBy.equalsIgnoreCase("latest")) {
            try {
                String field = "createdAt";
                Sort.Direction direction = Sort.Direction.DESC;

                // Xử lý các định dạng: "currentPrice,asc", "price-asc", "price_asc"
                String[] parts;
                if (sortBy.contains(",")) {
                    parts = sortBy.split(",");
                } else if (sortBy.contains("-")) {
                    parts = sortBy.split("-");
                } else if (sortBy.contains("_")) {
                    parts = sortBy.split("_");
                } else {
                    parts = new String[]{sortBy};
                }

                if (parts.length > 0) {
                    String sortField = parts[0].toLowerCase();
                    System.out.println("DEBUG: Processing Sort Field: " + sortField + " from " + sortBy);
                    
                    if (sortField.contains("price")) {
                        field = "currentPrice";
                    } else if (sortField.contains("created") || sortField.contains("latest")) {
                        field = "createdAt";
                    }

                    if (parts.length > 1) {
                        String sortDir = parts[1].toLowerCase();
                        System.out.println("DEBUG: Processing Sort Direction: " + sortDir);
                        
                        if (sortDir.equals("asc") || sortDir.equals("low") || sortDir.equals("up")) {
                            direction = Sort.Direction.ASC;
                        } else if (sortDir.equals("desc") || sortDir.equals("high") || sortDir.equals("down")) {
                            direction = Sort.Direction.DESC;
                        }
                    }
                }
                sort = Sort.by(direction, field);
            } catch (Exception e) {
                // Fallback về mặc định nếu có lỗi parse
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
            }
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productUseCase.getAllProducts(categoryId, minPrice, maxPrice, keyword, sortBy, pageable);
        
        // Giải quyết N+1 bằng cách lấy rating hàng loạt
        List<Long> productIds = productPage.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        
        Map<Long, Double> ratingsMap = Collections.emptyMap();
        if (!productIds.isEmpty()) {
            ratingsMap = reviewRepository.findAverageRatingsByProductIds(productIds).stream()
                .collect(Collectors.toMap(
                    obj -> (Long) obj[0],
                    obj -> (Double) obj[1]
                ));
        }

        final Map<Long, Double> finalRatingsMap = ratingsMap;
        Page<ProductListResponse> responsePage = productPage.map(product -> 
            mapToListResponse(product, finalRatingsMap.getOrDefault(product.getId(), 0.0))
        );

        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productUseCase.getProductById(id);
        ProductResponse response = mapToResponse(product);
        return ResponseEntity.ok(response);
    }

    private ProductListResponse mapToListResponse(Product product, Double avgRating) {
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
                .averageRating(avgRating != null ? avgRating : 0.0)
                .build();
    }
 
    private ProductResponse mapToResponse(Product product) {
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());
        if (avgRating == null) avgRating = 0.0;
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .originalPrice(product.getOriginalPrice())
                .currentPrice(product.getCurrentPrice())
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
                .createdAt(product.getCreatedAt())
                .averageRating(avgRating)
                .build();
    }
}
