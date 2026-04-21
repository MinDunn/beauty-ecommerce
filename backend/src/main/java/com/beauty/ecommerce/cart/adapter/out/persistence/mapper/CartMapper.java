package com.beauty.ecommerce.cart.adapter.out.persistence.mapper;

import com.beauty.ecommerce.cart.adapter.out.persistence.CartItemJpaEntity;
import com.beauty.ecommerce.cart.domain.entity.CartItem;
import org.springframework.stereotype.Component;

@Component
public class CartMapper {

    public CartItem mapToDomainEntity(CartItemJpaEntity jpaEntity) {
        Integer stock = jpaEntity.getProduct().getStockQuantity();
        if (jpaEntity.getVariantName() != null && jpaEntity.getProduct().getVariants() != null) {
            stock = jpaEntity.getProduct().getVariants().stream()
                    .filter(v -> v.getVariantName().equals(jpaEntity.getVariantName()))
                    .findFirst()
                    .map(v -> v.getStockQuantity())
                    .orElse(0);
        }

        return CartItem.builder()
                .id(jpaEntity.getId())
                .userId(jpaEntity.getUser().getId())
                .productId(jpaEntity.getProduct().getId())
                .productName(jpaEntity.getProduct().getName())
                .productImageUrl(jpaEntity.getProduct().getImageUrl())
                .variantName(jpaEntity.getVariantName())
                .price(jpaEntity.getProduct().getCurrentPrice())
                .quantity(jpaEntity.getQuantity())
                .stockQuantity(stock)
                .build();
    }
}
