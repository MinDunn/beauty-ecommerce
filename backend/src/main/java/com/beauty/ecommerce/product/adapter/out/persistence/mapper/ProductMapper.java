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
                .build();
    }

    public ProductJpaEntity mapToJpaEntity(Product domainEntity) {
        return ProductJpaEntity.builder()
                .id(domainEntity.getId())
                .name(domainEntity.getName())
                .description(domainEntity.getDescription())
                .originalPrice(domainEntity.getOriginalPrice())
                .currentPrice(domainEntity.getCurrentPrice())
                .stockQuantity(domainEntity.getStockQuantity())
                .imageUrl(domainEntity.getImageUrl())
                .build();
    }
}
