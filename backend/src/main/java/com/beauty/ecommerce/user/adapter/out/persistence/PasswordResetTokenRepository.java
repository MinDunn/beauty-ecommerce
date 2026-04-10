package com.beauty.ecommerce.user.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenJpaEntity, Long> {
    Optional<PasswordResetTokenJpaEntity> findByToken(String token);
    Optional<PasswordResetTokenJpaEntity> findByUser(UserJpaEntity user);
    void deleteByUser(UserJpaEntity user);
}
