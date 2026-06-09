package com.SecureVaultVitosha.Vitosha_eLando_Project;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ResetTokenRepository extends JpaRepository<ResetToken, Long> {
    Optional<ResetToken> findByToken(String token);
    void deleteByUser(User user);
}