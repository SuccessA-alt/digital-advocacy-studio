package com.advocacy.backend.campaign;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CampaignRequest {
    @NotBlank(message = "Campaign title is required")
    @Size(max = 120)
    private String title;

    @NotBlank(message = "Please describe the problem")
    @Size(max = 5000)
    private String problem;

    @NotBlank(message = "Please describe what you want to achieve")
    @Size(max = 5000)
    private String desiredOutcome;

    @NotBlank(message = "A core message is required")
    @Size(max = 5000)
    private String coreMessage;

    @Size(max = 5000)
    private String sharingMethod;

    @NotBlank(message = "Please identify who can make the change")
    @Size(max = 255)
    private String decisionMaker;

   @NotBlank(message = "Please describe your advocacy plan")
   @Size(max = 10000)
   private String advocacyPlan;

    @NotBlank(message = "Please explain how success will be measured")
    @Size(max = 5000)
    private String successMeasures;

    @Positive(message = "SDG ID must be a positive number")
    private Long sdgId;

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getProblem() { return problem; }

    public void setProblem(String problem) { this.problem = problem; }

    public String getDesiredOutcome() { return desiredOutcome; }

    public void setDesiredOutcome(String desiredOutcome) { this.desiredOutcome = desiredOutcome; }

    public String getCoreMessage() { return coreMessage; }

    public void setCoreMessage(String coreMessage) { this.coreMessage = coreMessage; }

    public String getSharingMethod() { return sharingMethod; }

    public void setSharingMethod(String sharingMethod) { this.sharingMethod = sharingMethod; }

    public String getDecisionMaker() { return decisionMaker; }

    public void setDecisionMaker(String decisionMaker) { this.decisionMaker = decisionMaker; }

    public String getAdvocacyPlan() { return advocacyPlan; }

    public void setAdvocacyPlan(String advocacyPlan) { this.advocacyPlan = advocacyPlan; }

    public String getSuccessMeasures() { return successMeasures; }

    public void setSuccessMeasures(String successMeasures) { this.successMeasures = successMeasures; }

    public Long getSdgId() { return sdgId; }

    public void setSdgId(Long sdgId) { this.sdgId = sdgId; }

}
