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

    // Spring gives the service both repositories
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

        // Create a new Campaign entity
        Campaign campaign = new Campaign();

        // Copy the user's answers from the request into the entity
        campaign.setTitle(request.getTitle());
        campaign.setProblem(request.getProblem());
        campaign.setDesiredOutcome(request.getDesiredOutcome());
        campaign.setCoreMessage(request.getCoreMessage());
        campaign.setSharingMethod(request.getSharingMethod());
        campaign.setDecisionMaker(request.getDecisionMaker());
        campaign.setFirstMoves(request.getFirstMoves());
        campaign.setSuccessMeasures(request.getSuccessMeasures());

        // The SDG is optional
        if (request.getSdgId() != null) {

            // Look for the selected SDG in PostgreSQL
            Sdg sdg = sdgRepository.findById(request.getSdgId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("SDG not found"));

            // Connect the campaign to that SDG
            campaign.setSdg(sdg);
        }

        // Save the completed campaign into PostgreSQL
        return campaignRepository.save(campaign);
    }
}