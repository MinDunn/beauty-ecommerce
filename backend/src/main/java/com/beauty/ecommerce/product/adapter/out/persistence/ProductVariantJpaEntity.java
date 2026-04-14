package com.beauty.ecommerce.product.adapter.out.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "product_id", nullable = false)
    private ProductJpaEntity product;

    private String variantName;
    
    private BigDecimal price;
    
    @jakarta.persistence.Column(name = "image_url")
    private String imageUrl;

    @jakarta.persistence.Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 0;
}
