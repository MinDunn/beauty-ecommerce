package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.application.port.in.ManageProductUseCase;
import com.beauty.ecommerce.product.application.port.out.SaveProductPort;
import com.beauty.ecommerce.product.application.port.out.UploadImagePort;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductImageJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity;
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
    private final UploadImagePort uploadImagePort;
    private final com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository productRepository;

    @Override
    @Transactional
    public Product createProduct(CreateProductCommand command, java.util.List<MultipartFile> images) {
        String mainImageUrl = null;
        java.util.List<ProductImageJpaEntity> galleryImages = new java.util.ArrayList<>();

        if (command.getImageUrl() != null && !command.getImageUrl().isBlank()) {
            mainImageUrl = command.getImageUrl();
            galleryImages.add(ProductImageJpaEntity.builder().imageUrl(mainImageUrl).build());
        } else if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                String uploadedUrl = uploadImagePort.uploadFile(images.get(i));
                if (i == 0) {
                    mainImageUrl = uploadedUrl;
                }
                galleryImages.add(ProductImageJpaEntity.builder().imageUrl(uploadedUrl).build());
            }
        }

        ProductJpaEntity productEntity = ProductJpaEntity.builder()
                .name(command.getName())
                .description(command.getDescription())
                .originalPrice(command.getOriginalPrice())
                .currentPrice(command.getCurrentPrice())
                .stockQuantity(command.getStockQuantity())
                .categoryId(command.getCategoryId())
                .instructions(command.getInstructions())
                .ingredients(command.getIngredients())
                .status("ACTIVE")
                .expiryDate(command.getExpiryDate())
                .imageUrl(mainImageUrl)
                .images(galleryImages)
                .variants(command.getVariants() != null ? command.getVariants().stream()
                        .map(v -> {
                            String variantImageUrl = v.getImageUrl();
                            if (v.getImageIndex() != null && v.getImageIndex() < galleryImages.size()) {
                                variantImageUrl = galleryImages.get(v.getImageIndex()).getImageUrl();
                            }
                            ProductVariantJpaEntity variant = ProductVariantJpaEntity.builder()
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(variantImageUrl)
                                .stockQuantity(v.getStockQuantity())
                                .skinTypes(v.getSkinTypes() != null ? String.join(",", v.getSkinTypes()) : null)
                                .build();
                            variant.setProduct(null); // Will be set after builder builds productEntity and we loop
                            return variant;
                        })
                        .collect(java.util.stream.Collectors.toList()) : null)
                .createdAt(LocalDateTime.now())
                .build();

        // Auto-aggregate skin types from variants to product
        if (productEntity.getVariants() != null) {
            java.util.Set<String> allSkinTypes = new java.util.HashSet<>();
            if (command.getSkinTypes() != null) {
                allSkinTypes.addAll(command.getSkinTypes());
            }
            productEntity.getVariants().forEach(v -> {
                if (v.getSkinTypes() != null && !v.getSkinTypes().isBlank()) {
                    allSkinTypes.addAll(java.util.Arrays.asList(v.getSkinTypes().split(",")));
                }
            });
            if (!allSkinTypes.isEmpty()) {
                productEntity.setSkinTypes(String.join(",", allSkinTypes));
            }
        } else if (command.getSkinTypes() != null) {
            productEntity.setSkinTypes(String.join(",", command.getSkinTypes()));
        }

        // Set back-references
        if (productEntity.getVariants() != null) {
            productEntity.getVariants().forEach(v -> v.setProduct(productEntity));
        }
        if (productEntity.getImages() != null) {
            productEntity.getImages().forEach(img -> img.setProduct(productEntity));
        }

        try {
            return saveProductPort.saveProduct(mapToDomain(productEntity));
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in createProduct: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi hệ thống khi tạo sản phẩm: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, UpdateProductCommand command, java.util.List<MultipartFile> images) {
        ProductJpaEntity productEntity = loadProductJpaEntity(id);

        productEntity.setName(command.getName());
        productEntity.setDescription(command.getDescription());
        productEntity.setOriginalPrice(command.getOriginalPrice());
        productEntity.setCurrentPrice(command.getCurrentPrice());
        productEntity.setStockQuantity(command.getStockQuantity());
        productEntity.setCategoryId(command.getCategoryId());
        productEntity.setInstructions(command.getInstructions());
        productEntity.setIngredients(command.getIngredients());
        productEntity.setExpiryDate(command.getExpiryDate());
        
        // Initial skin types from command
        java.util.Set<String> allSkinTypes = new java.util.HashSet<>();
        if (command.getSkinTypes() != null) {
            allSkinTypes.addAll(command.getSkinTypes());
        }

        // Handle images updates
        java.util.List<String> finalImageUrls = new java.util.ArrayList<>();
        if (command.getExistingImages() != null) {
            finalImageUrls.addAll(command.getExistingImages());
        }

        java.util.List<String> newUploadedUrls = new java.util.ArrayList<>();
        if (command.getImageUrl() != null && !command.getImageUrl().isBlank()) {
            finalImageUrls.add(command.getImageUrl());
        } else if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                String uploadedUrl = uploadImagePort.uploadFile(images.get(i));
                newUploadedUrls.add(uploadedUrl);
                finalImageUrls.add(uploadedUrl);
            }
        }

        // Sync images in database
        productEntity.getImages().clear();
        for (int i = 0; i < finalImageUrls.size(); i++) {
            String url = finalImageUrls.get(i);
            if (i == 0) {
                productEntity.setImageUrl(url);
            }
            productEntity.getImages().add(ProductImageJpaEntity.builder()
                    .imageUrl(url)
                    .product(productEntity)
                    .build());
        }

        // Handle variants updates
        if (command.getVariants() != null) {
            productEntity.getVariants().clear();
            productEntity.getVariants().addAll(command.getVariants().stream()
                    .map(v -> {
                        String variantImageUrl = v.getImageUrl();
                        if (v.getImageIndex() != null && v.getImageIndex() < newUploadedUrls.size()) {
                            variantImageUrl = newUploadedUrls.get(v.getImageIndex());
                        }
                        
                        if (v.getSkinTypes() != null) {
                            allSkinTypes.addAll(v.getSkinTypes());
                        }

                        return ProductVariantJpaEntity.builder()
                            .variantName(v.getVariantName())
                            .price(v.getPrice())
                            .imageUrl(variantImageUrl)
                            .stockQuantity(v.getStockQuantity())
                            .skinTypes(v.getSkinTypes() != null ? String.join(",", v.getSkinTypes()) : null)
                            .product(productEntity)
                            .build();
                    })
                    .collect(java.util.stream.Collectors.toList()));

            // Auto-heal: Ensure total stock matches variants
            int totalStock = productEntity.getVariants().stream()
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();
            productEntity.setStockQuantity(totalStock);
        }

        // Update product skin types from aggregated set
        if (!allSkinTypes.isEmpty()) {
            productEntity.setSkinTypes(String.join(",", allSkinTypes));
        } else {
            productEntity.setSkinTypes(null);
        }

        try {
            return saveProductPort.saveProduct(mapToDomain(productEntity));
        } catch (Exception e) {
            System.err.println("Lỗi khi lưu sản phẩm (update): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private ProductJpaEntity loadProductJpaEntity(Long id) {
        // This is a bit of a hack since we don't have a direct accessor to JpaEntity here
        // In a strictly Hexagonal arch, you'd use a port. But for simplicity:
        return ((com.beauty.ecommerce.product.adapter.out.persistence.ProductPersistenceAdapter)saveProductPort).loadJpaEntity(id);
    }

    private Product mapToDomain(ProductJpaEntity entity) {
        return Product.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .originalPrice(entity.getOriginalPrice())
                .currentPrice(entity.getCurrentPrice())
                .stockQuantity(entity.getStockQuantity())
                .imageUrl(entity.getImageUrl())
                .categoryId(entity.getCategoryId())
                .instructions(entity.getInstructions())
                .ingredients(entity.getIngredients())
                .skinTypes(fromCommaSeparated(entity.getSkinTypes()))
                .createdAt(entity.getCreatedAt())
                .status(entity.getStatus())
                .expiryDate(entity.getExpiryDate())
                .images(entity.getImages() != null ? entity.getImages().stream()
                        .map(ProductImageJpaEntity::getImageUrl)
                        .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .variants(entity.getVariants() != null ? entity.getVariants().stream()
                        .map(v -> Product.ProductVariant.builder()
                                .id(v.getId())
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(v.getImageUrl())
                                .stockQuantity(v.getStockQuantity())
                                .skinTypes(fromCommaSeparated(v.getSkinTypes()))
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .build();
    }

    private java.util.List<String> fromCommaSeparated(String str) {
        if (str == null || str.isBlank()) return new java.util.ArrayList<>();
        return new java.util.ArrayList<>(java.util.Arrays.asList(str.split(",")));
    }

    @Override
    @Transactional
    public void updateProductStatus(Long id, String status) {
        ProductJpaEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        entity.setStatus(status);
        productRepository.save(entity);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        // Thay vì xóa thật, chúng ta chuyển trạng thái thành HIDDEN
        ProductJpaEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        entity.setStatus("HIDDEN");
        productRepository.save(entity);
    }
}
