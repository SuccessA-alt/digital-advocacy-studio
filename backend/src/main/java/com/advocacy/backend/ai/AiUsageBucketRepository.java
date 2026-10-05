package com.advocacy.backend.ai;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AiUsageBucketRepository
        extends JpaRepository<AiUsageBucket, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from AiUsageBucket b where b.id = :id")
    Optional<AiUsageBucket> findByIdForUpdate(@Param("id") String id);

    List<AiUsageBucket> findByIdNotAndLastUsedAtBefore(
            String id, Instant cutoff);
}