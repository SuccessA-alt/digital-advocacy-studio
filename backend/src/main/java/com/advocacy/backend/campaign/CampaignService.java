package com.advocacy.backend.campaign;

import com.advocacy.backend.sdg.SdgRepository;
import com.advocacy.backend.user.AppUser;
import com.advocacy.backend.user.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignVersionRepository campaignVersionRepository;
    private final SdgRepository sdgRepository;
    private final AppUserRepository users;

    public CampaignService(
            CampaignRepository campaignRepository,
            CampaignVersionRepository campaignVersionRepository,
            SdgRepository sdgRepository,
            AppUserRepository users) {
        this.campaignRepository = campaignRepository;
        this.campaignVersionRepository = campaignVersionRepository;
        this.sdgRepository = sdgRepository;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public Campaign buildDraft(CampaignRequest request) {
        Campaign draft = new Campaign();
        copyRequestToCampaign(request, draft);
        return draft;
    }

    @Transactional(readOnly = true)
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findByOwner_IdOrderByUpdatedAtDesc(
                requireAccount().getId()
        );
    }

    @Transactional(readOnly = true)
    public Optional<Campaign> getCampaignById(Long id) {
        return campaignRepository.findByIdAndOwner_Id(
                id, requireAccount().getId()
        );
    }

    @Transactional
    public Campaign createCampaign(CampaignRequest request) {
        AppUser owner = requireAccount();

        Campaign campaign = new Campaign();
        campaign.setOwner(owner);
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
                campaignRepository.findByIdForUpdate(
                        id, requireAccount().getId()
                );

        if (existingCampaign.isEmpty()) {
            return Optional.empty();
        }

        Campaign campaign = existingCampaign.get();

        int latestVersionNumber = campaignVersionRepository
                .findFirstByCampaign_IdOrderByVersionNumberDesc(id)
                .map(CampaignVersion::getVersionNumber)
                .orElse(0);

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
                new CampaignVersion(savedCampaign, latestVersionNumber + 1)
        );

        return Optional.of(savedCampaign);
    }

    @Transactional(readOnly = true)
    public Optional<List<CampaignVersion>> getCampaignVersions(
            Long campaignId) {
        if (!campaignRepository.existsByIdAndOwner_Id(
                campaignId, requireAccount().getId())) {
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
        if (!campaignRepository.existsByIdAndOwner_Id(
                campaignId, requireAccount().getId())) {
            return Optional.empty();
        }

        return campaignVersionRepository
                .findByIdAndCampaign_Id(versionId, campaignId);
    }

    @Transactional
    public boolean deleteCampaign(Long id) {
        Optional<Campaign> campaign =
                campaignRepository.findByIdForUpdate(
                        id, requireAccount().getId()
                );

        if (campaign.isEmpty()) {
            return false;
        }

        campaignVersionRepository.deleteByCampaign_Id(id);
        campaignVersionRepository.flush();
        campaignRepository.delete(campaign.get());

        return true;
    }

    private AppUser requireAccount() {
        var authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof OidcUser user)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please sign in."
            );
        }

        return users.findByGoogleSubject(user.getSubject())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Please sign in again."
                ));
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
                                        new IllegalArgumentException("SDG not found")
                                )
        );
    }
}