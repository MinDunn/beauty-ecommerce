package com.beauty.ecommerce.contact.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<ContactJpaEntity, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM ContactJpaEntity c WHERE c.createdAt >= :startDate")
    long countContactsSince(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM ContactJpaEntity c WHERE c.createdAt >= :startDate AND c.createdAt < :endDate")
    long countContactsBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
}
