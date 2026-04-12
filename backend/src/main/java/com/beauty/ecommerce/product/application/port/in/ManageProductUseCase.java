package com.beauty.ecommerce.product.application.port.in;

import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface ManageProductUseCase {

    Product createProduct(CreateProductCommand command, MultipartFile image);

    Product updateProduct(Long id, UpdateProductCommand command, MultipartFile image);

    void deleteProduct(Long id);

    @Getter
    @Builder
    class CreateProductCommand {
        private String name;
        private String description;
        private BigDecimal originalPrice;
        private BigDecimal currentPrice;
        private Integer stockQuantity;
        private Long categoryId;
        private String instructions;
        private String ingredients;
    }

    @Getter
    @Builder
    class UpdateProductCommand {
        private String name;
        private String description;
        private BigDecimal originalPrice;
        private BigDecimal currentPrice;
        private Integer stockQuantity;
        private Long categoryId;
        private String instructions;
        private String ingredients;
    }
}
