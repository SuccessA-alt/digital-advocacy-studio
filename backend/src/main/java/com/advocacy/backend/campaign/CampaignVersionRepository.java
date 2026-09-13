package com.advocacy.backend.campaign;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CampaignVersionRepository
        extends JpaRepository<CampaignVersion, Long> {

    List<CampaignVersion>
        findByCampaign_IdOrderByVersionNumberDesc(Long campaignId);

    Optional<CampaignVersion>
        findFirstByCampaign_IdOrderByVersionNumberDesc(Long campaignId);

    Optional<CampaignVersion>
        findByIdAndCampaign_Id(Long id, Long campaignId);

    void deleteByCampaign_Id(Long campaignId);
}