package com.beauty.ecommerce.product.adapter.out.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Double discountValue;

    @Column(nullable = false)
    private String discountType; // PERCENTAGE or FIXED

    private Double minOrderValue;

    private Double maxDiscount;

    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Integer usageLimit;

    @Column(nullable = false)
    private Integer usageCount;

    @Column(nullable = false)
    private Boolean active;
}
