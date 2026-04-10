package com.beauty.ecommerce.order.adapter.out.persistence;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    @Column(nullable = false)
    private String discountType; // PERCENTAGE, FIXED
    
    @Column(nullable = false)
    private BigDecimal discountValue;
    
    private BigDecimal minOrderAmount;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
