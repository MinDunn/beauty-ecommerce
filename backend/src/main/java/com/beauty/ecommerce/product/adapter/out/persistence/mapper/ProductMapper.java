package com.beauty.ecommerce.product.adapter.out.persistence.mapper;

import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.domain.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product mapToDomainEntity(ProductJpaEntity jpaEntity) {
        return Product.builder()
                .id(jpaEntity.getId())
                .name(jpaEntity.getName())
                .description(jpaEntity.getDescription())
                .originalPrice(jpaEntity.getOriginalPrice())
                .currentPrice(jpaEntity.getCurrentPrice())
                .stockQuantity(jpaEntity.getStockQuantity())
                .imageUrl(jpaEntity.getImageUrl())
                .categoryId(jpaEntity.getCategoryId())
                .instructions(jpaEntity.getInstructions())
                .ingredients(jpaEntity.getIngredients())
                .skinType(jpaEntity.getSkinType())
                .createdAt(jpaEntity.getCreatedAt())
                .viewCount(jpaEntity.getViewCount() != null ? jpaEntity.getViewCount() : 0L)
                .sold(jpaEntity.getSold() != null ? jpaEntity.getSold() : 0)
                .images(jpaEntity.getImages() != null ? jpaEntity.getImages().stream()
                        .map(com.beauty.ecommerce.product.adapter.out.persistence.ProductImageJpaEntity::getImageUrl)
                        .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .variants(jpaEntity.getVariants() != null ? jpaEntity.getVariants().stream()
                        .map(v -> Product.ProductVariant.builder()
                                .id(v.getId())
                                .variantName(v.getVariantName())
                                .price(v.getPrice())
                                .imageUrl(v.getImageUrl())
                                .stockQuantity(v.getStockQuantity())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .status(jpaEntity.getStatus())
                .expiryDate(jpaEntity.getExpiryDate())
                .build();
    }

    public com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity mapToJpaEntity(com.beauty.ecommerce.product.domain.entity.Product domainEntity) {
        com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity jpaEntity = com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity.builder()
                .id(domainEntity.getId())
                .name(domainEntity.getName())
                .description(domainEntity.getDescription())
                .originalPrice(domainEntity.getOriginalPrice())
                .currentPrice(domainEntity.getCurrentPrice())
                .stockQuantity(domainEntity.getStockQuantity())
                .imageUrl(domainEntity.getImageUrl())
                .categoryId(domainEntity.getCategoryId())
                .instructions(domainEntity.getInstructions())
                .ingredients(domainEntity.getIngredients())
                .skinType(domainEntity.getSkinType())
                .createdAt(domainEntity.getCreatedAt())
                .viewCount(domainEntity.getViewCount() != null ? domainEntity.getViewCount() : 0L)
                .sold(domainEntity.getSold() != null ? domainEntity.getSold() : 0)
                .status(domainEntity.getStatus())
                .expiryDate(domainEntity.getExpiryDate())
                .build();

        if (domainEntity.getImages() != null) {
            jpaEntity.setImages(domainEntity.getImages().stream()
                    .map(url -> com.beauty.ecommerce.product.adapter.out.persistence.ProductImageJpaEntity.builder()
                            .imageUrl(url)
                            .product(jpaEntity)
                            .build())
                    .collect(java.util.stream.Collectors.toList()));
        } else {
            jpaEntity.setImages(new java.util.ArrayList<>());
        }

        if (domainEntity.getVariants() != null) {
            jpaEntity.setVariants(domainEntity.getVariants().stream()
                    .map(v -> com.beauty.ecommerce.product.adapter.out.persistence.ProductVariantJpaEntity.builder()
                            .id(v.getId())
                            .variantName(v.getVariantName())
                            .price(v.getPrice())
                            .imageUrl(v.getImageUrl())
                            .stockQuantity(v.getStockQuantity())
                            .product(jpaEntity)
                            .build())
                    .collect(java.util.stream.Collectors.toList()));
        } else {
            jpaEntity.setVariants(new java.util.ArrayList<>());
        }

        return jpaEntity;
    }
}
