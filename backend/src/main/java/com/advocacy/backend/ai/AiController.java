package com.advocacy.backend.ai;

import com.advocacy.backend.campaign.CampaignRequest;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final OpenAiService openAiService;

    public AiController(
            OpenAiService openAiService) {

        this.openAiService = openAiService;
    }

    @PostMapping("/draft")
public CampaignDraftResponse draftCampaign(
        @Valid @RequestBody CampaignDraftRequest request) {

    return openAiService.draftCampaign(request);
}

    @PostMapping("/review")
    public Map<String, String> reviewCampaign(
            @Valid @RequestBody
            CampaignRequest campaign) {

        String review =
                openAiService.reviewCampaign(campaign);

        return Map.of(
                "review",
                review
        );
    }
}
