package com.beauty.ecommerce.cart.adapter.out.persistence;

import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductJpaEntity product;

    private String variantName;

    private Integer quantity;
}
