package com.advocacy.backend.campaign;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(
            @RequestBody CampaignRequest request) {

        Campaign createdCampaign =
                campaignService.createCampaign(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdCampaign);
    }

@GetMapping("/{id}")
public ResponseEntity<Campaign> getCampaignById(@PathVariable Long id) {

    return campaignService.getCampaignById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
}

@GetMapping
public List<Campaign> getAllCampaigns() {
    return campaignService.getAllCampaigns();
}
}