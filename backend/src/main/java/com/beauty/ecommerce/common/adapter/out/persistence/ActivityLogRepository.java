package com.beauty.ecommerce.common.adapter.out.persistence;

import com.beauty.ecommerce.common.domain.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();
    
    List<ActivityLog> findByActionGroupOrderByCreatedAtDesc(String actionGroup);

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(:group IS NULL OR a.actionGroup = :group) AND " +
           "(LOWER(a.userEmail) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.actionType) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.createdAt DESC")
    List<ActivityLog> searchActivities(@Param("group") String group, @Param("query") String query);
}
