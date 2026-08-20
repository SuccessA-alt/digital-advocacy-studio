package com.advocacy.backend.campaign;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CampaignRequest {

    @NotBlank(message = "Campaign title is required")
    @Size(
            max = 120,
            message = "Campaign title must not exceed 120 characters"
    )
    private String title;

    @NotBlank(message = "Please describe the problem")
    @Size(
            max = 5000,
            message = "Problem description must not exceed 5000 characters"
    )
    private String problem;

    // The SDG is optional, but if supplied it must be positive.
    @Positive(message = "SDG ID must be a positive number")
    private Long sdgId;

    @NotBlank(message = "Please describe what you want to achieve")
    @Size(max = 5000)
    private String desiredOutcome;

    @NotBlank(message = "A core message is required")
    @Size(max = 5000)
    private String coreMessage;

    @NotBlank(message = "Please explain how the message will be shared")
    @Size(max = 5000)
    private String sharingMethod;

    @NotBlank(message = "Please identify who can make the change")
    @Size(
            max = 255,
            message = "Decision maker must not exceed 255 characters"
    )
    private String decisionMaker;

    @NotBlank(message = "Please describe your first move")
    @Size(max = 5000)
    private String firstMoves;

    @NotBlank(message = "Please explain how success will be measured")
    @Size(max = 5000)
    private String successMeasures;

    public CampaignRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public Long getSdgId() {
        return sdgId;
    }

    public void setSdgId(Long sdgId) {
        this.sdgId = sdgId;
    }

    public String getDesiredOutcome() {
        return desiredOutcome;
    }

    public void setDesiredOutcome(String desiredOutcome) {
        this.desiredOutcome = desiredOutcome;
    }

    public String getCoreMessage() {
        return coreMessage;
    }

    public void setCoreMessage(String coreMessage) {
        this.coreMessage = coreMessage;
    }

    public String getSharingMethod() {
        return sharingMethod;
    }

    public void setSharingMethod(String sharingMethod) {
        this.sharingMethod = sharingMethod;
    }

    public String getDecisionMaker() {
        return decisionMaker;
    }

    public void setDecisionMaker(String decisionMaker) {
        this.decisionMaker = decisionMaker;
    }

    public String getFirstMoves() {
        return firstMoves;
    }

    public void setFirstMoves(String firstMoves) {
        this.firstMoves = firstMoves;
    }

    public String getSuccessMeasures() {
        return successMeasures;
    }

    public void setSuccessMeasures(String successMeasures) {
        this.successMeasures = successMeasures;
    }
}