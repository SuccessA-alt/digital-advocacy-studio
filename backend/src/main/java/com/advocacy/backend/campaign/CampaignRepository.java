package com.advocacy.backend.campaign;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    // Retained until CampaignService is connected to browser ownership.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Campaign c where c.id = :id")
    Optional<Campaign> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select c from Campaign c
            where c.browserOwner.id = :ownerId
            """)
    List<Campaign> findAllOwnedBy(@Param("ownerId") Long ownerId);

    @Query("""
            select c from Campaign c
            where c.id = :id
              and c.browserOwner.id = :ownerId
            """)
    Optional<Campaign> findOwnedById(
            @Param("id") Long id,
            @Param("ownerId") Long ownerId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select c from Campaign c
            where c.id = :id
              and c.browserOwner.id = :ownerId
            """)
    Optional<Campaign> findOwnedByIdForUpdate(
            @Param("id") Long id,
            @Param("ownerId") Long ownerId
    );
}