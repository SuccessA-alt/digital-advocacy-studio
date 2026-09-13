package com.advocacy.backend.campaign;

import com.advocacy.backend.sdg.SdgRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignVersionRepository campaignVersionRepository;
    private final SdgRepository sdgRepository;

    public CampaignService(
            CampaignRepository campaignRepository,
            CampaignVersionRepository campaignVersionRepository,
            SdgRepository sdgRepository) {

        this.campaignRepository = campaignRepository;
        this.campaignVersionRepository = campaignVersionRepository;
        this.sdgRepository = sdgRepository;
    }

    @Transactional(readOnly = true)
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Campaign> getCampaignById(Long id) {
        return campaignRepository.findById(id);
    }

    @Transactional
    public Campaign createCampaign(CampaignRequest request) {
        Campaign campaign = new Campaign();
        copyRequestToCampaign(request, campaign);

        Campaign savedCampaign =
                campaignRepository.saveAndFlush(campaign);

        campaignVersionRepository.save(
                new CampaignVersion(savedCampaign, 1)
        );

        return savedCampaign;
    }

    @Transactional
    public Optional<Campaign> updateCampaign(
            Long id,
            CampaignRequest request) {

        Optional<Campaign> existingCampaign =
                campaignRepository.findByIdForUpdate(id);

        if (existingCampaign.isEmpty()) {
            return Optional.empty();
        }

        Campaign campaign = existingCampaign.get();

        int latestVersionNumber = campaignVersionRepository
                .findFirstByCampaign_IdOrderByVersionNumberDesc(id)
                .map(CampaignVersion::getVersionNumber)
                .orElse(0);

        // Preserve campaigns saved before version history was added.
        if (latestVersionNumber == 0) {
            campaignVersionRepository.save(
                    new CampaignVersion(campaign, 1)
            );
            latestVersionNumber = 1;
        }

        copyRequestToCampaign(request, campaign);

        Campaign savedCampaign =
                campaignRepository.saveAndFlush(campaign);

        campaignVersionRepository.save(
                new CampaignVersion(
                        savedCampaign,
                        latestVersionNumber + 1
                )
        );

        return Optional.of(savedCampaign);
    }

    @Transactional(readOnly = true)
    public Optional<List<CampaignVersion>> getCampaignVersions(
            Long campaignId) {

        if (!campaignRepository.existsById(campaignId)) {
            return Optional.empty();
        }

        return Optional.of(
                campaignVersionRepository
                        .findByCampaign_IdOrderByVersionNumberDesc(campaignId)
        );
    }

    @Transactional(readOnly = true)
    public Optional<CampaignVersion> getCampaignVersion(
            Long campaignId,
            Long versionId) {

        return campaignVersionRepository
                .findByIdAndCampaign_Id(versionId, campaignId);
    }

    @Transactional
    public boolean deleteCampaign(Long id) {
        Optional<Campaign> campaign =
                campaignRepository.findByIdForUpdate(id);

        if (campaign.isEmpty()) {
            return false;
        }

        // Deleting a whole campaign also removes its versions.
        campaignVersionRepository.deleteByCampaign_Id(id);
        campaignVersionRepository.flush();

        campaignRepository.delete(campaign.get());
        return true;
    }

    private void copyRequestToCampaign(
            CampaignRequest request,
            Campaign campaign) {

        campaign.setTitle(request.getTitle());
        campaign.setProblem(request.getProblem());
        campaign.setDesiredOutcome(request.getDesiredOutcome());
        campaign.setCoreMessage(request.getCoreMessage());

        if (request.getSharingMethod() != null) {
            campaign.setSharingMethod(request.getSharingMethod());
        } else if (campaign.getSharingMethod() == null) {
            campaign.setSharingMethod("");
        }

        campaign.setDecisionMaker(request.getDecisionMaker());
        campaign.setAdvocacyPlan(request.getAdvocacyPlan());
        campaign.setSuccessMeasures(request.getSuccessMeasures());

        campaign.setSdg(
                request.getSdgId() == null
                        ? null
                        : sdgRepository.findById(request.getSdgId())
                                .orElseThrow(() ->
                                        new IllegalArgumentException(
                                                "SDG not found"
                                        )
                                )
        );
    }
}