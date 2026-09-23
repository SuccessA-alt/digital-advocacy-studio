package com.advocacy.backend.browser;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "browser_owners")
public class BrowserOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64,
            updatable = false
    )
    private String tokenHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_used_at", nullable = false)
    private Instant lastUsedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected BrowserOwner() {
        // Required by the database persistence framework.
    }

    public BrowserOwner(
            String tokenHash,
            Instant createdAt,
            Instant expiresAt) {

        if (tokenHash == null
                || !tokenHash.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException(
                    "A valid token hash is required"
            );
        }

        if (createdAt == null
                || expiresAt == null
                || !expiresAt.isAfter(createdAt)) {
            throw new IllegalArgumentException(
                    "Expiry must be after the creation time"
            );
        }

        this.tokenHash = tokenHash;
        this.createdAt = createdAt;
        this.lastUsedAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}