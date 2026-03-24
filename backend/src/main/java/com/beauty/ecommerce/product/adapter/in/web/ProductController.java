package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.product.adapter.in.web.response.ProductResponseDTO;
import com.beauty.ecommerce.product.application.port.in.GetProductUseCase;
import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final GetProductUseCase getProductUseCase;

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        log.info("Yêu cầu lấy danh sách toàn bộ sản phẩm");
        List<Product> products = getProductUseCase.getAllProducts();
        
        List<ProductResponseDTO> response = products.stream()
                .map(p -> ProductResponseDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .currentPrice(p.getCurrentPrice())
                        .imageUrl(p.getImageUrl())
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long id) {
        Product p = getProductUseCase.getProductById(id);
        ProductResponseDTO response = ProductResponseDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .currentPrice(p.getCurrentPrice())
                .imageUrl(p.getImageUrl())
                .build();
        return ResponseEntity.ok(response);
    }
}
