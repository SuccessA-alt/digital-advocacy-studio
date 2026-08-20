package com.advocacy.backend.campaign;

import com.advocacy.backend.sdg.Sdg;
import com.advocacy.backend.sdg.SdgRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final SdgRepository sdgRepository;

    public CampaignService(
            CampaignRepository campaignRepository,
            SdgRepository sdgRepository) {

        this.campaignRepository = campaignRepository;
        this.sdgRepository = sdgRepository;
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Optional<Campaign> getCampaignById(Long id) {
        return campaignRepository.findById(id);
    }

    public Campaign createCampaign(CampaignRequest request) {
        Campaign campaign = new Campaign();

        copyRequestToCampaign(request, campaign);

        return campaignRepository.save(campaign);
    }

    public Optional<Campaign> updateCampaign(
            Long id,
            CampaignRequest request) {

        Optional<Campaign> existingCampaign =
                campaignRepository.findById(id);

        if (existingCampaign.isEmpty()) {
            return Optional.empty();
        }

        Campaign campaign = existingCampaign.get();

        copyRequestToCampaign(request, campaign);

        Campaign updatedCampaign =
                campaignRepository.save(campaign);

        return Optional.of(updatedCampaign);
    }

    public boolean deleteCampaign(Long id) {

        if (!campaignRepository.existsById(id)) {
            return false;
        }

        campaignRepository.deleteById(id);

        return true;
    }

    private void copyRequestToCampaign(
            CampaignRequest request,
            Campaign campaign) {

        campaign.setTitle(request.getTitle());
        campaign.setProblem(request.getProblem());
        campaign.setDesiredOutcome(request.getDesiredOutcome());
        campaign.setCoreMessage(request.getCoreMessage());
        campaign.setSharingMethod(request.getSharingMethod());
        campaign.setDecisionMaker(request.getDecisionMaker());
        campaign.setFirstMoves(request.getFirstMoves());
        campaign.setSuccessMeasures(request.getSuccessMeasures());

        if (request.getSdgId() != null) {
            Sdg sdg = sdgRepository
                    .findById(request.getSdgId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("SDG not found"));

            campaign.setSdg(sdg);
        } else {
            campaign.setSdg(null);
        }
    }
}