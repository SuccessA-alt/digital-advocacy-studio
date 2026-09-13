package com.advocacy.backend.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CampaignDraftRequest(
        @NotBlank(message = "Please describe the problem")
        @Size(
                max = 5000,
                message = "Problem description must not exceed 5000 characters"
        )
        String problem,

        @Positive(message = "SDG ID must be a positive number")
        Long sdgId
) {
}