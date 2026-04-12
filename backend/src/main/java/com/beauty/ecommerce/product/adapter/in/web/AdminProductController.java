package com.beauty.ecommerce.product.adapter.in.web;

import com.beauty.ecommerce.product.adapter.in.web.request.AdminProductRequest;
import com.beauty.ecommerce.product.adapter.in.web.response.ProductResponse;
import com.beauty.ecommerce.product.application.port.in.ManageProductUseCase;
import com.beauty.ecommerce.product.domain.entity.Product;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ManageProductUseCase manageProductUseCase;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestPart("product") @Valid AdminProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        System.out.println("DEBUG: Create Product Request - Instructions: " + request.getInstructions());
        System.out.println("DEBUG: Create Product Request - Ingredients: " + request.getIngredients());
        
        ManageProductUseCase.CreateProductCommand command = ManageProductUseCase.CreateProductCommand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .currentPrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .categoryId(request.getCategoryId())
                .instructions(request.getInstructions())
                .ingredients(request.getIngredients())
                .build();
                
        Product product = manageProductUseCase.createProduct(command, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(product));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") @Valid AdminProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        System.out.println("DEBUG: Update Product Request ID: " + id);
        System.out.println("DEBUG: Update - Instructions: " + request.getInstructions());
        System.out.println("DEBUG: Update - Ingredients: " + request.getIngredients());
            
        ManageProductUseCase.UpdateProductCommand command = ManageProductUseCase.UpdateProductCommand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .currentPrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .categoryId(request.getCategoryId())
                .instructions(request.getInstructions())
                .ingredients(request.getIngredients())
                .build();
                
        Product product = manageProductUseCase.updateProduct(id, command, image);
        return ResponseEntity.ok(mapToResponse(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        manageProductUseCase.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .originalPrice(product.getOriginalPrice())
                .currentPrice(product.getCurrentPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategoryId())
                .instructions(product.getInstructions())
                .ingredients(product.getIngredients())
                .createdAt(product.getCreatedAt())
                .averageRating(0.0) // Return 0.0 for newly created / updated since we don't query reviews here
                .build();
    }
}
