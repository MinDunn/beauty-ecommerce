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
    private final com.beauty.ecommerce.common.application.service.ActivityLogService activityLogService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestPart("product") @Valid AdminProductRequest request,
            @RequestPart(value = "images", required = false) java.util.List<MultipartFile> images) {
        
        System.out.println("DEBUG: Create Product Request - Variants: " + (request.getVariants() != null ? request.getVariants().size() : 0));
        
        ManageProductUseCase.CreateProductCommand command = ManageProductUseCase.CreateProductCommand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .currentPrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .categoryId(request.getCategoryId())
                .instructions(request.getInstructions())
                .ingredients(request.getIngredients())
                .skinType(request.getSkinType())
                .imageUrl(request.getImageUrl())
                .expiryDate(request.getExpiryDate())
                .existingImages(request.getExistingImages())
                .variants(request.getVariants() != null ? request.getVariants().stream()
                        .map(v -> ManageProductUseCase.VariantCommand.builder()
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(v.getImageUrl())
                                .stockQuantity(v.getStockQuantity())
                                .imageIndex(v.getImageIndex())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : null)
                .build();
                
        Product product = manageProductUseCase.createProduct(command, images);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "CREATE_PRODUCT", "Admin tạo sản phẩm mới: " + product.getName() + " (ID: " + product.getId() + ")");
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(product));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") @Valid AdminProductRequest request,
            @RequestPart(value = "images", required = false) java.util.List<MultipartFile> images) {

        System.out.println("DEBUG: Update Product Request ID: " + id);
            
        ManageProductUseCase.UpdateProductCommand command = ManageProductUseCase.UpdateProductCommand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .currentPrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .categoryId(request.getCategoryId())
                .instructions(request.getInstructions())
                .ingredients(request.getIngredients())
                .skinType(request.getSkinType())
                .imageUrl(request.getImageUrl())
                .expiryDate(request.getExpiryDate())
                .existingImages(request.getExistingImages())
                .variants(request.getVariants() != null ? request.getVariants().stream()
                        .map(v -> ManageProductUseCase.VariantCommand.builder()
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(v.getImageUrl())
                                .stockQuantity(v.getStockQuantity())
                                .imageIndex(v.getImageIndex())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : null)
                .build();
                
        Product product = manageProductUseCase.updateProduct(id, command, images);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "UPDATE_PRODUCT", "Admin cập nhật sản phẩm: " + product.getName() + " (ID: " + product.getId() + ")");
        return ResponseEntity.ok(mapToResponse(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        manageProductUseCase.deleteProduct(id);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "DELETE_PRODUCT", "Admin ẩn sản phẩm ID: " + id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateProductStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusMap) {
        String status = statusMap.get("status");
        manageProductUseCase.updateProductStatus(id, status);
        activityLogService.logActivity(null, "ADMIN", com.beauty.ecommerce.common.application.service.ActivityLogService.GROUP_SYSTEM, "UPDATE_PRODUCT_STATUS", "Admin cập nhật trạng thái sản phẩm ID: " + id + " thành " + status);
        return ResponseEntity.ok().build();
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
                .variants(product.getVariants() != null ? product.getVariants().stream()
                        .map(v -> ProductResponse.ProductVariantResponse.builder()
                                .id(v.getId())
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(v.getImageUrl())
                                .stockQuantity(v.getStockQuantity())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .status(product.getStatus())
                .expiryDate(product.getExpiryDate())
                .build();
    }
}
