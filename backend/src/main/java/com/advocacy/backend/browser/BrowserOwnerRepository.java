package com.advocacy.backend.browser;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface BrowserOwnerRepository
        extends JpaRepository<BrowserOwner, Long> {

    Optional<BrowserOwner> findByTokenHashAndExpiresAtAfter(
            String tokenHash,
            Instant now
    );
}