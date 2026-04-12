package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.application.port.in.ManageProductUseCase;
import com.beauty.ecommerce.product.application.port.out.DeleteProductPort;
import com.beauty.ecommerce.product.application.port.out.LoadProductPort;
import com.beauty.ecommerce.product.application.port.out.SaveProductPort;
import com.beauty.ecommerce.product.application.port.out.UploadImagePort;
import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductManagementService implements ManageProductUseCase {

    private final SaveProductPort saveProductPort;
    private final DeleteProductPort deleteProductPort;
    private final LoadProductPort loadProductPort;
    private final UploadImagePort uploadImagePort;

    @Override
    @Transactional
    public Product createProduct(CreateProductCommand command, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = uploadImagePort.uploadFile(image);
        }

        Product product = Product.builder()
                .name(command.getName())
                .description(command.getDescription())
                .originalPrice(command.getOriginalPrice())
                .currentPrice(command.getCurrentPrice())
                .stockQuantity(command.getStockQuantity())
                .categoryId(command.getCategoryId())
                .instructions(command.getInstructions())
                .ingredients(command.getIngredients())
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();

        return saveProductPort.saveProduct(product);
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, UpdateProductCommand command, MultipartFile image) {
        Product product = loadProductPort.loadProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(command.getName());
        product.setDescription(command.getDescription());
        product.setOriginalPrice(command.getOriginalPrice());
        product.setCurrentPrice(command.getCurrentPrice());
        product.setStockQuantity(command.getStockQuantity());
        product.setCategoryId(command.getCategoryId());
        product.setInstructions(command.getInstructions());
        product.setIngredients(command.getIngredients());

        if (image != null && !image.isEmpty()) {
            String newImageUrl = uploadImagePort.uploadFile(image);
            product.setImageUrl(newImageUrl);
        }

        return saveProductPort.saveProduct(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        // Có thể cần kiểm tra product có tồn tại trước, hoặc để repository tự xử lý
        deleteProductPort.deleteProduct(id);
    }
}
