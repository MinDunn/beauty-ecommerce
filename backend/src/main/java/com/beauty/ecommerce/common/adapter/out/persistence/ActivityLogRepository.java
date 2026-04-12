package com.beauty.ecommerce.common.adapter.out.persistence;

import com.beauty.ecommerce.common.domain.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();
}
