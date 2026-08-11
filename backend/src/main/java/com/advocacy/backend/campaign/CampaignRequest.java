package com.advocacy.backend.campaign;

public class CampaignRequest {

    private String title;
    private String problem;

    // Optional: this can be null if the user skips the SDG step
    private Long sdgId;

    private String desiredOutcome;
    private String coreMessage;
    private String sharingMethod;
    private String decisionMaker;
    private String firstMoves;
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
