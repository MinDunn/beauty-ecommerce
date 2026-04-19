package com.beauty.ecommerce.banner.adapter.out.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
public class BannerJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", length = 1000, nullable = false)
    private String imageUrl;

    private String title;
    private String campaign;
    
    @Column(columnDefinition = "TEXT")
    private String subtitle;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "display_order")
    private int displayOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
