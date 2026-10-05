package com.advocacy.backend.ai;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_usage_buckets",
        indexes = @Index(name = "idx_ai_usage_last_used", columnList = "last_used_at"))
public class AiUsageBucket {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "last_used_at", nullable = false)
    private Instant lastUsedAt;

    @ElementCollection
    @CollectionTable(
            name = "ai_usage_requests",
            joinColumns = @JoinColumn(name = "bucket_id")
    )
    @Column(name = "requested_at", nullable = false)
    private List<Instant> requestTimes = new ArrayList<>();

    protected AiUsageBucket() {
    }

    public AiUsageBucket(String id, Instant now) {
        this.id = id;
        this.lastUsedAt = now;
    }

    public String getId() {
        return id;
    }

    public List<Instant> getRequestTimes() {
        return requestTimes;
    }

    public void discardExpired(Instant cutoff) {
        requestTimes.removeIf(time -> !time.isAfter(cutoff));
    }

    public void recordRequest(Instant now) {
        requestTimes.add(now);
        lastUsedAt = now;
    }
}
