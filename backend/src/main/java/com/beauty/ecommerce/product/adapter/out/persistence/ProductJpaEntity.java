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
import java.time.LocalDateTime;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private String description;
    
    private BigDecimal originalPrice;
    
    private BigDecimal currentPrice;
    
    private Integer stockQuantity;
    
    private String imageUrl;

    @jakarta.persistence.Column(name = "category_id")
    private Long categoryId;

    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String instructions;

    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String ingredients;

    @jakarta.persistence.Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @jakarta.persistence.Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @jakarta.persistence.Column(name = "sold")
    @Builder.Default
    private Integer sold = 0;

    @jakarta.persistence.Column(name = "skin_type")
    private String skinType;

    @jakarta.persistence.Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, HIDDEN, DISCONTINUED

    @Formula("case when stock_quantity > 0 then 1 else 0 end")
    private int availabilityPriority;

    @jakarta.persistence.Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @jakarta.persistence.OneToMany(mappedBy = "product", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.LAZY)
    private java.util.List<ProductImageJpaEntity> images;

    @jakarta.persistence.OneToMany(mappedBy = "product", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.LAZY)
    private java.util.List<ProductVariantJpaEntity> variants;
}
