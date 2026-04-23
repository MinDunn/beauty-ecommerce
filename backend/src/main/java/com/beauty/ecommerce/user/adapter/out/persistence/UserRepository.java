package com.beauty.ecommerce.user.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserJpaEntity, Long> {
    Optional<UserJpaEntity> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM UserJpaEntity u WHERE u.createdAt >= :startDate")
    long countUsersSince(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM UserJpaEntity u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate")
    long countUsersBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
}
