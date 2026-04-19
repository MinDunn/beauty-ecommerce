package com.beauty.ecommerce.banner.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<BannerJpaEntity, Long> {
    List<BannerJpaEntity> findByIsActiveOrderByDisplayOrderAsc(boolean isActive);
}
