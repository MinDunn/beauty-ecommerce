package com.beauty.ecommerce.product.application.port.in;

import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

public interface ManageProductUseCase {

    Product createProduct(CreateProductCommand command, java.util.List<MultipartFile> images);

    Product updateProduct(Long id, UpdateProductCommand command, java.util.List<MultipartFile> images);
    
    void updateProductStatus(Long id, String status);

    void deleteProduct(Long id); // Note: Should be implemented as soft-delete/hide

    @Getter
    @Builder
    class CreateProductCommand {
        private String name;
        private String description;
        private java.math.BigDecimal originalPrice;
        private java.math.BigDecimal currentPrice;
        private Integer stockQuantity;
        private Long categoryId;
        private String instructions;
        private String ingredients;
        private String skinType;
        private String imageUrl;
        private java.util.List<String> existingImages;
        private java.time.LocalDate expiryDate;
        private java.util.List<VariantCommand> variants;
    }
 
    @Getter
    @Builder
    class UpdateProductCommand {
        private String name;
        private String description;
        private java.math.BigDecimal originalPrice;
        private java.math.BigDecimal currentPrice;
        private Integer stockQuantity;
        private Long categoryId;
        private String instructions;
        private String ingredients;
        private String skinType;
        private String imageUrl;
        private java.util.List<String> existingImages;
        private java.time.LocalDate expiryDate;
        private java.util.List<VariantCommand> variants;
    }

    @Getter
    @Builder
    class VariantCommand {
        private String variantName;
        private java.math.BigDecimal price;
        private String imageUrl;
        private Integer stockQuantity;
        private Integer imageIndex;
    }
}
