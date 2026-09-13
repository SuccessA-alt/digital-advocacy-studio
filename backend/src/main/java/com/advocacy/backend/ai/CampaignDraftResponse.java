package com.advocacy.backend.ai;

public record CampaignDraftResponse(
        String title,
        String desiredOutcome,
        String coreMessage,
        String decisionMaker,
        String advocacyPlan,
        String successMeasures
) {
}