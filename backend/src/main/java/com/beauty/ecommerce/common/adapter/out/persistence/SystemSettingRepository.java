package com.beauty.ecommerce.common.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSettingJpaEntity, Long> {
    Optional<SystemSettingJpaEntity> findByKey(String key);
}
