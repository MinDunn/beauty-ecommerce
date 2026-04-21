package com.beauty.ecommerce.inventory.adapter.out.persistence;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_adjustments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAdjustmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_name")
    private String variantName;

    @Column(nullable = false)
    private Integer quantity; // Negative for decrease, positive for increase

    @Column(nullable = false)
    private String reason; // Hết hạn, Hư hỏng, Mất mát, ...

    @Column(name = "compensation_amount")
    private BigDecimal compensationAmount; // Tiền đền bù nếu có

    @Column(name = "estimated_loss_amount")
    private BigDecimal estimatedLossAmount; // Giá trị thiệt hại dự kiến (vốn)

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks; // Ghi chú chi tiết không bắt buộc
}
