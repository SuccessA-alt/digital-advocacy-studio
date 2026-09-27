package com.advocacy.backend.campaign;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CampaignVersionRepository
        extends JpaRepository<CampaignVersion, Long> {

    // Existing methods remain while CampaignService is being updated.
    List<CampaignVersion>
        findByCampaign_IdOrderByVersionNumberDesc(Long campaignId);

    Optional<CampaignVersion>
        findFirstByCampaign_IdOrderByVersionNumberDesc(Long campaignId);

    Optional<CampaignVersion>
        findByIdAndCampaign_Id(Long id, Long campaignId);

    void deleteByCampaign_Id(Long campaignId);

    @Query("""
            select v from CampaignVersion v
            where v.campaign.id = :campaignId
              and v.campaign.browserOwner.id = :ownerId
            order by v.versionNumber desc
            """)
    List<CampaignVersion> findAllOwnedByCampaignId(
            @Param("campaignId") Long campaignId,
            @Param("ownerId") Long ownerId
    );

    @Query("""
            select v from CampaignVersion v
            where v.id = :versionId
              and v.campaign.id = :campaignId
              and v.campaign.browserOwner.id = :ownerId
            """)
    Optional<CampaignVersion> findOwnedByIdAndCampaignId(
            @Param("versionId") Long versionId,
            @Param("campaignId") Long campaignId,
            @Param("ownerId") Long ownerId
    );
}